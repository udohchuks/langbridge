"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
    const router = useRouter();

    useEffect(() => {
        const { getUserProfile } = require("@/lib/userStorage");
        const user = getUserProfile();
        if (user) {
            router.push("/dashboard");
        }
    }, [router]);

    const handleSelection = (category: "junior" | "individual") => {
        if (category === "individual") {
            router.push("/onboarding");
        } else {
            // For prototype, maybe just alert or go to same place
            alert("Junior mode coming soon! Proceeding to Individual mode.");
            router.push("/onboarding");
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-warm-off-white dark:bg-background-dark group/design-root overflow-x-hidden font-display">
            {/* TopAppBar */}
            <div className="flex items-center bg-warm-off-white dark:bg-background-dark p-4 pb-2 justify-between">
                <div className="flex size-12 shrink-0 items-center justify-start"></div>
                <h1 className="text-earthy-brown dark:text-warm-off-white text-2xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                    AfroLingo
                </h1>
                <div className="flex w-12 items-center justify-end"></div>
            </div>

            {/* HeadlineText */}
            <h2 className="text-earthy-brown dark:text-warm-off-white tracking-light text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
                Welcome!
            </h2>

            {/* BodyText */}
            <p className="text-earthy-brown dark:text-sand-beige text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
                Choose your learning path to begin
            </p>

            <main className="flex-grow px-4 py-6 flex flex-col gap-6">
                {/* Junior Card */}
                <div
                    onClick={() => handleSelection("junior")}
                    className="flex flex-col items-center justify-start rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] bg-sunny-yellow dark:bg-yellow-800/50 cursor-pointer transition-transform hover:scale-105"
                >
                    <div className="w-full h-40 bg-sunny-yellow dark:bg-yellow-800/50 flex items-center justify-center rounded-t-xl">
                        <span className="material-symbols-outlined text-earthy-brown dark:text-warm-off-white !text-8xl">
                            emoji_nature
                        </span>
                    </div>
                    <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-2 p-4 pt-2 bg-warm-off-white dark:bg-earthy-brown/40 rounded-b-xl">
                        <p className="text-earthy-brown dark:text-warm-off-white text-xl font-bold leading-tight tracking-[-0.015em]">
                            Junior
                        </p>
                        <div className="flex items-end gap-3 justify-between">
                            <p className="text-earthy-brown/80 dark:text-sand-beige text-base font-normal leading-normal">
                                For learners under 12
                            </p>
                        </div>
                    </div>
                </div>

                {/* Individual Card */}
                <div
                    onClick={() => handleSelection("individual")}
                    className="flex flex-col items-center justify-start rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] bg-sand-beige dark:bg-neutral-800 cursor-pointer transition-transform hover:scale-105"
                >
                    <div className="w-full h-40 bg-sand-beige dark:bg-neutral-800 flex items-center justify-center rounded-t-xl">
                        <span className="material-symbols-outlined text-earthy-brown dark:text-warm-off-white !text-8xl">
                            account_circle
                        </span>
                    </div>
                    <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-2 p-4 pt-2 bg-warm-off-white dark:bg-earthy-brown/40 rounded-b-xl">
                        <p className="text-earthy-brown dark:text-warm-off-white text-xl font-bold leading-tight tracking-[-0.015em]">
                            Individual
                        </p>
                        <div className="flex items-end gap-3 justify-between">
                            <p className="text-earthy-brown/80 dark:text-sand-beige text-base font-normal leading-normal">
                                For learners 12 and older
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <div className="h-5 bg-warm-off-white dark:bg-background-dark"></div>
        </div>
    );
}
