export interface DialogueLine {
    id: string;
    speaker: "native" | "learner";
    nativeText: string;
    englishText: string;
    audioUrl?: string; // In real app, this would be a URL. We'll use TTS.
}

export interface Lesson {
    title: string;
    location: string;
    character: string;
    characterImage: string;
    headerImage: string;
    dialogue: DialogueLine[];
    culturalNote: {
        title: string;
        pronunciation: string;
        description: string;
    };
}

export const generateLesson = async (): Promise<Lesson> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return mock data regardless of context for prototype
    return {
        title: "Market Bargaining",
        location: "Makola Market, Accra",
        character: "Auntie Akosua",
        characterImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAUCoBmGSWsv1k4T-locQxXsZ1kbRvYcHH4bhTu0TqadyABePHgdsIUoEc43PpxVm-FOISGGKiIAa6dfbwO0u03POBUKp5AsmUAcwDbIRaAMPPYLcTE8GGV3aLZB-OXyheyCgrwDbi1ngj4hc_HB8JJ1OAIAR61_r0frWX9lk-PlVA1yvB1UjMJ6Y1ysMALGeM9TP75vMpIZwM3XDrF1gdsRY9mQAwUxMSN6R5xDln8_x-W8trtg9ZZKJTvN6Pne_vt_5_a2WvxS1A",
        headerImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBskJLzkswx0nbFpa3rr9BMm1dQmpyNs4EEaiBJrVy8qgEBOle68HHUc8qzj1k86EPo85x0KqXY5sEavN_41j0-Jfc31_FWnyiLttF8VdxWlO3EzdZ_W3vAoxLXmLGmP2x7IxJc2xclYuYiRqyIv4pI3qjtUekpP8kbmLliKUGeVi_uMT0v_9TUYJy9UA65P3dG5yNjw8zeJMMujzfwR1q_wAuzbtXjWgQ86aHA5SPKRxr_UfiKkyaHxfUw0jatTgALDQQ3t7lIuJs",
        dialogue: [
            {
                id: "1",
                speaker: "native",
                nativeText: "Ete sen?",
                englishText: "How are you?",
            },
            {
                id: "2",
                speaker: "learner",
                nativeText: "Eye",
                englishText: "I am fine",
            },
            {
                id: "3",
                speaker: "native",
                nativeText: "Woreko he?",
                englishText: "Where are you going?",
            },
            {
                id: "4",
                speaker: "learner",
                nativeText: "Merekɔ dwam",
                englishText: "I am going to the market",
            },
        ],
        culturalNote: {
            title: "Mepaakyew",
            pronunciation: "Meh-paa-chew",
            description: "Always use this when starting a request with an elder.",
        },
    };
};
