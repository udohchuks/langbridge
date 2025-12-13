"use client";

import React from 'react';
import { SpeechEvaluationResult, PhonemeIssue } from '@/lib/ai/agents/pronunciationAgent';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface PronunciationFeedbackProps {
    result: SpeechEvaluationResult | null;
}

export const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({ result }) => {
    if (!result) return null;

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Show error message if present
    if (result.error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 mt-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold">Speech Analysis Failed</h3>
                        <p className="text-sm text-red-500 mt-1">{result.error}</p>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">Tip: Speak clearly and ensure your microphone is working properly.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Pronunciation Feedback</h3>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 ${getScoreColor(result.accuracy)}`}>
                    <span className="text-2xl font-bold">{result.accuracy}%</span>
                    <span className="text-sm font-medium">Accuracy</span>
                </div>
            </div>

            <div className="space-y-6">
                {/* Transcript Comparison */}
                <div>
                    <p className="text-xs font-uppercase text-gray-400 font-bold mb-1">TRANSCRIPT MATCH</p>
                    <div className="flex flex-col gap-2">
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-600 font-mono text-sm">
                            "{result.transcript}"
                        </div>
                    </div>
                </div>

                {/* Phoneme Analysis */}
                <div>
                    <p className="text-xs font-uppercase text-gray-400 font-bold mb-2">PHONEME BREAKDOWN</p>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 font-mono text-sm text-blue-800 tracking-wide text-center">
                        /{result.phonemes}/
                    </div>
                </div>

                {/* Issues List */}
                {result.issues && result.issues.length > 0 ? (
                    <div>
                        <p className="text-xs font-uppercase text-gray-400 font-bold mb-2">IMPROVEMENT TIPS</p>
                        <div className="space-y-3">
                            {result.issues.map((issue, idx) => (
                                <div key={idx} className="flex gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100 text-sm">
                                    <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                                    <div>
                                        <div className="flex items-center gap-2 font-medium text-orange-900">
                                            <span>Expected: <span className="font-mono bg-white px-1 rounded border border-orange-200">/{issue.phoneme}/</span></span>
                                            <span>→</span>
                                            <span>You said: <span className="font-mono bg-white px-1 rounded border border-orange-200">/{issue.userPronounced}/</span></span>
                                        </div>
                                        <p className="mt-1 text-orange-800">{issue.tip}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Perfect pronunciation! Keep it up.</span>
                    </div>
                )}
            </div>
        </div>
    );
};
