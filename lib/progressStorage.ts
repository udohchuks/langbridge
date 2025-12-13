export interface UserProgress {
    totalXP: number;
    currentStreak: number;
    lastActivityDate: string; // ISO date string
    badges: string[];
    completedLessons: {
        context: string;
        completedAt: string;
        xpEarned: number;
        accuracy?: number;
    }[];
    sessionStats: {
        lessonsToday: number;
        xpToday: number;
    };
}

export interface LessonProgress {
    context: string;
    knownVocabulary: Set<number>; // indices of known vocab items
    practiceVocabulary: Set<number>; // indices being practiced
    culturalQuizCompleted: boolean;
    culturalQuizCorrect: boolean;
    currentStep: number; // 1-5
    totalSteps: number; // always 5
    accuracyHistory: number[]; // speech evaluation scores
}

const PROGRESS_KEY = 'langbridge_user_progress';
const SESSION_KEY = 'langbridge_lesson_session';

// Get user's overall progress
export const getUserProgress = (): UserProgress => {
    if (typeof window === 'undefined') {
        return getDefaultProgress();
    }

    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) {
        return getDefaultProgress();
    }

    try {
        const progress = JSON.parse(stored);
        // Update streak based on last activity
        return updateStreak(progress);
    } catch (e) {
        console.error('Failed to parse user progress', e);
        return getDefaultProgress();
    }
};

// Get progress for current lesson session
export const getLessonProgress = (context: string): LessonProgress => {
    if (typeof window === 'undefined') {
        return getDefaultLessonProgress(context);
    }

    const stored = localStorage.getItem(`${SESSION_KEY}_${context}`);
    if (!stored) {
        return getDefaultLessonProgress(context);
    }

    try {
        const progress = JSON.parse(stored);
        // Convert arrays back to Sets
        return {
            ...progress,
            knownVocabulary: new Set(progress.knownVocabulary || []),
            practiceVocabulary: new Set(progress.practiceVocabulary || []),
        };
    } catch (e) {
        console.error('Failed to parse lesson progress', e);
        return getDefaultLessonProgress(context);
    }
};

// Save overall user progress
export const saveUserProgress = (progress: UserProgress): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

// Save lesson session progress
export const saveLessonProgress = (progress: LessonProgress): void => {
    if (typeof window === 'undefined') return;

    // Convert Sets to arrays for JSON serialization
    const serializable = {
        ...progress,
        knownVocabulary: Array.from(progress.knownVocabulary),
        practiceVocabulary: Array.from(progress.practiceVocabulary),
    };

    localStorage.setItem(`${SESSION_KEY}_${progress.context}`, JSON.stringify(serializable));
};

// Award XP for completing an action
export const awardXP = (amount: number, source: string): UserProgress => {
    const progress = getUserProgress();
    progress.totalXP += amount;
    progress.sessionStats.xpToday += amount;
    saveUserProgress(progress);
    return progress;
};

// Complete a lesson and award XP
export const completeLesson = (context: string, xp: number, accuracy?: number): UserProgress => {
    const progress = getUserProgress();

    progress.totalXP += xp;
    progress.sessionStats.xpToday += xp;
    progress.sessionStats.lessonsToday += 1;

    progress.completedLessons.push({
        context,
        completedAt: new Date().toISOString(),
        xpEarned: xp,
        accuracy,
    });

    // Award badges based on milestones
    progress.badges = updateBadges(progress);

    saveUserProgress(progress);

    // Clear lesson session
    if (typeof window !== 'undefined') {
        localStorage.removeItem(`${SESSION_KEY}_${context}`);
    }

    return progress;
};

// Calculate overall accuracy from lesson progress
export const calculateAccuracy = (progress: LessonProgress): number => {
    if (progress.accuracyHistory.length === 0) return 0;
    const sum = progress.accuracyHistory.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / progress.accuracyHistory.length);
};

// Add speech evaluation score to history
export const recordSpeechScore = (context: string, score: number): void => {
    const lessonProgress = getLessonProgress(context);
    lessonProgress.accuracyHistory.push(score);
    saveLessonProgress(lessonProgress);
};

// Mark vocabulary as known
export const markVocabKnown = (context: string, index: number): void => {
    const lessonProgress = getLessonProgress(context);
    lessonProgress.knownVocabulary.add(index);
    lessonProgress.practiceVocabulary.delete(index);
    saveLessonProgress(lessonProgress);
};

// Mark vocabulary for practice
export const markVocabPractice = (context: string, index: number): void => {
    const lessonProgress = getLessonProgress(context);
    lessonProgress.practiceVocabulary.add(index);
    lessonProgress.knownVocabulary.delete(index);
    saveLessonProgress(lessonProgress);
};

// Update current step
export const updateLessonStep = (context: string, step: number): void => {
    const lessonProgress = getLessonProgress(context);
    lessonProgress.currentStep = Math.max(lessonProgress.currentStep, step);
    saveLessonProgress(lessonProgress);
};

// Record cultural quiz completion
export const recordCulturalQuiz = (context: string, correct: boolean): void => {
    const lessonProgress = getLessonProgress(context);
    lessonProgress.culturalQuizCompleted = true;
    lessonProgress.culturalQuizCorrect = correct;
    saveLessonProgress(lessonProgress);

    if (correct) {
        awardXP(10, 'cultural_quiz');
    }
};

// Helper functions
function getDefaultProgress(): UserProgress {
    return {
        totalXP: 0,
        currentStreak: 0,
        lastActivityDate: new Date().toISOString(),
        badges: [],
        completedLessons: [],
        sessionStats: {
            lessonsToday: 0,
            xpToday: 0,
        },
    };
}

function getDefaultLessonProgress(context: string): LessonProgress {
    return {
        context,
        knownVocabulary: new Set(),
        practiceVocabulary: new Set(),
        culturalQuizCompleted: false,
        culturalQuizCorrect: false,
        currentStep: 1,
        totalSteps: 5,
        accuracyHistory: [],
    };
}

function updateStreak(progress: UserProgress): UserProgress {
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progress.lastActivityDate.split('T')[0];

    const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
        // Same day, keep streak
        return progress;
    } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        progress.currentStreak += 1;
        progress.lastActivityDate = new Date().toISOString();
    } else {
        // Streak broken
        progress.currentStreak = 1;
        progress.lastActivityDate = new Date().toISOString();
    }

    // Reset daily stats if new day
    if (daysDiff >= 1) {
        progress.sessionStats.lessonsToday = 0;
        progress.sessionStats.xpToday = 0;
    }

    return progress;
}

function updateBadges(progress: UserProgress): string[] {
    const badges = [...progress.badges];

    // First Lesson badge
    if (progress.completedLessons.length === 1 && !badges.includes('first_lesson')) {
        badges.push('first_lesson');
    }

    // Polite Speaker badge (complete 3 lessons)
    if (progress.completedLessons.length >= 3 && !badges.includes('polite_speaker')) {
        badges.push('polite_speaker');
    }

    // 5-day streak badge
    if (progress.currentStreak >= 5 && !badges.includes('streak_5')) {
        badges.push('streak_5');
    }

    // 10-day streak badge
    if (progress.currentStreak >= 10 && !badges.includes('streak_10')) {
        badges.push('streak_10');
    }

    // XP milestones
    if (progress.totalXP >= 100 && !badges.includes('xp_100')) {
        badges.push('xp_100');
    }

    if (progress.totalXP >= 500 && !badges.includes('xp_500')) {
        badges.push('xp_500');
    }

    return badges;
}
