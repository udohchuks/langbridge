import React, { useState } from 'react';
import { MicWidget } from './MicWidget';
import { PronunciationFeedback } from './PronunciationFeedback';
import { SpeechEvaluationResult } from '@/lib/ai/agents/pronunciationAgent';

interface VocabCardProps {
    native: string;
    english: string;
    pronunciation: string;
    index: number;
    isKnown: boolean;
    isPracticing: boolean;
    onMarkKnown: (index: number) => void;
    onMarkPractice: (index: number) => void;
    onSpeechEval?: (audioBlob: Blob, expectedText: string) => Promise<SpeechEvaluationResult | null>;
    playAudio: (text: string) => void;
    playingAudio: string | null;
    language?: string;
    dialect?: string;
}

export function VocabCard({
    native,
    english,
    pronunciation,
    index,
    isKnown,
    isPracticing,
    onMarkKnown,
    onMarkPractice,
    onSpeechEval,
    playAudio,
    playingAudio,
    language,
    dialect,
}: VocabCardProps) {
    const [showPractice, setShowPractice] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [speechResult, setSpeechResult] = useState<SpeechEvaluationResult | null>(null);

    const handlePracticeClick = () => {
        if (!isPracticing) {
            onMarkPractice(index);
        }
        setShowPractice(!showPractice);
    };

    const handleKnownClick = () => {
        onMarkKnown(index);
        setShowPractice(false);
        setSpeechResult(null);
    };

    const handleSpeechEval = async (audioBlob: Blob) => {
        if (!onSpeechEval) return;

        setIsProcessing(true);
        try {
            const result = await onSpeechEval(audioBlob, native);
            setSpeechResult(result);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-earthy-brown/5">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-lg font-bold text-earthy-brown">{native}</p>
                        {isKnown && (
                            <span className="text-green-500" title="You know this!">✅</span>
                        )}
                    </div>
                    <p className="text-sm text-savanna-green/60 italic mb-1">{pronunciation}</p>
                    <p className="text-base text-earthy-brown/80">{english}</p>
                </div>
                <button
                    onClick={() => playAudio(native)}
                    disabled={playingAudio !== null}
                    className={`w-10 h-10 rounded-full bg-sand-beige flex items-center justify-center text-savanna-green hover:bg-savanna-green/10 transition-colors shrink-0 ml-2 ${playingAudio === native ? 'animate-pulse' : ''
                        }`}
                >
                    <span className="material-symbols-outlined">volume_up</span>
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                <button
                    onClick={handleKnownClick}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${isKnown
                            ? 'bg-green-500 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                >
                    {isKnown ? '✓ Known' : 'I know this'}
                </button>
                <button
                    onClick={handlePracticeClick}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${isPracticing
                            ? 'bg-terracotta-orange text-white'
                            : 'bg-terracotta-orange/10 text-terracotta-orange hover:bg-terracotta-orange/20'
                        }`}
                >
                    {showPractice ? 'Hide Practice' : 'Practice'}
                </button>
            </div>

            {/* Practice Section */}
            {showPractice && (
                <div className="mt-4 p-3 bg-sand-beige/30 rounded-lg">
                    <p className="text-sm text-savanna-green/80 mb-3 text-center font-medium">
                        🎤 Try saying: <span className="font-bold text-earthy-brown">{native}</span>
                    </p>

                    {speechResult && (
                        <div className="mb-3">
                            <PronunciationFeedback result={speechResult} />
                        </div>
                    )}

                    <div className="flex justify-center">
                        <MicWidget
                            onRecordingComplete={handleSpeechEval}
                            isProcessing={isProcessing}
                        />
                    </div>

                    {speechResult && speechResult.accuracy >= 70 && (
                        <div className="mt-3 text-center">
                            <p className="text-sm text-green-600 mb-2">Great job! 🎉</p>
                            <button
                                onClick={handleKnownClick}
                                className="text-xs text-savanna-green/70 hover:text-savanna-green underline"
                            >
                                Mark as known
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
