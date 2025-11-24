import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

export async function generateImage(prompt: string): Promise<string> {
    if (!apiKey) {
        console.log("No GEMINI_API_KEY. Using Unsplash fallback for prompt:", prompt);
        const keywords = prompt.split(" ").slice(0, 3).join(",");
        return `https://source.unsplash.com/1600x900/?${encodeURIComponent(keywords)}`;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        console.log("Generating image with Imagen for prompt:", prompt);

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "16:9",
                personGeneration: "allow_adult"
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const generatedImage = response.generatedImages[0];
            const imgBytes = generatedImage.image.imageBytes;

            // Convert to Base64 data URL
            const base64Image = `data:image/png;base64,${imgBytes}`;
            console.log("Successfully generated image with Imagen");
            return base64Image;
        }

        throw new Error("No image generated");
    } catch (error) {
        console.error("Error generating image with Imagen:", error);

        // Fallback to Unsplash
        console.log("Falling back to Unsplash");
        const keywords = prompt.split(" ").slice(0, 3).join(",");
        return `https://source.unsplash.com/1600x900/?${encodeURIComponent(keywords)}`;
    }
}
