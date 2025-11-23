
import { NextResponse } from "next/server";
import { curriculumAgent } from "@/lib/ai/gemini";

export async function POST(req: Request) {
    try {
        const { userProfile, detailedGoal } = await req.json();
        const curriculum = await curriculumAgent.generateCurriculum(userProfile, detailedGoal);
        return NextResponse.json(curriculum);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate curriculum" },
            { status: 500 }
        );
    }
}
