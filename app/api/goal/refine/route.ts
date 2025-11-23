
import { NextResponse } from "next/server";
import { goalAgent } from "@/lib/ai/gemini";

export async function POST(req: Request) {
    try {
        const userProfile = await req.json();
        const detailedGoal = await goalAgent.refineGoal(userProfile);
        return NextResponse.json({ detailedGoal });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to refine goal" },
            { status: 500 }
        );
    }
}
