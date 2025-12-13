import { NextResponse } from "next/server";
import { pronunciationAgent } from "@/lib/ai/gemini";

export async function POST(req: Request) {
    try {
        const { audioBase64, expectedText, language, mimeType, dialect } = await req.json();

        if (!audioBase64 || !expectedText || !language) {
            return NextResponse.json(
                { error: "Audio, Expected Text, and Language are required" },
                { status: 400 }
            );
        }

        const evaluation = await pronunciationAgent.evaluateSpeech(audioBase64, expectedText, language, mimeType || "audio/mp3", dialect || "standard");

        return NextResponse.json(evaluation);

    } catch (error) {
        console.error("Speech Eval API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
