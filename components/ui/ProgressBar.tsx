import React from "react";

interface ProgressBarProps {
    totalSteps: number;
    currentStep: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    totalSteps,
    currentStep,
}) => {
    return (
        <div className="flex flex-row items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors duration-300 ${index < currentStep ? "bg-terracotta-orange" : "bg-white/50"
                        }`}
                />
            ))}
        </div>
    );
};
