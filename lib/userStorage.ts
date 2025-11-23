export interface UserProfile {
    name: string;
    age: string;
    language: string;
    goal: string;
    level?: string;
    customGoal?: string;
    contextDetails?: string;
    summary?: string;
    detailedGoal?: string;
}

const STORAGE_KEY = 'langbridge_user_profile';

export const saveUserProfile = (profile: UserProfile): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
};

export const getUserProfile = (): UserProfile | null => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse user profile", e);
                return null;
            }
        }
    }
    return null;
};

export const clearUserProfile = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
};
