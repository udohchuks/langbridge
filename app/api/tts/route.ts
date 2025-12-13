import { NextResponse } from "next/server";
import { ttsAgent } from "@/lib/ai/gemini";

export async function POST(req: Request) {
    try {
        const { text, language, dialect, gender } = await req.json();

        if (!text || !language) {
            return NextResponse.json(
                { error: "Text and Language are required" },
                { status: 400 }
            );
        }

        const result = await ttsAgent.generateAudio(text, language, dialect, gender);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        // Ideally, we'd return a blob or stream here.
        // For now, we return the data structure which might contain a link or base64.
        return NextResponse.json({
            audioData: result.audioData
        });

    } catch (error) {
        console.error("TTS API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
