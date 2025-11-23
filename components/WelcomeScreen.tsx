'use client';
import { Bug, User } from 'lucide-react';

export const WelcomeScreen = ({ onComplete }: { onComplete: () => void }) => {
    return (
        <div className="min-h-screen w-full bg-warm-off-white flex flex-col items-center px-6 py-12 font-display text-earthy-brown">
            {/* Header */}
            <header className="w-full flex justify-center mb-16">
                <h1 className="text-3xl font-bold tracking-tight text-earthy-brown">LangBridge</h1>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-md flex flex-col items-center gap-10">
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-extrabold text-earthy-brown">Welcome!</h2>
                    <p className="text-earthy-brown/70 text-lg font-medium">
                        Choose your learning path to begin
                    </p>
                </div>

                <div className="w-full space-y-5">
                    {/* Junior Card */}
                    <button
                        onClick={onComplete}
                        className="group w-full bg-sunny-yellow rounded-[2rem] p-8 flex flex-col items-start text-left transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
                    >
                        <div className="w-full flex justify-center mb-8">
                            <div className="relative p-4 bg-white/20 rounded-full">
                                <Bug className="w-20 h-20 text-earthy-brown" strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-earthy-brown">Junior</h3>
                            <p className="text-earthy-brown/80 font-medium">For learners under 12</p>
                        </div>
                    </button>

                    {/* Individual Card */}
                    <button
                        onClick={onComplete}
                        className="group w-full bg-sand-beige rounded-[2rem] p-8 flex flex-col items-start text-left transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
                    >
                        <div className="w-full flex justify-center mb-8">
                            <div className="w-28 h-28 bg-earthy-brown rounded-full flex items-center justify-center group-hover:bg-earthy-brown/90 transition-colors">
                                <User className="w-14 h-14 text-sand-beige" strokeWidth={2} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-earthy-brown">Individual</h3>
                            <p className="text-earthy-brown/80 font-medium">For learners 12 and older</p>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};