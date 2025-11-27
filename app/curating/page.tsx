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
    const [displayGoal] = useState("personalized");

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

                // 1. Refine Goal
                setStatus("Personalizing your learning journey...");
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

                // 2. Generate Curriculum
                setStatus("Crafting your personalized curriculum...");
                setProgress(30);

                const curriculumResponse = await fetch("/api/curriculum/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userProfile, detailedGoal }),
                });

                if (!curriculumResponse.ok) throw new Error("Failed to generate curriculum");
                const curriculum = await curriculumResponse.json();

                const generatedLessons: LessonData[] = [];

                // 3. Generate Lessons
                for (let i = 0; i < curriculum.length; i++) {
                    const topic = curriculum[i];
                    setStatus(`Curating lesson ${i + 1}/${curriculum.length}: "${topic.title}"...`);
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
                        scenario: topic.description, // Override with the personalized description from curriculum
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
        <div className="min-h-screen w-full mudcloth-bg flex flex-col items-center justify-center p-6 text-center font-display relative overflow-hidden">
            {/* Elegant Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large soft orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-primary/5 rounded-full blur-3xl animate-float-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-sunny-yellow/5 rounded-full blur-3xl animate-float-delayed" />
            </div>

            <div className="relative z-10 max-w-md w-full flex flex-col items-center">
                {/* Central Icon Animation */}
                <div className="relative mb-12">
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ripple" />
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ripple-delayed" />

                    {/* Main Icon Container */}
                    <div className="relative bg-white p-8 rounded-full shadow-xl animate-breathe">
                        <Sparkles className="w-12 h-12 text-primary animate-pulse-subtle" strokeWidth={1.5} />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-earthy-brown mb-6 tracking-tight">
                    Curating Content
                </h1>

                {/* Status Card */}
                <div className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-lg mb-8 transition-all duration-500">
                    <p className="text-lg text-earthy-brown font-medium mb-6 min-h-[1.75rem]">
                        {status}
                    </p>

                    {/* Elegant Progress Bar */}
                    <div className="relative w-full h-2 bg-earthy-brown/10 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Shimmer overlay on the progress bar */}
                        <div
                            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            style={{
                                transform: `translateX(${progress - 100}%)`,
                                transition: 'transform 1s linear'
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-3 text-xs font-bold tracking-widest uppercase text-earthy-brown/40">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                <p className="text-earthy-brown/60 text-sm font-medium animate-fade-in-up">
                    Crafting your personalized experience...
                </p>
            </div>

            <style jsx>{`
                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, -20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-20px, 20px); }
                }
                @keyframes ripple {
                    0% { transform: scale(1); opacity: 0.4; }
                    100% { transform: scale(2); opacity: 0; }
                }
                @keyframes breathe {
                    0%, 100% { transform: scale(1); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
                    50% { transform: scale(1.05); box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); }
                }
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
                .animate-ripple { animation: ripple 3s cubic-bezier(0, 0.2, 0.8, 1) infinite; }
                .animate-ripple-delayed { animation: ripple 3s cubic-bezier(0, 0.2, 0.8, 1) infinite 1.5s; }
                .animate-breathe { animation: breathe 4s ease-in-out infinite; }
                .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
                .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
export default function CuratingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full mudcloth-bg flex flex-col items-center justify-center p-6">
                <div className="w-64 bg-earthy-brown/10 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-primary animate-pulse rounded-full w-full origin-left scale-x-50"></div>
                </div>
                <p className="text-earthy-brown/60 text-sm font-medium mt-4 animate-pulse">
                    Loading...
                </p>
            </div>
        }>
            <CuratingContent />
        </Suspense>
    );
}
