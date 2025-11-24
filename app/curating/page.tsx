"use client";

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { saveLessons, LessonData } from "@/lib/lessonStorage";
import { getUserProfile, saveUserProfile } from "@/lib/userStorage";

function CuratingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Preparing your lessons...");
    const [displayGoal, setDisplayGoal] = useState("personalized");

    useEffect(() => {
        const generateLessons = async () => {
            try {
                const userProfile = getUserProfile();

                if (!userProfile) {
                    console.error("No user profile found");
                    router.push("/onboarding");
                    return;
                }

                const targetLanguage = userProfile.language || "Twi";
                const userLevel = userProfile.level || "Beginner";

                // 1. Refine Goal (Goal Describer Agent)
                setStatus("Analyzing your profile and refining your goals...");
                setProgress(10);

                const goalResponse = await fetch("/api/goal/refine", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(userProfile),
                });

                if (!goalResponse.ok) throw new Error("Failed to refine goal");
                const { detailedGoal } = await goalResponse.json();

                // Update profile with detailed goal
                userProfile.detailedGoal = detailedGoal;
                saveUserProfile(userProfile);

                // 2. Generate Curriculum (Curriculum Agent)
                setStatus("Designing your personalized curriculum...");
                setProgress(30);

                const curriculumResponse = await fetch("/api/curriculum/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userProfile, detailedGoal }),
                });

                if (!curriculumResponse.ok) throw new Error("Failed to generate curriculum");
                const curriculum = await curriculumResponse.json();

                const generatedLessons: LessonData[] = [];

                // 3. Generate Lessons (Writer + Judge + Image Agents)
                for (let i = 0; i < curriculum.length; i++) {
                    const topic = curriculum[i];
                    setStatus(`Creating lesson ${i + 1}/${curriculum.length}: "${topic.title}"...`);
                    // Calculate progress from 30% to 90%
                    const stepProgress = 30 + Math.round(((i) / curriculum.length) * 60);
                    setProgress(stepProgress);

                    const response = await fetch("/api/lesson/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            context: topic.context, // Use context from curriculum
                            language: targetLanguage,
                            userLevel,
                            userGoal: detailedGoal, // Use the refined goal
                            title: topic.title, // Pass the simple title
                        }),
                    });

                    if (!response.ok) {
                        console.error(`Failed to generate lesson for ${topic.title}`);
                        continue;
                    }

                    const lessonData = await response.json();

                    // Override title/scenario with curriculum ones if needed, but the agent usually does a good job.
                    // Let's trust the lesson generator but ensure context is stored.
                    generatedLessons.push({
                        ...lessonData,
                        context: topic.context
                    });
                }

                // 4. Save and Navigate
                // We save the direct URLs now to avoid CORS issues and storage limits with Base64
                setProgress(100);
                setStatus("Finalizing...");

                saveLessons(generatedLessons);

                // Small delay to ensure storage is written
                setTimeout(() => {
                    const params = new URLSearchParams(searchParams.toString());
                    router.push(`/dashboard?${params.toString()}`);
                }, 500);

            } catch (error) {
                console.error("Failed to generate lessons:", error);
                setStatus("Something went wrong. Redirecting...");
                setTimeout(() => {
                    const params = new URLSearchParams(searchParams.toString());
                    router.push(`/dashboard?${params.toString()}`);
                }, 2000);
            }
        };

        generateLessons();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen w-full bg-warm-off-white flex flex-col items-center justify-center p-6 text-center font-display">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative bg-white p-6 rounded-full shadow-lg">
                    <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                </div>
            </div>

            <h1 className="text-2xl font-bold text-earthy-brown mb-2">
                Curating your {displayGoal} curriculum...
            </h1>
            <p className="text-earthy-brown/60 mb-4">
                {status}
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-sand-beige/50 rounded-full h-2 overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-sm text-earthy-brown/40 mt-2">{progress}%</p>
        </div>
    );
}

export default function CuratingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full bg-warm-off-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earthy-brown"></div></div>}>
            <CuratingContent />
        </Suspense>
    );
}
