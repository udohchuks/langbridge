
import { getGenerativeClient, getApiKey } from '../googleClient';

const getClient = () => getGenerativeClient();

export const goalAgent = {
    refineGoal: async (userProfile: any): Promise<string> => {
        if (!getApiKey()) {
            return `Mock Detailed Goal: User wants to learn ${userProfile.language} for ${userProfile.goal} with context: ${userProfile.contextDetails}`;
        }

        const model = getClient().getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert language learning consultant.
        Analyze the following user profile and create a DETAILED, motivating, and specific learning goal description.
        This description will be used to guide the creation of a personalized curriculum.

        USER PROFILE:
        - Name: ${userProfile.name}
        - Age: ${userProfile.age}
        - Target Language: ${userProfile.language}
        - Proficiency Level: ${userProfile.level}
        - Primary Goal Category: ${userProfile.goal}
        - Specific Context/Details provided by user: "${userProfile.contextDetails}"

        INSTRUCTIONS:
        1. Synthesize the user's inputs into a cohesive narrative.
        2. Expand on the "Specific Context" to infer likely scenarios they will encounter.
        3. Define what "Success" looks like for this user.
        4. Keep it under 100 words.

        OUTPUT:
        Just the detailed goal description string.
        `;

        try {
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Error refining goal:", error);
            return `User wants to learn ${userProfile.language} for ${userProfile.goal}.`;
        }
    }
};
