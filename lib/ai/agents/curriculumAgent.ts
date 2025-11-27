
import { getGenerativeClient } from '../googleClient';

export interface LessonTopic {
    context: string;
    title: string;
    description: string;
}

export const curriculumAgent = {
    generateCurriculum: async (userProfile: any, detailedGoal: string): Promise<LessonTopic[]> => {

        const client = getGenerativeClient();

        const prompt = `
        You are an expert curriculum designer creating a personalized language learning path.
        
        USER PROFILE:
        - Name: ${userProfile.name}
        - Age: ${userProfile.age}
        - Target Language: ${userProfile.language}
        - Proficiency Level: ${userProfile.level}
        
        DETAILED GOAL:
        "${detailedGoal}"

        INSTRUCTIONS:
        1. Create exactly 3 lesson topics that progressively build skills relevant to the goal.
        2. "context" should be a simple keyword (e.g., "airport", "meeting", "family_dinner").
        3. "title" should be a SIMPLE, COMMON English title (1-3 words max). E.g., "Greetings", "At the Market", "Family Dinner".
        4. "description" should PLACE ${userProfile.name} IN THE LEARNING CONTEXT (max 15 words). Set the scene of where they are and what they're about to learn. Use present tense.
           Examples:
           - If learning greetings: "${userProfile.name} visits grandma's house to practice warm ${userProfile.language} greetings"
           - If learning shopping: "${userProfile.name} is at the local market ready to buy fresh vegetables"
           - If making friends: "${userProfile.name} meets new classmates eager to introduce themselves"

        OUTPUT FORMAT (JSON ARRAY ONLY):
        [
            {
                "context": "keyword",
                "title": "Lesson Title",
                "description": "Scene-setting description placing user in context"
            },
            ...
        ]
        Return ONLY the JSON array. No markdown.
        `;

        try {
            const response = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });
            const text = response.text || "";

            const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(jsonStr) as LessonTopic[];
        } catch (error) {
            console.error("Error generating curriculum with Gemini:", error);
            return [
                { context: "greeting", title: "Introduction", description: `${userProfile.name} meets someone new and practices basic greetings` },
                { context: "general", title: "General Conversation", description: `${userProfile.name} chats with a friend about everyday topics` },
                { context: "vocabulary", title: "Key Vocabulary", description: `${userProfile.name} explores essential words for daily life` }
            ];
        }
    }
};
