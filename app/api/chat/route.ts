import { NextResponse } from "next/server";
import { conversationAgent, imageAgent } from "@/lib/ai/gemini";

export async function POST(req: Request) {
    try {
        const { history, message, language, context } = await req.json();

        if (!message || !language) {
            return NextResponse.json(
                { error: "Message and Language are required" },
                { status: 400 }
            );
        }

        // 1. Get AI Response from conversationAgent
        const response = await conversationAgent.generateResponse(history, message, language, context);

        // 2. Check for new image requirement
        let newImageUrl = undefined;
        if (response.nextImagePrompt) {
            newImageUrl = await imageAgent.generate(response.nextImagePrompt);
        }

        return NextResponse.json({
            ...response,
            newImageUrl
        });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Failed to process chat" },
            { status: 500 }
        );
    }
}
