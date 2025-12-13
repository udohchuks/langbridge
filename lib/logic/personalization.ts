
export interface PersonalizationContext {
    name: string;
    country: string; // Target country context for the language (e.g. Ghana for Twi)
    city: string;    // Specific city logic 
    language: string;
    nativeLanguage?: string;
}

/**
 * Replaces placeholders in a string with values from the context.
 * Supported placeholders: ${name}, ${country}, ${city}, ${language}
 */
export function personalizeText(template: string, context: PersonalizationContext): string {
    return template
        .replace(/\${name}/g, context.name)
        .replace(/\${country}/g, context.country)
        .replace(/\${city}/g, context.city)
        .replace(/\${language}/g, context.language);
}

/**
 * Infers the likely country based on the target language if not provided.
 * This is a simple helper to ensure we always have a ${country} value.
 */
export function inferCountryFromLanguage(language: string): string {
    const map: Record<string, string> = {
        "Twi": "Ghana",
        "Yoruba": "Nigeria",
        "Igbo": "Nigeria",
        "Hausa": "Nigeria",
        "Swahili": "Kenya", // Or Tanzania
        "Zulu": "South Africa",
        "Xhosa": "South Africa",
        "Amharic": "Ethiopia",
        "Luganda": "Uganda",
        "Wolof": "Senegal"
    };
    return map[language] || "Africa";
}

export function inferCityFromLanguage(language: string): string {
    const map: Record<string, string> = {
        "Twi": "Accra",
        "Yoruba": "Lagos",
        "Igbo": "Enugu",
        "Hausa": "Kano",
        "Swahili": "Nairobi",
        "Zulu": "Durban",
        "Xhosa": "Cape Town",
        "Amharic": "Addis Ababa",
        "Luganda": "Kampala",
        "Wolof": "Dakar"
    };
    return map[language] || "the city";
}
