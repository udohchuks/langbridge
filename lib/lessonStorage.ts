export interface DialogueLine {
    id: string;
    speaker: "native" | "learner";
    nativeText: string;
    englishText: string;
}

export interface LessonData {
    title: string;
    location: string;
    character: string;
    characterDescription: string;
    scenario: string;
    headerImage: string;
    characterImage: string;
    initialDialogue: DialogueLine[];
    culturalNote: {
        title: string;
        pronunciation: string;
        description: string;
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
    context?: string; // Optional: legacy or derived
}

export interface LessonCollection {
    lessons: LessonData[];
    generatedAt: number;
}

const STORAGE_KEY = 'langbridge_lessons';

export const saveLessons = (lessons: LessonData[]): void => {
    if (typeof window !== 'undefined') {
        const collection: LessonCollection = {
            lessons,
            generatedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    }
};

export const getLessons = (): LessonData[] | null => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const collection: LessonCollection = JSON.parse(stored);
                return collection.lessons;
            } catch (e) {
                console.error("Failed to parse lessons", e);
                return null;
            }
        }
    }
    return null;
};

export const getLessonByContext = (context: string): LessonData | null => {
    const lessons = getLessons();
    if (!lessons) return null;
    return lessons.find(lesson => lesson.context === context) || null;
};

export const clearLessons = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
};
