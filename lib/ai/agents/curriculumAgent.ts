
import { getGenerativeClient, getApiKey } from '../googleClient';

const getClient = () => getGenerativeClient();

export interface LessonTopic {
    context: string;
    title: string;
    description: string;
}

export const curriculumAgent = {
    generateCurriculum: async (userProfile: any, detailedGoal: string): Promise<LessonTopic[]> => {
        if (!getApiKey()) {
            return [
                { context: "greeting", title: "Introduction (Mock)", description: "Basics" },
                { context: "market", title: "Shopping (Mock)", description: "Buying things" },
                { context: "food", title: "Eating (Mock)", description: "Ordering food" }
            ];
        }

        const model = getClient().getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert curriculum designer.
        Based on the following DETAILED USER GOAL, create a structure of 3 distinct lesson topics.

        DETAILED GOAL:
        "${detailedGoal}"

        USER PROFILE:
        - Language: ${userProfile.language}
        - Level: ${userProfile.level}

        INSTRUCTIONS:
        1. Create exactly 3 lesson topics that progressively build skills relevant to the goal.
        2. "context" should be a simple keyword (e.g., "airport", "meeting", "family_dinner").
        3. "title" should be a SIMPLE, COMMON English title (1-3 words max). E.g., "Greetings", "At the Market", "Family Dinner".
        4. "description" should briefly explain what will be covered.

        OUTPUT FORMAT (JSON ARRAY ONLY):
        [
            {
                "context": "keyword",
                "title": "Lesson Title",
                "description": "Brief description"
            },
            ...
        ]
        `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonStr) as LessonTopic[];
        } catch (error) {
            console.error("Error generating curriculum:", error);
            return [
                { context: "greeting", title: "Introduction", description: "Basics of greeting" },
                { context: "general", title: "General Conversation", description: "Basic phrases" },
                { context: "vocabulary", title: "Key Vocabulary", description: "Important words" }
            ];
        }
    }
};
