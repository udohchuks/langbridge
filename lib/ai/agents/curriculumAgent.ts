import { CURRICULUM_TEMPLATES, LESSON_TEMPLATES, LessonTemplate } from '@/lib/logic/templates';
import { personalizeText, inferCountryFromLanguage, inferCityFromLanguage } from '@/lib/logic/personalization';

export interface LessonTopic {
    context: string;
    title: string;
    description: string;
    templateId?: string; // Track which template maps to this topic
}

export const curriculumAgent = {
    generateCurriculum: async (userProfile: any, detailedGoal: string): Promise<LessonTopic[]> => {
        // 1. Determine the best curriculum match
        // Simple logic for now: Default to "travel" unless "business" is mentioned
        const goalLower = (userProfile.goal || "").toLowerCase() + " " + detailedGoal.toLowerCase();
        let templateId = "travel";
        if (goalLower.includes("business") || goalLower.includes("work")) {
            templateId = "business";
        }

        const curriculumTemplate = CURRICULUM_TEMPLATES[templateId] || CURRICULUM_TEMPLATES["travel"];

        // 2. Prepare context for personalization
        const context = {
            name: userProfile.name || "Traveller",
            language: userProfile.language || "Local Language",
            country: inferCountryFromLanguage(userProfile.language || ""),
            city: inferCityFromLanguage(userProfile.language || ""),
        };

        // 3. Map lessons to LessonTopics
        const topics: LessonTopic[] = curriculumTemplate.lessons.map(lessonId => {
            const lessonTemplate = LESSON_TEMPLATES[lessonId];
            if (!lessonTemplate) return null;

            return {
                context: lessonTemplate.scenario,
                title: lessonTemplate.title,
                description: personalizeText(lessonTemplate.description, context),
                templateId: lessonId
            } as LessonTopic;
        }).filter((t): t is LessonTopic => t !== null);

        // Fallback if no lessons found (shouldn't happen with valid templates)
        if (topics.length === 0) {
            return [
                { context: "greeting", title: "Introduction", description: `${context.name} learns basic greetings in ${context.country}`, templateId: "travel_1_greetings" }
            ];
        }

        return topics;
    }
};
