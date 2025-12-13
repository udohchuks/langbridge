import React from 'react';

interface CompletionModalProps {
    isOpen: boolean;
    xpEarned: number;
    badges: string[];
    onStartPractice: () => void;
}

const BADGE_INFO: Record<string, { label: string; icon: string; color: string }> = {
    first_lesson: { label: 'First Steps', icon: '🌟', color: 'text-yellow-600' },
    polite_speaker: { label: 'Polite Speaker', icon: '🎭', color: 'text-purple-600' },
    streak_5: { label: '5-Day Streak', icon: '🔥', color: 'text-orange-600' },
    streak_10: { label: '10-Day Warrior', icon: '⚡', color: 'text-red-600' },
    xp_100: { label: 'XP Hunter', icon: '💎', color: 'text-blue-600' },
    xp_500: { label: 'XP Master', icon: '👑', color: 'text-indigo-600' },
};

export function CompletionModal({
    isOpen,
    xpEarned,
    badges,
    onStartPractice,
}: CompletionModalProps) {
    if (!isOpen) return null;

    const newBadges = badges.slice(-2); // Show last 2 badges if recently earned

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in duration-300">
                {/* Celebration Header */}
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <h2 className="text-3xl font-bold text-earthy-brown mb-2">
                        Ready to Practice!
                    </h2>
                    <p className="text-savanna-green/70">
                        You've completed your study session
                    </p>
                </div>

                {/* XP Earned */}
                <div className="bg-gradient-to-r from-terracotta-orange/10 to-savanna-green/10 rounded-2xl p-6 mb-6">
                    <div className="text-center">
                        <p className="text-sm text-savanna-green/70 mb-1">XP Earned</p>
                        <p className="text-5xl font-bold text-terracotta-orange">{xpEarned}</p>
                    </div>
                </div>

                {/* Badges */}
                {newBadges.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm font-medium text-savanna-green/70 mb-3 text-center">
                            New Badges Unlocked!
                        </p>
                        <div className="flex gap-3 justify-center">
                            {newBadges.map((badge) => {
                                const info = BADGE_INFO[badge] || {
                                    label: badge,
                                    icon: '🏆',
                                    color: 'text-gray-600'
                                };
                                return (
                                    <div
                                        key={badge}
                                        className="flex flex-col items-center gap-1 bg-white rounded-xl p-3 shadow-md border border-earthy-brown/10"
                                    >
                                        <span className="text-3xl">{info.icon}</span>
                                        <span className={`text-xs font-bold ${info.color}`}>
                                            {info.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Start Practice Button */}
                <button
                    onClick={onStartPractice}
                    className="w-full bg-terracotta-orange text-white font-bold text-lg py-4 rounded-full shadow-lg hover:bg-terracotta-orange/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <span>Start Practice Chat</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    );
}
