
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

export const imageAgent = {
    generate: async (prompt: string): Promise<string> => {
        try {
            // Use Pollinations.ai for free, reliable image generation
            // It doesn't require an API key and works great for prototypes
            const encodedPrompt = encodeURIComponent(prompt);
            const randomSeed = Math.floor(Math.random() * 1000);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?n=${randomSeed}`;

            // Return the URL directly
            return imageUrl;

        } catch (error) {
            console.error("Error generating image:", error);
            console.error("Error generating image:", error);
            // Fallback to a reliable placeholder service if generation fails
            return `https://placehold.co/800x600/E5E0D8/5D4037?text=${encodeURIComponent(prompt.split(" ")[0])}`;
        }
    }
};
