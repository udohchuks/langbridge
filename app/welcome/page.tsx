"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/userStorage";

export default function WelcomePage() {
    const router = useRouter();

    useEffect(() => {
        const user = getUserProfile();
        if (user) {
            router.push("/dashboard");
        }
    }, [router]);

    const handleSelection = (category: "minor" | "individual") => {
        if (category === "individual") {
            router.push("/onboarding");
        } else {
            // For prototype, maybe just alert or go to same place
            alert("Minor mode coming soon! Proceeding to Individual mode.");
            router.push("/onboarding");
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-warm-off-white dark:bg-background-dark group/design-root overflow-x-hidden font-display">
            {/* TopAppBar */}
            <div className="flex items-center bg-warm-off-white dark:bg-background-dark p-4 pb-2 justify-center">
                <h1 className="text-earthy-brown dark:text-warm-off-white text-2xl font-bold leading-tight tracking-[-0.015em] text-center">
                    AfroLingo
                </h1>
            </div>

            {/* HeadlineText */}
            <div className="flex flex-col items-center px-4 pt-6 pb-4 text-center">
                <h2 className="text-earthy-brown dark:text-warm-off-white tracking-tight text-3xl font-bold leading-tight mb-2">
                    Welcome!
                </h2>
                <p className="text-earthy-brown/80 dark:text-sand-beige text-base font-normal leading-normal max-w-xs">
                    Choose your learning path to begin your journey.
                </p>
            </div>

            <main className="flex-grow px-4 py-4 flex flex-col gap-6 max-w-md mx-auto w-full">
                {/* Minor Card */}
                <div
                    onClick={() => handleSelection("minor")}
                    className="flex flex-col items-center justify-start rounded-2xl shadow-md bg-sunny-yellow dark:bg-yellow-800/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 overflow-hidden group"
                >
                    <div className="w-full h-32 sm:h-40 bg-sunny-yellow dark:bg-yellow-800/50 flex items-center justify-center">
                        {/* SVG Icon: Nature/Sprout */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-earthy-brown dark:text-warm-off-white group-hover:scale-110 transition-transform duration-300">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fillOpacity="0.2" />
                            <path d="M12 18V6M12 18C8 18 5 15 5 12M12 18C16 18 19 15 19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M12 6C10 6 8.5 7.5 8.5 9.5C8.5 11.5 10 13 12 13C14 13 15.5 11.5 15.5 9.5C15.5 7.5 14 6 12 6Z" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="flex w-full flex-col items-start justify-center gap-1 p-5 bg-warm-off-white dark:bg-earthy-brown/40">
                        <p className="text-earthy-brown dark:text-warm-off-white text-xl font-bold leading-tight">
                            Minor
                        </p>
                        <p className="text-earthy-brown/70 dark:text-sand-beige text-sm font-medium">
                            For learners under 12
                        </p>
                    </div>
                </div>

                {/* Individual Card */}
                <div
                    onClick={() => handleSelection("individual")}
                    className="flex flex-col items-center justify-start rounded-2xl shadow-md bg-sand-beige dark:bg-neutral-800 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 overflow-hidden group"
                >
                    <div className="w-full h-32 sm:h-40 bg-sand-beige dark:bg-neutral-800 flex items-center justify-center">
                        {/* SVG Icon: Person */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 text-earthy-brown dark:text-warm-off-white group-hover:scale-110 transition-transform duration-300">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex w-full flex-col items-start justify-center gap-1 p-5 bg-warm-off-white dark:bg-earthy-brown/40">
                        <p className="text-earthy-brown dark:text-warm-off-white text-xl font-bold leading-tight">
                            Individual
                        </p>
                        <p className="text-earthy-brown/70 dark:text-sand-beige text-sm font-medium">
                            For learners 12 and older
                        </p>
                    </div>
                </div>
            </main>

            <div className="h-6 bg-transparent"></div>
        </div>
    );
}
