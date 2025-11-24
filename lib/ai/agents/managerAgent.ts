
import { getGenerativeClient, getApiKey } from '../googleClient';
import { imageAgent } from './imageAgent';

const getClient = () => getGenerativeClient();

export interface LessonPlan {
    title: string;
    location: string;
    character: string;
    characterDescription: string;
    scenario: string;
    initialDialogue: {
        speaker: "native" | "learner";
        nativeText: string;
        englishText: string;
    }[];
    culturalNote: {
        title: string;
        pronunciation: string;
        description: string;
    };
    imagePrompts: {
        header: string;
        character: string;
    };
}

const getMockLesson = (context: string, userGoal: string = "General"): LessonPlan => ({
    title: `${userGoal} Lesson: ${context} (Mock)`,
    location: "Makola Market, Accra",
    character: "Auntie Akosua",
    characterDescription: "A friendly middle-aged woman wearing a colorful Kente cloth.",
    scenario: `Practice ${context} conversation for your ${userGoal} goals.`,
    initialDialogue: [
        { speaker: "native", nativeText: "Ete sen?", englishText: "How are you?" },
    ],
    culturalNote: {
        title: "Mepaakyew",
        pronunciation: "Meh-paa-chew",
        description: "Always use this when starting a request with an elder.",
    },
    imagePrompts: {
        header: `A vibrant ${userGoal.toLowerCase()}-focused scene at ${context}, photorealistic, first-person view.`,
        character: "A portrait of a friendly Ghanaian person, traditional clothing, warm lighting.",
    },
});

export const managerAgent = {
    generateLessonPlan: async (
        context: string,
        targetLanguage: string,
        userLevel: string = "Beginner",
        userGoal: string = "General",
        forcedTitle?: string
    ): Promise<LessonPlan & { headerImage: string; characterImage: string }> => {
        if (!getApiKey()) {
            console.warn("GEMINI_API_KEY is not set. Using mock data.");
            const lessonPlan = getMockLesson(context, userGoal);
            if (forcedTitle) lessonPlan.title = forcedTitle;
            const [headerImage, characterImage] = await Promise.all([
                imageAgent.generate(lessonPlan.imagePrompts.header),
                imageAgent.generate(lessonPlan.imagePrompts.character),
            ]);
            return {
                ...lessonPlan,
                headerImage,
                characterImage,
            };
        }

        const model = getClient().getGenerativeModel({ model: "gemini-2.0-flash" });

        const createPrompt = (feedback?: string) => `
        You are an expert language tutor creating a personalized lesson for a ${userLevel} learner of ${targetLanguage}.
        
        USER PROFILE:
        - Target Language: ${targetLanguage}
        - Proficiency Level: ${userLevel}
        - Learning Goal: "${userGoal}"
        
        LESSON CONTEXT:
        - Scenario Context: "${context}"
        ${forcedTitle ? `- REQUIRED TITLE: "${forcedTitle}"` : ""}
        
        ${feedback ? `PREVIOUS FEEDBACK (FIX THIS): ${feedback}` : ""}

        INSTRUCTIONS:
        Create a realistic, culturally-rich lesson that SPECIFICALLY addresses the user's goal of "${userGoal}" within the context of "${context}".
        
        OUTPUT FORMAT (JSON ONLY):
        {
            "title": "${forcedTitle || "A short, catchy title (MAX 3 WORDS)"}",
            "location": "Specific setting name",
            "character": "Name of the character",
            "characterDescription": "Visual description of the character",
            "scenario": "1-sentence description of the lesson objective",
            "initialDialogue": [
                {
                    "speaker": "native",
                    "nativeText": "The opening line in ${targetLanguage}",
                    "englishText": "English translation"
                }
            ],
            "culturalNote": {
                "title": "Name of cultural concept",
                "pronunciation": "Phonetic pronunciation",
                "description": "Explanation relevant to the goal"
            },
            "imagePrompts": {
                "header": "Photorealistic image of ${forcedTitle || context}. Style: Cinematic, 8k, highly detailed, warm lighting.",
                "character": "Detailed photorealistic portrait prompt for the character. Style: Cinematic, 8k, highly detailed, warm lighting."
            }
        }
        Return ONLY the JSON object. No markdown.
      `;

        const judgeLesson = async (lesson: LessonPlan, goal: string): Promise<{ valid: boolean; feedback: string }> => {
            const judgePrompt = `
            You are a strict Quality Control Judge for a language learning app.
            Evaluate the following LESSON PLAN against the USER GOAL.

            USER GOAL: "${goal}"
            LESSON PLAN: ${JSON.stringify(lesson)}

            CRITERIA:
            1. Does the lesson DIRECTLY address the user's goal? (e.g. if goal is "Business", is the dialogue formal/professional?)
            2. Is the context appropriate?
            3. Is the language level appropriate?

            OUTPUT JSON ONLY:
            {
                "valid": boolean,
                "feedback": "Specific instructions on what to fix if invalid, or 'Approved' if valid."
            }
            `;
            try {
                const result = await model.generateContent(judgePrompt);
                const text = result.response.text();
                const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                return JSON.parse(jsonStr);
            } catch (e) {
                console.error("Judge failed, assuming valid");
                return { valid: true, feedback: "" };
            }
        };

        try {
            // 1. Writer (Attempt 1)
            let result = await model.generateContent(createPrompt());
            let text = result.response.text();
            let jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
            let lessonPlan = JSON.parse(jsonStr) as LessonPlan;

            // 2. Judge
            console.log("Judging lesson...");
            let judgment = await judgeLesson(lessonPlan, userGoal);

            // 3. Retry if needed (Max 1 retry)
            if (!judgment.valid) {
                console.log("Lesson rejected by Judge. Retrying with feedback:", judgment.feedback);
                result = await model.generateContent(createPrompt(judgment.feedback));
                text = result.response.text();
                jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                lessonPlan = JSON.parse(jsonStr) as LessonPlan;
            } else {
                console.log("Lesson approved by Judge.");
            }

            // 4. Generate Images
            const [headerImage, characterImage] = await Promise.all([
                imageAgent.generate(lessonPlan.imagePrompts.header),
                imageAgent.generate(lessonPlan.imagePrompts.character),
            ]);

            return {
                ...lessonPlan,
                headerImage,
                characterImage,
            };
        } catch (error) {
            console.error("Error generating lesson:", error);
            const lessonPlan = getMockLesson(context, userGoal);
            const [headerImage, characterImage] = await Promise.all([
                imageAgent.generate(lessonPlan.imagePrompts.header),
                imageAgent.generate(lessonPlan.imagePrompts.character),
            ]);
            return {
                ...lessonPlan,
                headerImage,
                characterImage,
            };
        }
    }
};
