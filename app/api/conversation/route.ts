import { NextResponse } from "next/server";
import { conversationAgent } from "@/lib/ai/gemini";

export async function POST(req: Request) {
    try {
        const { history, message, language, context, persona } = await req.json();

        if (!message || !language) {
            return NextResponse.json(
                { error: "Message and Language are required" },
                { status: 400 }
            );
        }

        // We can enhance the context with the persona if provided
        const enhancedContext = persona
            ? `Persona: ${persona}. Context: ${context}`
            : context;

        // Reuse the existing conversation agent but with the enhanced context/persona
        const response = await conversationAgent.generateResponse(history, message, language, enhancedContext);

        return NextResponse.json(response);

    } catch (error) {
        console.error("Conversation API Error:", error);
        return NextResponse.json(
            { error: "Failed to process conversation" },
            { status: 500 }
        );
    }
}
