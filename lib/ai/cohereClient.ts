import { CohereClient } from "cohere-ai";

const getApiKey = (): string => {
    const key = process.env.COHERE_API_KEY || "";
    if (!key) {
        console.warn("COHERE_API_KEY is not set.");
    }
    return key;
};

let cohereClient: CohereClient | null = null;

export const getCohereClient = (): CohereClient => {
    if (!cohereClient) {
        const apiKey = getApiKey();
        cohereClient = new CohereClient({
            token: apiKey,
        });
    }
    return cohereClient;
};

export const isCohereConfigured = (): boolean => {
    return !!process.env.COHERE_API_KEY;
};
