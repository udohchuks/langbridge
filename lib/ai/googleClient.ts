import { GoogleGenAI } from "@google/genai";

const getApiKeys = (): string[] => {
    const keysEnv = process.env.GEMINI_API_KEY || "";
    if (!keysEnv) return [];

    // Support comma-separated keys
    return keysEnv.split(",").map(k => k.trim()).filter(k => k.length > 0);
};

const apiKeys = getApiKeys();

export const getGenerativeClient = (): GoogleGenAI => {
    if (apiKeys.length === 0) {
        console.warn("No GEMINI_API_KEY found. Using empty key (will likely fail).");
        return new GoogleGenAI({ apiKey: "" });
    }

    // Randomly select a key to distribute load
    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    return new GoogleGenAI({ apiKey: randomKey });
};

export const getApiKey = (): string => {
    if (apiKeys.length === 0) {
        return "";
    }
    return apiKeys[Math.floor(Math.random() * apiKeys.length)];
}
