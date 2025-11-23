import { NextResponse } from "next/server";
import { managerAgent } from "@/lib/ai/gemini"; // Import managerAgent

export async function POST(req: Request) {
    try {
        const { context, language, userLevel, userGoal, title } = await req.json();

        if (!context || !language) {
            return NextResponse.json(
                { error: "Context and Language are required" },
                { status: 400 }
            );
        }

        const lesson = await managerAgent.generateLessonPlan(context, language, userLevel, userGoal, title);

        return NextResponse.json(lesson);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate lesson" },
            { status: 500 }
        );
    }
}
