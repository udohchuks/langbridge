
import { getGenerativeClient } from '../googleClient';
import { googleTranslateClient } from '../googleTranslateClient';

export const conversationAgent = {
    generateResponse: async (
        history: { role: "user" | "model"; parts: string }[],
        userInput: string,
        targetLanguage: string,
        context: string
    ): Promise<{ nativeText: string; englishText: string; userTranslation: string; userEnglish: string; nextImagePrompt?: string }> => {

        const client = getGenerativeClient();

        // 1. Translate User Input
        let inputForAya = userInput;
        let userTranslationInTarget = userInput;

        try {
            // Run translations in parallel
            const [englishTranslation, targetTranslation] = await Promise.all([
                googleTranslateClient.translateToEnglish(userInput, targetLanguage),
                googleTranslateClient.translateText(userInput, targetLanguage)
            ]);

            inputForAya = englishTranslation;
            userTranslationInTarget = targetTranslation;
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
        Return ONLY the JSON object. No markdown.
      `;

        // Map history to new API format
        const chatHistory = history.map(h => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.parts }]
        }));

        try {
            const response = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    ...chatHistory,
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }]
                    }
                ]
            });

            const text = response.text || "";
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            const aiResponse = JSON.parse(jsonStr);

            // 2. Translate AI's Response to Target Language
            const nativeText = await googleTranslateClient.translateText(aiResponse.englishResponse, targetLanguage);

            return {
                nativeText: nativeText,
                englishText: aiResponse.englishResponse,
                userTranslation: userTranslationInTarget,
                userEnglish: inputForAya,
                nextImagePrompt: aiResponse.nextImagePrompt
            };
        } catch (error: any) {
            console.error("Error in chat with Gemini or Translation:", error);
            if (error.message) {
                console.error("Error message:", error.message);
            }
            if (error.stack) {
                console.error("Error stack:", error.stack);
            }
            return {
                nativeText: "(Connection Error)",
                englishText: "I'm having trouble understanding. (Error)",
                userTranslation: "...",
                userEnglish: "...",
            };
        }
    }
};
