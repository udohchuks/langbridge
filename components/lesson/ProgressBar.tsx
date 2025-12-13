import React from 'react';

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    className?: string;
}

export function ProgressBar({ currentStep, totalSteps, className = '' }: ProgressBarProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex-1 flex items-center">
                    <div
                        className={`h-2 rounded-full flex-1 transition-all duration-300 ${step <= currentStep
                                ? 'bg-terracotta-orange'
                                : 'bg-earthy-brown/20'
                            }`}
                    />
                    {step < totalSteps && (
                        <div className="w-1" /> // Small gap between bars
                    )}
                </div>
            ))}
        </div>
    );
}
