"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { NameStep } from "@/components/onboarding/NameStep";
import { AgeStep } from "@/components/onboarding/AgeStep";
import { LanguageStep } from "@/components/onboarding/LanguageStep";
import { ProficiencyStep } from "@/components/onboarding/ProficiencyStep";
import { ContextChatStep } from "@/components/onboarding/ContextChatStep";
import { saveUserProfile } from "@/lib/userStorage";

const goals = [
    { id: "family", icon: "cottage", label: "Family & Friends" },
    { id: "business", icon: "business_center", label: "Business & Career" },
    { id: "travel", icon: "flight_takeoff", label: "Travel & Culture" },
    { id: "fun", icon: "celebration", label: "Random Fun" },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        language: "",
        level: "",
        goal: "",
        customGoal: "",
        contextDetails: ""
    });

    const totalSteps = 6;

    const handleNameSubmit = (name: string) => {
        setFormData(prev => ({ ...prev, name }));
        setCurrentStep(2);
    };

    const handleAgeSubmit = (age: string) => {
        setFormData(prev => ({ ...prev, age }));
        setCurrentStep(3);
    };

    const handleLanguageSubmit = (language: string) => {
        setFormData(prev => ({ ...prev, language }));
        setCurrentStep(4);
    };

    const handleProficiencySubmit = (level: string) => {
        setFormData(prev => ({ ...prev, level }));
        setCurrentStep(5);
    };

    const handleGoalSelect = (goalId: string) => {
        setFormData(prev => ({ ...prev, goal: goalId }));
    };

    const handleCustomGoalChange = (value: string) => {
        setFormData(prev => ({ ...prev, customGoal: value }));
    };

    const handleGoalSubmit = () => {
        if (formData.goal || formData.customGoal) {
            setCurrentStep(6);
        }
    };

    const handleContextSubmit = (details: string) => {
        finishOnboarding(details);
    };

    const handleContextSkip = () => {
        finishOnboarding("");
    };

    const finishOnboarding = (details: string) => {
        const context = formData.goal === "custom" ? formData.customGoal : formData.goal;

        // Generate summary
        const selectedGoal = goals.find(g => g.id === formData.goal);
        const goalLabel = selectedGoal ? selectedGoal.label : (formData.goal === "custom" ? "Custom Goal" : formData.goal);
        const goalDescription = formData.goal === "custom" ? formData.customGoal : goalLabel;

        const summary = `User ${formData.name} (${formData.age}) wants to learn ${formData.language} for ${goalDescription}. Context: ${details || "None provided"}`;

        // Save user profile
        saveUserProfile({
            name: formData.name,
            age: formData.age,
            language: formData.language,
            level: formData.level,
            goal: formData.goal,
            customGoal: formData.customGoal,
            contextDetails: details,
            summary: summary
        });

        // Navigate to curating page
        router.push(`/curating?context=${encodeURIComponent(context || "")}&details=${encodeURIComponent(details)}&name=${encodeURIComponent(formData.name)}&lang=${encodeURIComponent(formData.language)}`);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden bg-background-light dark:bg-background-dark font-display">
            <main className="flex flex-1 flex-col p-6 max-w-md mx-auto w-full h-full">
                <div className="flex flex-col gap-8 w-full h-full">
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2 pt-4 shrink-0">
                        <div className="flex justify-between items-center">
                            {currentStep > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1 text-earthy-brown dark:text-sand-beige hover:text-primary dark:hover:text-primary transition-colors"
                                    aria-label="Go back"
                                >
                                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                                    <span className="text-sm font-medium">Back</span>
                                </button>
                            ) : (
                                <div></div>
                            )}
                            <p className="text-earthy-brown dark:text-sand-beige text-sm font-bold leading-normal">
                                Step {currentStep} of {totalSteps}
                            </p>
                        </div>
                        <div className="rounded-full bg-sand-beige h-3 w-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 flex flex-col justify-start pt-8 min-h-0">
                        {currentStep === 1 && (
                            <NameStep onNext={handleNameSubmit} initialValue={formData.name} />
                        )}

                        {currentStep === 2 && (
                            <AgeStep onNext={handleAgeSubmit} initialValue={formData.age} />
                        )}

                        {currentStep === 3 && (
                            <LanguageStep onNext={handleLanguageSubmit} initialValue={formData.language} />
                        )}

                        {currentStep === 4 && (
                            <ProficiencyStep onNext={handleProficiencySubmit} initialValue={formData.level} />
                        )}

                        {currentStep === 5 && (
                            <div className="flex flex-col gap-8 animate-fade-in">
                                <div className="space-y-2 text-center">
                                    <h1 className="text-3xl font-bold text-earthy-brown dark:text-warm-off-white">
                                        Why do you want to learn?
                                    </h1>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {goals.map((goal) => (
                                            <div
                                                key={goal.id}
                                                onClick={() => handleGoalSelect(goal.id)}
                                                className={`flex flex-1 flex-col gap-3 rounded-2xl border-2 bg-white dark:bg-white/5 p-4 items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-sm ${formData.goal === goal.id
                                                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                                    : "border-transparent"
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-earthy-brown dark:text-warm-off-white text-3xl">
                                                    {goal.icon}
                                                </span>
                                                <h2 className="text-earthy-brown dark:text-warm-off-white text-sm font-bold leading-tight">
                                                    {goal.label}
                                                </h2>
                                            </div>
                                        ))}

                                        <div
                                            onClick={() => handleGoalSelect("custom")}
                                            className={`col-span-2 flex flex-1 flex-col gap-3 rounded-2xl border-2 bg-white dark:bg-white/5 p-4 items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-sm ${formData.goal === "custom"
                                                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                                : "border-transparent"
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-earthy-brown dark:text-warm-off-white text-3xl">
                                                edit
                                            </span>
                                            <h2 className="text-earthy-brown dark:text-warm-off-white text-sm font-bold leading-tight">
                                                Custom Goal
                                            </h2>
                                        </div>
                                    </div>

                                    {formData.goal === "custom" && (
                                        <div className="animate-fade-in">
                                            <label className="sr-only" htmlFor="custom_reason">
                                                Your reason
                                            </label>
                                            <input
                                                className="w-full rounded-xl border-0 bg-sand-beige/50 p-4 text-lg text-earthy-brown placeholder:text-earthy-brown/40 focus:ring-2 focus:ring-primary outline-none transition-all"
                                                id="custom_reason"
                                                placeholder="Type your reason here..."
                                                type="text"
                                                value={formData.customGoal}
                                                onChange={(e) => handleCustomGoalChange(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <Button
                                        onClick={handleGoalSubmit}
                                        disabled={!formData.goal || (formData.goal === "custom" && !formData.customGoal.trim())}
                                        className="w-full py-6 text-lg rounded-full"
                                    >
                                        Continue
                                    </Button>
                                    <Button variant="ghost" onClick={() => router.push("/lesson")} className="text-earthy-brown/60 hover:text-earthy-brown">
                                        Skip for now
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 6 && (
                            <ContextChatStep onNext={handleContextSubmit} onSkip={handleContextSkip} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
