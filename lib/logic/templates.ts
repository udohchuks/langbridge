
export interface LessonTemplate {
    id: string;
    title: string;
    description: string; // Template string with ${name}, ${country}, etc.
    scenario: string;
    imagePrompt: string; // "A busy market in ${country}..."
    phase1: {
        vocabulary: string[]; // English words/concepts to be translated
        keyPhrases: {
            concept: string; // "How much is this?"
            purpose: string; // "Asking for price"
        }[];
        culturalNoteTopics: string[]; // Topics to fetch formatted cultural notes for
    };
    phase2: {
        personaId: string; // Which persona role to use (e.g. "market_woman")
        openingLineEnglish: string; // "Welcome! Have you come to buy yams?"
    };
}

export interface PersonaTemplate {
    id: string;
    role: string;
    personality: string;
    speakingStyle: string;
    baseOpeningLine: string; // Fallback opening line
}

export interface CurriculumTemplate {
    id: string; // e.g., "travel_basics"
    name: string;
    goal: string;
    description: string;
    lessons: string[]; // Array of LessonTemplate IDs
}

// --- STATIC DATA DEFINITIONS ---

export const PERSONA_TEMPLATES: Record<string, PersonaTemplate> = {
    market_woman: {
        id: "market_woman",
        role: "Market Vendor",
        personality: "Warm, loud, persuasive, calls everyone 'customer', uses friendly terms of endearment.",
        speakingStyle: "Energetic, informal, persuasive",
        baseOpeningLine: "Ah, my friend! You look like you need the best quality goods today!"
    },
    taxi_driver: {
        id: "taxi_driver",
        role: "Taxi Driver",
        personality: "Chatty, opinionated about traffic and politics, very helpful but chaotic driving.",
        speakingStyle: "Fast, informal, full of local slang",
        baseOpeningLine: "Traffic is terrible today, boss! Where are we going quickly?"
    },
    elder_mentor: {
        id: "elder_mentor",
        role: "Community Elder",
        personality: "Patient, wise, speaks slowly with proverbs, demands respect.",
        speakingStyle: "Formal, respectful, slow pace",
        baseOpeningLine: "Greetings. It is a good day to learn the ways of our people."
    },
    peer_student: {
        id: "peer_student",
        role: "University Student",
        personality: "Relaxed, uses slang, code-switches between English and local language.",
        speakingStyle: "Casual, modern, youthful",
        baseOpeningLine: "Hey! Cool to see you learning our language."
    }
};

export const LESSON_TEMPLATES: Record<string, LessonTemplate> = {
    // --- TRAVEL SERIES ---
    "travel_1_greetings": {
        id: "travel_1_greetings",
        title: "Arrival & Greetings",
        description: "${name} arrives in ${country} and learns to greet locals respectfully.",
        scenario: "airport_arrival",
        imagePrompt: "A modern airport arrival hall in ${country}, warm lighting, travelers with luggage, photorealistic.",
        phase1: {
            vocabulary: ["Hello", "Welcome", "Thank you", "Please", "Goodbye", "Yes", "No", "Excuse me"],
            keyPhrases: [
                { concept: "Hello, how are you?", purpose: "Basic greeting" },
                { concept: "I am fine, thank you.", purpose: "Responding to greeting" },
                { concept: "My name is...", purpose: "Self introduction" },
                { concept: "Nice to meet you.", purpose: "Polite closing" }
            ],
            culturalNoteTopics: ["Greeting elders vs peers", "Handshake etiquette in ${country}"]
        },
        phase2: {
            personaId: "taxi_driver",
            openingLineEnglish: "Welcome to ${country}! You look ready for an adventure. I am your driver."
        }
    },
    "travel_2_market": {
        id: "travel_2_market",
        title: "Market Day Bargaining",
        description: "${name} visits a bustling market to buy food and practice bargaining.",
        scenario: "market_negotiation",
        imagePrompt: "A bustling open-air market in ${country}, stalls with colorful fruits and fabrics, vibrant atmosphere, photorealistic.",
        phase1: {
            vocabulary: ["How much", "Too expensive", "Price", "Money", "I will buy", "Cheap", "Quality", "Bag"],
            keyPhrases: [
                { concept: "How much is this?", purpose: "Asking price" },
                { concept: "Please reduce the price.", purpose: "Bargaining" },
                { concept: "It is too expensive.", purpose: "Rejecting price" },
                { concept: "Here is the money.", purpose: "Paying" }
            ],
            culturalNoteTopics: ["Bargaining etiquette", "Using the right hand for money"]
        },
        phase2: {
            personaId: "market_woman",
            openingLineEnglish: "Ah, customer! Come look at these fresh items. I give you good price!"
        }
    },
    "travel_3_directions": {
        id: "travel_3_directions",
        title: "Getting Around",
        description: "${name} asks for directions to a local landmark in ${city}.",
        scenario: "asking_directions",
        imagePrompt: "A busy street corner in ${city}, ${country}, local architecture, street signs, sunny day, photorealistic.",
        phase1: {
            vocabulary: ["Where", "Left", "Right", "Straight", "Stop", "Far", "Near", "Bus"],
            keyPhrases: [
                { concept: "Where is the hotel?", purpose: "Asking location" },
                { concept: "Please take me to...", purpose: "Directing driver" },
                { concept: "Is it far?", purpose: "Asking distance" },
                { concept: "Stop here, please.", purpose: "Stopping" }
            ],
            culturalNoteTopics: ["Asking strangers for help", " gesturing with hands"]
        },
        phase2: {
            personaId: "peer_student",
            openingLineEnglish: "Hey! You look a bit lost. Need help finding somewhere?"
        }
    }
};

export const CURRICULUM_TEMPLATES: Record<string, CurriculumTemplate> = {
    "travel": {
        id: "travel",
        name: "Essential Travel Survival",
        goal: "Navigate daily situations while traveling.",
        description: "Zero to hero for your trip to ${country}.",
        lessons: ["travel_1_greetings", "travel_2_market", "travel_3_directions"]
    },
    "business": {
        id: "business",
        name: "Business Professional",
        goal: "Conduct meetings later.",
        description: "Professional etiquette for working in ${country}.",
        lessons: ["travel_1_greetings"] // Placeholder, would fetch business lessons
    }
};
