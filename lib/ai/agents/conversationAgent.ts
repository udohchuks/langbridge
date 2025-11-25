
import { getCohereClient, isCohereConfigured } from '../cohereClient';
import { googleTranslateClient } from '../googleTranslateClient';

export const conversationAgent = {
    generateResponse: async (
        history: { role: "user" | "model"; parts: string }[],
        userInput: string,
        targetLanguage: string,
        context: string
    ): Promise<{ nativeText: string; englishText: string; userTranslation: string; nextImagePrompt?: string }> => {
        if (!isCohereConfigured()) {
            return {
                nativeText: "Medaase (Mock)",
                englishText: "Thank you (Mock)",
                userTranslation: "Medaase (Mock User Translation)",
            };
        }

        const cohere = getCohereClient();

        // 1. Translate User Input
        let inputForAya = userInput;
        let userTranslationInTarget = userInput;

        try {
            // Translate to English for Aya's understanding
            inputForAya = await googleTranslateClient.translateToEnglish(userInput);

            // Translate to Target Language for the UI (userTranslation field)
            // If the user typed in English, this gives the target. If they typed in Target, it cleans it up or keeps it.
            userTranslationInTarget = await googleTranslateClient.translateText(userInput, targetLanguage);
        } catch (e) {
            console.error("Translation error on input:", e);
        }

        const systemPrompt = `
        You are a roleplay partner in a language lesson.
        Target Language of the learner: ${targetLanguage}.
        Specific Lesson Context: ${context}.
        
        Your Goal: Help the user practice conversation relevant to this specific context.
        Stay in character. Keep responses concise (1-2 sentences) suitable for a learner.

        IMPORTANT:
        The user's input has been translated to English for you: "${inputForAya}".
        
        Respond to the user's input naturally in character.
        Your response MUST be a JSON object with:
        - englishResponse: Your response in English.
        - nextImagePrompt: (Optional) If the scene changes significantly or a new key object is introduced, provide a new image prompt. Otherwise null.
      `;

        // Map history to Cohere format
        // Note: We are sending raw history. Ideally, we'd translate this too, but for now we rely on Aya's context window.
        const chatHistory = history.map(h => ({
            role: h.role === "user" ? "USER" : "CHATBOT",
            message: h.parts
        })) as { role: "USER" | "CHATBOT"; message: string }[];

        try {
            const response = await cohere.chat({
                message: `User said (in English): ${inputForAya}`, // Explicitly state it's English
                chatHistory: chatHistory,
                preamble: systemPrompt,
                model: "c4ai-aya-expanse-32b",
                temperature: 0.3,
            });

            const text = response.text;
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const ayaResponse = JSON.parse(jsonStr);

            // 2. Translate Aya's Response to Target Language
            const nativeText = await googleTranslateClient.translateText(ayaResponse.englishResponse, targetLanguage);

            return {
                nativeText: nativeText,
                englishText: ayaResponse.englishResponse,
                userTranslation: userTranslationInTarget,
                nextImagePrompt: ayaResponse.nextImagePrompt
            };
        } catch (error) {
            console.error("Error in chat with Cohere or Translation:", error);
            return {
                nativeText: "...",
                englishText: "I'm having trouble understanding. (Error)",
                userTranslation: "...",
            };
        }
    }
};
