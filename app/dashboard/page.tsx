"use client";

import { useRouter } from "next/navigation";
import { Settings, User } from "lucide-react";
import { Timeline } from "@/components/dashboard/Timeline";
import { LessonCard } from "@/components/dashboard/LessonCard";
import { getLessons, LessonData } from "@/lib/lessonStorage";
import { useEffect, useState } from "react";

import { Suspense } from "react";

function DashboardContent() {
    const router = useRouter();

    const [lessons, setLessons] = useState<LessonData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = () => {
            const cachedLessons = getLessons();

            if (cachedLessons && cachedLessons.length > 0) {
                setLessons(cachedLessons);
                setLoading(false);
            } else {
                // If no lessons, redirect to curating to generate them
                const userProfile = localStorage.getItem("userProfile");
                if (userProfile) {
                    router.push("/curating");
                } else {
                    router.push("/onboarding");
                }
            }
        };

        loadDashboard();
    }, [router]);

    const handleStartLesson = (context: string) => {
        router.push(`/lesson?context=${context}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-warm-off-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earthy-brown"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] w-full mudcloth-bg font-display overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-warm-off-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-earthy-brown/5">
                <div className="w-10 h-10 bg-earthy-brown rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-sand-beige" />
                </div>
                <h1 className="text-xl font-bold text-earthy-brown">AfroLingo</h1>
                <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <Settings className="w-6 h-6 text-earthy-brown" />
                </button>
            </header>

            <main className="pb-20">
                <div className="px-6 py-8 text-center">
                    <h2 className="text-2xl font-bold text-earthy-brown mb-2">
                        Your Journey Begins
                    </h2>
                    <p className="text-earthy-brown/60 text-sm">
                        Master the basics of conversation
                    </p>
                </div>

                <Timeline>
                    {lessons.map((lesson: LessonData) => {
                        // All lessons are open/active as per requirements
                        const status = "active";

                        return (
                            <LessonCard
                                key={lesson.context}
                                title={lesson.title}
                                status={status}
                                image={lesson.headerImage}
                                description={lesson.scenario}
                                context={lesson.context}
                                onClick={() => handleStartLesson(lesson.context)}
                            />
                        );
                    })}
                </Timeline>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full bg-warm-off-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earthy-brown"></div></div>}>
            <DashboardContent />
        </Suspense>
    );
}
