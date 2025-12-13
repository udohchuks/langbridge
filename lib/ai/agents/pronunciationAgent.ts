export interface PhonemeIssue {
    phoneme: string;
    userPronounced: string;
    tip: string;
    start?: number;
    end?: number;
}

export interface SpeechEvaluationResult {
    transcript: string;
    phonemes: string;
    accuracy: number;
    issues: PhonemeIssue[];
    error?: string;
    toneScore?: number;
    rhythmScore?: number;
    dialectFeedback?: string;
}

// Simple text similarity function using Levenshtein distance
function calculateSimilarity(a: string, b: string): number {
    const aLower = a.toLowerCase().trim();
    const bLower = b.toLowerCase().trim();

    if (aLower === bLower) return 100;
    if (aLower.length === 0 || bLower.length === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= bLower.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= aLower.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= bLower.length; i++) {
        for (let j = 1; j <= aLower.length; j++) {
            if (bLower.charAt(i - 1) === aLower.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    const distance = matrix[bLower.length][aLower.length];
    const maxLength = Math.max(aLower.length, bLower.length);
    return Math.round((1 - distance / maxLength) * 100);
}

// Identify word differences between expected and spoken
function identifyIssues(expected: string, spoken: string): PhonemeIssue[] {
    const expectedWords = expected.toLowerCase().trim().split(/\s+/);
    const spokenWords = spoken.toLowerCase().trim().split(/\s+/);
    const issues: PhonemeIssue[] = [];

    expectedWords.forEach((expectedWord, index) => {
        const spokenWord = spokenWords[index] || "";
        if (expectedWord !== spokenWord && spokenWord) {
            issues.push({
                phoneme: expectedWord,
                userPronounced: spokenWord,
                tip: `Try pronouncing "${expectedWord}" more clearly. You said "${spokenWord}".`
            });
        } else if (!spokenWord) {
            issues.push({
                phoneme: expectedWord,
                userPronounced: "(missing)",
                tip: `The word "${expectedWord}" was not detected. Make sure to say all words clearly.`
            });
        }
    });

    return issues;
}

// Basic phoneme estimation for African languages
// This provides approximate IPA-like representations
function estimatePhonemes(text: string, language: string): string {
    const normalized = text.toLowerCase().trim();

    // Common African language phoneme mappings
    const phonemeMap: Record<string, string> = {
        // Yoruba special characters
        'ẹ': 'ɛ', 'ọ': 'ɔ', 'ṣ': 'ʃ',
        // Common digraphs
        'sh': 'ʃ', 'ch': 'tʃ', 'gh': 'ɣ', 'ny': 'ɲ', 'ng': 'ŋ',
        'gb': 'g͡b', 'kp': 'k͡p', 'dz': 'd͡z', 'ts': 't͡s',
        // Vowels
        'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
        'aa': 'aː', 'ee': 'eː', 'ii': 'iː', 'oo': 'oː', 'uu': 'uː',
        // Consonants (mostly unchanged)
        'b': 'b', 'd': 'd', 'f': 'f', 'g': 'g', 'h': 'h',
        'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n',
        'p': 'p', 'r': 'r', 's': 's', 't': 't', 'v': 'v',
        'w': 'w', 'y': 'j', 'z': 'z',
    };

    let result = normalized;

    // Apply digraph replacements first (longer patterns first)
    const sortedKeys = Object.keys(phonemeMap).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        result = result.replace(new RegExp(key, 'g'), phonemeMap[key]);
    }

    // Clean up spaces and punctuation
    result = result.replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();

    return result;
}

export const pronunciationAgent = {
    evaluateSpeech: async (
        audioBase64: string,
        expectedText: string,
        language: string,
        mimeType: string = "audio/webm",
        dialect: string = "standard"
    ): Promise<SpeechEvaluationResult> => {
        try {
            const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

            if (!apiKey) {
                console.error("[PronunciationAgent] ELEVENLABS_API_KEY is not set");
                return {
                    transcript: "",
                    phonemes: "",
                    accuracy: 0,
                    issues: [],
                    error: "Speech evaluation not configured. Missing API key."
                };
            }

            console.log(`[PronunciationAgent] Starting ElevenLabs evaluation`);
            console.log(`[PronunciationAgent] Expected: "${expectedText}", Language: ${language}`);
            console.log(`[PronunciationAgent] Audio MIME: ${mimeType}, Base64 length: ${audioBase64.length}`);

            // Convert base64 to buffer and create form data
            const audioBuffer = Buffer.from(audioBase64, 'base64');

            // Create FormData with the audio file
            const formData = new FormData();
            const audioBlob = new Blob([audioBuffer], { type: mimeType });

            // Determine file extension from MIME type
            let fileExt = "webm";
            if (mimeType.includes("mp3") || mimeType.includes("mpeg")) fileExt = "mp3";
            else if (mimeType.includes("ogg")) fileExt = "ogg";
            else if (mimeType.includes("wav")) fileExt = "wav";
            else if (mimeType.includes("mp4")) fileExt = "mp4";

            formData.append('file', audioBlob, `recording.${fileExt}`);
            formData.append('model_id', 'scribe_v1');

            // Optional: Set language code for better transcription
            // ElevenLabs uses ISO language codes
            const langCodeMap: Record<string, string> = {
                'yoruba': 'yo',
                'twi': 'tw',
                'swahili': 'sw',
                'igbo': 'ig',
                'hausa': 'ha',
                'zulu': 'zu',
                'amharic': 'am',
                'english': 'en'
            };
            const langCode = langCodeMap[language.toLowerCase()] || 'en';
            formData.append('language_code', langCode);

            console.log(`[PronunciationAgent] Sending to ElevenLabs Scribe API...`);

            const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[PronunciationAgent] ElevenLabs API error: ${response.status} - ${errorText}`);
                return {
                    transcript: "",
                    phonemes: "",
                    accuracy: 0,
                    issues: [],
                    error: `Speech transcription failed: ${response.status} - ${errorText.substring(0, 100)}`
                };
            }

            const data = await response.json();
            const transcript = data.text || "";

            console.log(`[PronunciationAgent] Transcribed: "${transcript}"`);

            if (!transcript) {
                return {
                    transcript: "",
                    phonemes: "",
                    accuracy: 0,
                    issues: [],
                    error: "Could not understand the speech. Please speak more clearly and try again."
                };
            }

            // Calculate accuracy based on text similarity
            const accuracy = calculateSimilarity(expectedText, transcript);

            // Identify specific issues
            const issues = identifyIssues(expectedText, transcript);

            // Generate simple feedback
            let dialectFeedback = "";
            if (accuracy >= 90) {
                dialectFeedback = "Excellent pronunciation! Your speech closely matches the expected text.";
            } else if (accuracy >= 70) {
                dialectFeedback = "Good attempt! There are a few words that need improvement.";
            } else if (accuracy >= 50) {
                dialectFeedback = "Keep practicing! Focus on pronouncing each word clearly.";
            } else {
                dialectFeedback = "Try again and speak slowly. Make sure you're saying the correct phrase.";
            }

            console.log(`[PronunciationAgent] Accuracy: ${accuracy}%, Issues: ${issues.length}`);

            // Generate phoneme representation
            const phonemes = estimatePhonemes(transcript, language);

            return {
                transcript,
                phonemes,
                accuracy,
                issues,
                toneScore: accuracy, // Simplified: using same score
                rhythmScore: accuracy,
                dialectFeedback
            };

        } catch (error: any) {
            console.error("[PronunciationAgent] Error:", error);
            return {
                transcript: "",
                phonemes: "",
                accuracy: 0,
                issues: [],
                error: `Speech evaluation failed: ${error.message || "Unknown error"}`
            };
        }
    },

    generatePhonemes: async (text: string, language: string): Promise<{ ipa: string; syllables: string[]; tone: string }> => {
        // This would require a phonetic dictionary or another service
        // For now, return a simplified response
        const syllables = text.split(/\s+/);
        return {
            ipa: "", // Would need a phonetic dictionary
            syllables,
            tone: "standard"
        };
    }
};

