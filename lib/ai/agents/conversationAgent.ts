
import { getGenerativeClient, getApiKey } from '../googleClient';

const getClient = () => getGenerativeClient();

export const conversationAgent = {
    generateResponse: async (
        history: { role: "user" | "model"; parts: string }[],
        userInput: string,
        targetLanguage: string,
        context: string
    ): Promise<{ nativeText: string; englishText: string; nextImagePrompt?: string }> => {
        if (!getApiKey()) {
            return {
                nativeText: "Medaase (Mock)",
                englishText: "Thank you (Mock)",
            };
        }

        const model = getClient().getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
        You are a roleplay partner in a language lesson.
        Language: ${targetLanguage}.
        Specific Lesson Context: ${context}.
        
        Your Goal: Help the user practice conversation relevant to this specific context.
        Stay in character. Keep responses concise (1-2 sentences) suitable for a learner.

        Respond to the user's input naturally in character.
        Your response MUST be a JSON object with:
        - nativeText: Your response in ${targetLanguage}.
        - englishText: The English translation.
        - nextImagePrompt: (Optional) If the scene changes significantly or a new key object is introduced, provide a new image prompt. Otherwise null.
      `;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to roleplay." }],
                },
                ...history.map((h) => ({ role: h.role, parts: [{ text: h.parts }] })),
            ],
        });

        try {
            const result = await chat.sendMessage(userInput);
            const response = await result.response;
            const text = response.text();
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error("Error in chat:", error);
            return {
                nativeText: "...",
                englishText: "I'm having trouble understanding. (Error)",
            };
        }
    }
};
