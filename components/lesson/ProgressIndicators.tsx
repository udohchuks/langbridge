import React from 'react';

interface ProgressIndicatorsProps {
    xp: number;
    streak: number;
    accuracy?: number;
    compact?: boolean;
}

export function ProgressIndicators({
    xp,
    streak,
    accuracy,
    compact = false
}: ProgressIndicatorsProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-savanna-green">
                    <span className="font-bold">{xp}</span>
                    <span className="text-xs opacity-70">XP</span>
                </div>
                {streak > 0 && (
                    <div className="flex items-center gap-1">
                        <span>🔥</span>
                        <span className="font-bold text-terracotta-orange">{streak}</span>
                    </div>
                )}
                {accuracy !== undefined && accuracy > 0 && (
                    <div className="flex items-center gap-1">
                        <span>🎯</span>
                        <span className="font-bold text-savanna-green">{accuracy}%</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-sm">
            <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-savanna-green">{xp}</span>
                <span className="text-xs text-savanna-green/70">XP</span>
            </div>
            {streak > 0 && (
                <div className="flex items-center gap-1.5">
                    <span>🔥</span>
                    <span className="font-bold text-terracotta-orange">{streak}</span>
                </div>
            )}
            {accuracy !== undefined && accuracy > 0 && (
                <div className="flex items-center gap-1.5">
                    <span>🎯</span>
                    <span className="font-bold text-savanna-green">{accuracy}%</span>
                </div>
            )}
        </div>
    );
}
