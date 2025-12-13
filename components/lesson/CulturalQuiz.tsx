import React, { useState } from 'react';

interface CulturalQuizProps {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    onComplete: (correct: boolean) => void;
}

export function CulturalQuiz({
    question,
    options,
    correctIndex,
    explanation,
    onComplete,
}: CulturalQuizProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);

    const handleOptionClick = (index: number) => {
        if (showResult) return; // Already answered

        setSelectedIndex(index);
        setShowResult(true);

        const isCorrect = index === correctIndex;
        onComplete(isCorrect);
    };

    const isCorrect = selectedIndex === correctIndex;

    return (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-terracotta-orange/20">
            <h3 className="text-lg font-bold text-earthy-brown mb-4 flex items-center gap-2">
                <span>🧠</span>
                <span>Quick Culture Check</span>
            </h3>

            <p className="text-base text-earthy-brown/90 mb-4 font-medium">
                {question}
            </p>

            <div className="space-y-2 mb-4">
                {options.map((option, index) => {
                    const isSelected = selectedIndex === index;
                    const isCorrectOption = index === correctIndex;

                    let buttonClass = 'w-full text-left p-3 rounded-lg border-2 transition-all ';

                    if (!showResult) {
                        buttonClass += 'border-earthy-brown/20 hover:border-terracotta-orange/40 hover:bg-terracotta-orange/5 text-earthy-brown';
                    } else if (isCorrectOption) {
                        buttonClass += 'border-green-500 bg-green-50 text-green-800';
                    } else if (isSelected && !isCorrectOption) {
                        buttonClass += 'border-red-400 bg-red-50 text-red-800';
                    } else {
                        buttonClass += 'border-earthy-brown/10 text-earthy-brown/50';
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(index)}
                            disabled={showResult}
                            className={buttonClass}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{option}</span>
                                {showResult && isCorrectOption && (
                                    <span className="text-green-600">✓</span>
                                )}
                                {showResult && isSelected && !isCorrectOption && (
                                    <span className="text-red-600">✗</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showResult && (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                    {isCorrect ? (
                        <div>
                            <p className="font-bold text-green-700 mb-2 flex items-center gap-2">
                                <span>🎉</span>
                                <span>Correct! +10 XP</span>
                            </p>
                            <p className="text-sm text-green-800">{explanation}</p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-bold text-blue-700 mb-2">Good try!</p>
                            <p className="text-sm text-blue-800">{explanation}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
