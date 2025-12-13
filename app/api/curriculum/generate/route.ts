
import { NextResponse } from "next/server";
import { curriculumAgent } from "@/lib/ai/gemini";

export async function POST(req: Request) {
    try {
        const { userProfile, detailedGoal } = await req.json();

        // STATIC CURRICULUM GENERATOR (Latency Fix)
        // Instead of calling Gemini, we return a pre-defined path based on the goal.

        const goal = (userProfile?.goal || "General").toLowerCase();
        let curriculum = [];

        if (goal.includes("travel") || goal.includes("trip") || goal.includes("visit")) {
            curriculum = [
                {
                    context: "airport",
                    title: "At the Airport",
                    description: `${userProfile.name} arrives and navigates customs and baggage claim`
                },
                {
                    context: "taxi",
                    title: "Getting a Taxi",
                    description: `${userProfile.name} gives directions to the driver to reach the hotel`
                },
                {
                    context: "hotel",
                    title: "Hotel Check-in",
                    description: `${userProfile.name} checks in and asks about amenities`
                }
            ];
        } else if (goal.includes("business") || goal.includes("work") || goal.includes("job")) {
            curriculum = [
                {
                    context: "introduction",
                    title: "Professional Intro",
                    description: `${userProfile.name} introduces themselves to new colleagues`
                },
                {
                    context: "meeting",
                    title: "Team Meeting",
                    description: `${userProfile.name} listens to updates and asks a simple question`
                },
                {
                    context: "lunch",
                    title: "Business Lunch",
                    description: `${userProfile.name} networks with a client over a meal`
                }
            ];
        } else if (goal.includes("family") || goal.includes("heritage") || goal.includes("connect")) {
            curriculum = [
                {
                    context: "greeting_elders",
                    title: "Greeting Elders",
                    description: `${userProfile.name} learns the respectful way to greet family elders`
                },
                {
                    context: "family_dinner",
                    title: "Family Dinner",
                    description: `${userProfile.name} joins a family meal and compliments the food`
                },
                {
                    context: "stories",
                    title: "Sharing Stories",
                    description: `${userProfile.name} asks a simple question about family history`
                }
            ];
        } else {
            // Default / General
            curriculum = [
                {
                    context: "greetings",
                    title: "Basic Greetings",
                    description: `${userProfile.name} learns to say hello and ask 'how are you?'`
                },
                {
                    context: "market",
                    title: "At the Market",
                    description: `${userProfile.name} practices buying fruit and bargaining`
                },
                {
                    context: "restaurant",
                    title: "Ordering Food",
                    description: `${userProfile.name} orders a delicious local dish`
                }
            ];
        }

        // Simulate a tiny delay to feel "processed" but fast (optional, can be removed)
        // await new Promise(resolve => setTimeout(resolve, 500));

        return NextResponse.json(curriculum);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate curriculum" },
            { status: 500 }
        );
    }
}
