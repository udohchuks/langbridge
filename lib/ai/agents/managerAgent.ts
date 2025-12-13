
import { getGenerativeClient } from '../googleClient';
import { imageAgent } from './imageAgent';
import { googleTranslateClient } from '../googleTranslateClient';
import { LESSON_TEMPLATES, LessonTemplate, PERSONA_TEMPLATES } from '@/lib/logic/templates';
import { personalizeText, inferCountryFromLanguage, inferCityFromLanguage } from '@/lib/logic/personalization';
import { templateAgent } from './templateAgent';
import { formatTitle } from '@/lib/format';

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
    };
    imagePrompts: {
        header: string;
        character: string;
    };
    vocabulary: {
        native: string;
        english: string;
        pronunciation: string;
    }[];
    keyPhrases: {
        native: string;
        english: string;
        pronunciation: string;
    }[];
    context?: string;
}

const getMockLesson = (context: string, userGoal: string = "General"): LessonPlan => ({
    title: formatTitle(context),
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
    vocabulary: [
        { native: "Ete sen?", english: "How are you?", pronunciation: "Eh-teh sen" },
        { native: "Me ho ye", english: "I am fine", pronunciation: "Me ho yeh" },
        { native: "Medaase", english: "Thank you", pronunciation: "Me-daa-se" }
    ],
    keyPhrases: [
        { native: "Mepaakyew, ete sen?", english: "Please, how are you?", pronunciation: "Me-paa-chew, eh-teh sen" },
        { native: "Wo din de sen?", english: "What is your name?", pronunciation: "Wo din deh sen" }
    ]
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

        // 1. Try to find a matching template
        // Context might be a template ID (e.g. "travel_1_greetings") or a loose string ("market")
        let template: LessonTemplate | undefined = LESSON_TEMPLATES[context];

        // If not found by direct ID, search values (inefficient but safe for small sets)
        if (!template) {
            template = Object.values(LESSON_TEMPLATES).find(t => t.scenario === context);
        }

        const personalizationContext = {
            name: "Learner", // In a real app, this comes from user profile
            language: targetLanguage,
            country: inferCountryFromLanguage(targetLanguage),
            city: inferCityFromLanguage(targetLanguage)
        };

        if (template) {
            console.log("Using Template:", template.id);
            try {
                // A. Translate Content
                const translatedData = await templateAgent.translateLesson(template, personalizationContext);

                // B. Resolve Persona
                const personaTemplate = PERSONA_TEMPLATES[template.phase2.personaId] || PERSONA_TEMPLATES["market_woman"];
                const openingLine = template.phase2.openingLineEnglish || personaTemplate.baseOpeningLine;

                // Translate Opening Line
                const translatedOpening = await googleTranslateClient.translateText(
                    personalizeText(openingLine, personalizationContext),
                    targetLanguage
                );

                const lessonPlan: LessonPlan = {
                    title: forcedTitle || template.title,
                    location: personalizeText("${country}", personalizationContext),
                    character: personaTemplate.role,
                    characterDescription: personaTemplate.personality,
                    scenario: personalizeText(template.description, personalizationContext),
                    initialDialogue: [
                        {
                            id: `msg-init-${Date.now()}`,
                            speaker: "native",
                            nativeText: translatedOpening,
                            englishText: personalizeText(openingLine, personalizationContext)
                        }
                    ],
                    culturalNote: translatedData.culturalNotes[0] || { title: "Tip", description: "Be respectful.", pronunciation: "" },
                    imagePrompts: {
                        header: personalizeText(template.imagePrompt, personalizationContext),
                        character: `A photorealistic portrait of a ${personaTemplate.role} in ${personalizationContext.country}, ${personaTemplate.personality}. Warm lighting.`
                    },
                    vocabulary: translatedData.vocabulary,
                    keyPhrases: translatedData.keyPhrases
                };

                // Generate Images
                const [headerImage, characterImage] = await Promise.all([
                    imageAgent.generate(lessonPlan.imagePrompts.header),
                    imageAgent.generate(lessonPlan.imagePrompts.character),
                ]);

                return { ...lessonPlan, headerImage, characterImage, context };

            } catch (err) {
                console.error("Template generation failed, falling back to legacy:", err);
            }
        }

        // --- LEGACY FALLBACK (Keep original logic for non-template requests) ---

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
            },
            "vocabulary": [
                { "native": "Word", "english": "Meaning", "pronunciation": "Phonetic" }
            ],
            "keyPhrases": [
                { "native": "Phrase", "english": "Meaning", "pronunciation": "Phonetic" }
            ]
        }
        Return ONLY the JSON object. No markdown.
      `;

        try {
            // 1. Generate Lesson Plan
            const response = await client.models.generateContent({
                model: "gemini-3-pro-preview",
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
                context
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
                context
            };
        }
    }
};
