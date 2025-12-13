

// Voice ID Mapping for African Dialects
// In a real scenario, these would be custom cloned voices for accuracy.
// These are placeholder IDs from ElevenLabs public library that "sound" closest or are generic.
export const DIALECT_VOICE_MAP: Record<string, Record<string, string>> = {
    // Yoruba Dialects
    'yoruba': {
        'default': '9Dbo4hEvXQ5l7MXGZFQA', // Olufunmilola (User's original)
        'lagos': 'ErXwobaYiN019PkySvjV',   // Urban/Fast (Placeholder: Antoni)
        'ibadan': 'EXAVITQu4vr4xnSDxMaL',  // Formal/Soft (Placeholder: Bella)
        'abeokuta': 'TxGEqnHWrfWFTfGW9XjX' // Rural/Deep (Placeholder: Josh)
    },
    // Twi Dialects
    'twi': {
        'default': '21m00Tcm4TlvDq8ikWAM', // Rachel
        'asante': '21m00Tcm4TlvDq8ikWAM',  // Asante (Placeholder)
        'akuapem': 'AZnzlk1XvdvUeBnXmlld'  // Akuapem (Placeholder: Domi)
    },
    // Swahili Dialects
    'swahili': {
        'default': 'kgG7dCoKCfLehAPWkJOE', // Fin
        'kenyan': 'kgG7dCoKCfLehAPWkJOE',  // Kenyan
        'tanzanian': 'MF3mGyEYCl7XYWbV9V6O' // Tanzanian (Placeholder: Elli)
    }
};

export const ttsAgent = {
    /**
     * Generate speech from text using ElevenLabs with dialect support.
     * @param text The text to speak
     * @param language The target language (e.g., 'yoruba', 'twi')
     * @param dialect Optional dialect (e.g., 'lagos', 'asante')
     * @param gender Optional gender preference (not fully implemented in mapping yet)
     */
    generateAudio: async (
        text: string,
        language: string,
        dialect: string = 'default',
        gender?: 'male' | 'female'
    ): Promise<{ audioData: string | null; error?: string }> => {
        try {
            const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
            if (!apiKey) {
                console.error("TTS Error: ELEVENLABS_API_KEY is missing");
                return { audioData: null, error: "Server configuration error: Missing TTS API Key" };
            }

            // Normalize inputs
            const langKey = language.toLowerCase();
            const dialectKey = dialect.toLowerCase();

            // Resolve Voice ID
            let voiceId = DIALECT_VOICE_MAP[langKey]?.[dialectKey] ||
                DIALECT_VOICE_MAP[langKey]?.['default'] ||
                DIALECT_VOICE_MAP['yoruba']['default']; // Fallback to Olufunmilola

            console.log(`TTS: Using Voice ID ${voiceId} for ${language} (${dialect})`);

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        use_speaker_boost: true
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ElevenLabs API Error: ${response.status} - ${errorText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Audio = buffer.toString('base64');

            return { audioData: base64Audio };

        } catch (error: any) {
            console.error("TTS Agent Error:", error);
            return { audioData: null, error: error.message };
        }
    }
};
