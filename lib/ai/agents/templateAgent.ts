
import { getGenerativeClient } from '../googleClient';
import { LessonTemplate } from '@/lib/logic/templates';
import { PersonalizationContext, personalizeText } from '@/lib/logic/personalization';

interface TranslatedLessonData {
    vocabulary: {
        native: string;
        pronunciation: string;
        english: string;
    }[];
    keyPhrases: {
        native: string;
        pronunciation: string;
        english: string; // The natural meaning
    }[];
    culturalNotes: {
        title: string;
        description: string;
        pronunciation: string; // Optional keyword pronunciation
    }[];
}

export const templateAgent = {
    translateLesson: async (
        template: LessonTemplate,
        context: PersonalizationContext
    ): Promise<TranslatedLessonData> => {
        const client = getGenerativeClient();

        // 1. Personalize the English content first (if any English content needs personalization before translation)
        // Most vocabulary/phrases are generic, but we pass the context for cultural nuances.

        const prompt = `
        You are an expert translator and cultural consultant for an African Language Learning App.
        
        TARGET LANGUAGE: ${context.language}
        TARGET REGION: ${context.country}
        
        INPUT DATA (English):
        Vocabulary: ${JSON.stringify(template.phase1.vocabulary)}
        Phrases: ${JSON.stringify(template.phase1.keyPhrases.map(p => p.concept))}
        Cultural Topics: ${JSON.stringify(template.phase1.culturalNoteTopics)}

        INSTRUCTIONS:
        1. Translate the Vocabulary into ${context.language}. Provide a phonetic pronunciation guide (IPA or standard easy-read).
        2. Translate the Phrases into natural, spoken ${context.language}. 
           - Match the "Concept" naturally. E.g., if concept is "How much?", use the common market bargaining phrase.
        3. Write short Cultural Notes for the provided topics, specific to ${context.country}/${context.language}.
           - Keep notes concise (max 2 sentences).
           - "pronunciation" field in cultural notes is for the main local term being discussed (if any).

        OUTPUT JSON FORMAT ONLY:
        {
            "vocabulary": [
                { "native": "...", "pronunciation": "...", "english": "..." }
            ],
            "keyPhrases": [
                { "native": "...", "pronunciation": "...", "english": "..." }
            ],
            "culturalNotes": [
                { "title": "...", "description": "...", "pronunciation": "..." }
            ]
        }
        `;

        try {
            const response = await client.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            const text = response.text || "{}";
            const data = JSON.parse(text) as TranslatedLessonData;
            return data;

        } catch (error) {
            console.error("Template Translation Failed:", error);
            // Fallback to empty structure to prevent crash, identifying error
            return {
                vocabulary: template.phase1.vocabulary.map(w => ({ native: w, pronunciation: "...", english: w })),
                keyPhrases: template.phase1.keyPhrases.map(p => ({ native: p.concept, pronunciation: "...", english: p.concept })),
                culturalNotes: []
            };
        }
    }
};
