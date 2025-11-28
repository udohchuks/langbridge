
import { getGenerativeClient } from '../googleClient';
import { imageAgent } from './imageAgent';
import { googleTranslateClient } from '../googleTranslateClient';

export interface LessonPlan {
    title: string;
    location: string;
    character: string;
    characterDescription: string;
    scenario: string;
    initialDialogue: {
        id: string;
        speaker: "native" | "learner";
        nativeText: string;
        englishText: string;
    }[];
    culturalNote: {
        title: string;
        pronunciation: string;
        description: string;
        // ... existing fields
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
        { id: "mock-1", speaker: "native", nativeText: "Ete sen?", englishText: "How are you?" },
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

        const client = getGenerativeClient();

        const systemPrompt = `
        You are an expert language tutor creating a personalized lesson for a ${userLevel} learner of ${targetLanguage}.
        
        USER PROFILE:
        - Target Language: ${targetLanguage}
        - Proficiency Level: ${userLevel}
        - Learning Goal: "${userGoal}"
        
        LESSON CONTEXT:
        - Scenario Context: "${context}"
        ${forcedTitle ? `- REQUIRED TITLE: "${forcedTitle}"` : ""}
        
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
                    "englishText": "The opening line in English"
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

        try {
            // 1. Generate Lesson Plan
            const response = await client.models.generateContent({
                model: "gemini-2.5-flash",
                contents: systemPrompt
            });

            let text = response.text || "";

            // Clean up markdown if present
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();

            let lessonPlan: LessonPlan;
            try {
                const rawPlan = JSON.parse(text);

                // Translate the dialogue to target language
                const translatedDialogue = await Promise.all(rawPlan.initialDialogue.map(async (line: { speaker: "native" | "learner"; englishText: string }, index: number) => {
                    const nativeText = await googleTranslateClient.translateText(line.englishText, targetLanguage);
                    return {
                        id: `msg-${Date.now()}-${index}`,
                        speaker: line.speaker,
                        nativeText: nativeText,
                        englishText: line.englishText
                    };
                }));

                lessonPlan = {
                    ...rawPlan,
                    initialDialogue: translatedDialogue
                };

            } catch (e) {
                console.error("Failed to parse Gemini response:", text);
                throw e;
            }

            // 2. Generate Images (unchanged)
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
            console.error("Error generating lesson with Gemini:", error);
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
