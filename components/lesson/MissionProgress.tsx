import React from 'react';
import { ProgressBar } from './ProgressBar';

interface MissionProgressProps {
    title: string;
    currentStep: number;
    totalSteps: number;
    stepLabel?: string;
}

export function MissionProgress({
    title,
    currentStep,
    totalSteps,
    stepLabel
}: MissionProgressProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-earthy-brown flex items-center gap-2">
                    <span>🎯</span>
                    <span>{title}</span>
                </h2>
                <span className="text-sm font-medium text-savanna-green/70">
                    {stepLabel || `Step ${currentStep} of ${totalSteps}`}
                </span>
            </div>
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>
    );
}
