import React, { useState, useEffect } from 'react';
import { formatTitle } from '@/lib/format';
import { MissionProgress } from './MissionProgress';
import { VocabCard } from './VocabCard';
import { CulturalQuiz } from './CulturalQuiz';
import { CompletionModal } from './CompletionModal';
import { FloatingChatButton } from './FloatingChatButton';
import { SpeechEvaluationResult } from '@/lib/ai/agents/pronunciationAgent';
import {
    getLessonProgress,
    markVocabKnown,
    markVocabPractice,
    recordCulturalQuiz,
    updateLessonStep,
    awardXP,
    getUserProgress,
    recordSpeechScore,
    completeLesson,
} from '@/lib/progressStorage';
import { getUserProfile } from '@/lib/userStorage';

interface StudyItem {
    native: string;
    english: string;
    pronunciation: string;
}

interface StudyViewProps {
    title: string;
    goal: string;
    vocabulary: StudyItem[];
    keyPhrases: StudyItem[];
    culturalNote: {
        title: string;
        pronunciation: string;
        description: string;
    };
    onStartPractice: () => void;
    language?: string;
    dialect?: string;
    context?: string;
}

export function StudyView({
    title,
    goal,
    vocabulary,
    keyPhrases,
    culturalNote,
    onStartPractice,
    language = "Yoruba",
    dialect = "default",
    context = "default"
}: StudyViewProps) {
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [lessonProgress, setLessonProgress] = useState(getLessonProgress(context));
    const [showCompletion, setShowCompletion] = useState(false);
    const [sessionXP, setSessionXP] = useState(0);
    const [userProgress, setUserProgress] = useState(getUserProgress());

    // Define mission steps
    const STEPS = [
        'Learn Key Vocabulary',
        'Master Useful Phrases',
        'Cultural Insight',
        'Quiz Time',
        'Ready to Practice'
    ];

    useEffect(() => {
        // Update lesson progress step based on scroll or interaction
        const currentStep = Math.min(lessonProgress.currentStep, STEPS.length);
        if (currentStep !== lessonProgress.currentStep) {
            updateLessonStep(context, currentStep);
            setLessonProgress(getLessonProgress(context));
        }
    }, []);

    const playAudio = async (text: string) => {
        if (playingAudio) return;
        setPlayingAudio(text);

        try {
            const response = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, language, dialect }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.audioData) {
                    const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
                    audio.onended = () => setPlayingAudio(null);
                    audio.onerror = () => setPlayingAudio(null);
                    await audio.play();
                    return;
                }
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setPlayingAudio(null);
        }
    };

    const handleMarkKnown = (index: number) => {
        markVocabKnown(context, index);
        setLessonProgress(getLessonProgress(context));

        // Award small XP for marking as known
        const xp = 5;
        awardXP(xp, 'vocab_known');
        setSessionXP(prev => prev + xp);
        setUserProgress(getUserProgress());

        // Progress to next step if all vocab known
        if (lessonProgress.currentStep === 1) {
            updateLessonStep(context, 2);
            setLessonProgress(getLessonProgress(context));
        }
    };

    const handleMarkPractice = (index: number) => {
        markVocabPractice(context, index);
        setLessonProgress(getLessonProgress(context));
    };

    const handleSpeechEval = async (audioBlob: Blob, expectedText: string): Promise<SpeechEvaluationResult | null> => {
        try {
            const base64Audio = await blobToBase64(audioBlob);
            const userProfile = getUserProfile();
            const mimeType = audioBlob.type || "audio/webm";

            const response = await fetch("/api/speech-eval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audioBase64: base64Audio,
                    expectedText: expectedText,
                    language: userProfile?.language || language,
                    mimeType: mimeType,
                    dialect: dialect
                })
            });

            if (response.ok) {
                const result = await response.json();

                // Record score for accuracy tracking
                if (result.accuracy) {
                    recordSpeechScore(context, result.accuracy);

                    // Award XP based on accuracy
                    if (result.accuracy >= 70) {
                        const xp = 10;
                        awardXP(xp, 'pronunciation_practice');
                        setSessionXP(prev => prev + xp);
                        setUserProgress(getUserProgress());
                    }
                }

                return result;
            } else {
                const errorData = await response.json().catch(() => ({ error: "Speech evaluation failed" }));
                return {
                    transcript: "",
                    phonemes: "",
                    accuracy: 0,
                    issues: [],
                    error: errorData.error || "Speech evaluation failed. Please try again."
                };
            }
        } catch (error) {
            console.error("Speech Eval Error:", error);
            return {
                transcript: "",
                phonemes: "",
                accuracy: 0,
                issues: [],
                error: "Could not process your speech. Please check your microphone and try again."
            };
        }
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleCulturalQuizComplete = (correct: boolean) => {
        recordCulturalQuiz(context, correct);
        setLessonProgress(getLessonProgress(context));

        if (correct) {
            setSessionXP(prev => prev + 10);
        }
        setUserProgress(getUserProgress());

        // Move to final step
        updateLessonStep(context, 5);
        setLessonProgress(getLessonProgress(context));

        // Show completion modal after a brief delay
        setTimeout(() => {
            setShowCompletion(true);
        }, 1500);
    };

    const handleStartPractice = () => {
        // Complete the lesson
        const accuracy = lessonProgress.accuracyHistory.length > 0
            ? Math.round(lessonProgress.accuracyHistory.reduce((a, b) => a + b, 0) / lessonProgress.accuracyHistory.length)
            : undefined;

        completeLesson(context, sessionXP, accuracy);

        setShowCompletion(false);
        onStartPractice();
    };

    // Generate a sample cultural quiz from the cultural note
    const culturalQuiz = {
        question: "What should you do before ordering food in a traditional setting?",
        options: [
            "Ask for the price immediately",
            "Greet the server politely",
            "Order your food right away",
            "Ask for recommendations"
        ],
        correctIndex: 1,
        explanation: culturalNote.description
    };

    return (
        <div className="flex flex-col h-full bg-sand-beige overflow-y-auto pb-20">
            <div className="px-6 py-8">
                {/* Mission Progress */}
                <MissionProgress
                    title={`Mission: ${formatTitle(goal)}`}
                    currentStep={lessonProgress.currentStep}
                    totalSteps={STEPS.length}
                    stepLabel={STEPS[lessonProgress.currentStep - 1] || STEPS[0]}
                />

                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-earthy-brown mb-1">{formatTitle(title)}</h1>
                    <p className="text-sm text-savanna-green/70">Total XP: {userProgress.totalXP} (+{sessionXP} this session)</p>
                </div>

                {/* Vocabulary Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-terracotta-orange mb-4 flex items-center gap-2">
                        <span>⭐</span>
                        <span>Must-Know Words</span>
                    </h2>
                    <div className="grid gap-3">
                        {vocabulary?.map((item, index) => (
                            <VocabCard
                                key={index}
                                native={item.native}
                                english={item.english}
                                pronunciation={item.pronunciation}
                                index={index}
                                isKnown={lessonProgress.knownVocabulary.has(index)}
                                isPracticing={lessonProgress.practiceVocabulary.has(index)}
                                onMarkKnown={handleMarkKnown}
                                onMarkPractice={handleMarkPractice}
                                onSpeechEval={handleSpeechEval}
                                playAudio={playAudio}
                                playingAudio={playingAudio}
                                language={language}
                                dialect={dialect}
                            />
                        ))}
                    </div>
                </div>

                {/* Key Phrases Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-terracotta-orange mb-4 flex items-center gap-2">
                        <span>💬</span>
                        <span>Say This to Sound Polite</span>
                    </h2>
                    <div className="space-y-3">
                        {keyPhrases?.map((item, index) => (
                            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-earthy-brown/5">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-lg font-bold text-earthy-brown">{item.native}</p>
                                    <button
                                        onClick={() => playAudio(item.native)}
                                        disabled={playingAudio !== null}
                                        className={`w-8 h-8 rounded-full bg-sand-beige flex items-center justify-center text-savanna-green hover:bg-savanna-green/10 transition-colors shrink-0 ml-2 ${playingAudio === item.native ? 'animate-pulse' : ''}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">volume_up</span>
                                    </button>
                                </div>
                                <p className="text-sm text-savanna-green/60 italic mb-1">{item.pronunciation}</p>
                                <p className="text-base text-earthy-brown/80">{item.english}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cultural Quiz */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-terracotta-orange mb-4 flex items-center gap-2">
                        <span>🧠</span>
                        <span>Cultural Rule (Don't Skip)</span>
                    </h2>

                    {!lessonProgress.culturalQuizCompleted ? (
                        <CulturalQuiz
                            question={culturalQuiz.question}
                            options={culturalQuiz.options}
                            correctIndex={culturalQuiz.correctIndex}
                            explanation={culturalQuiz.explanation}
                            onComplete={handleCulturalQuizComplete}
                        />
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                            <p className="font-bold text-green-700 mb-2 flex items-center gap-2">
                                <span>✓</span>
                                <span>Cultural Quiz Completed!</span>
                            </p>
                            <p className="text-sm text-green-800">{culturalQuiz.explanation}</p>
                        </div>
                    )}
                </div>

                {/* Manual Start Button (if quiz not completed yet) removed - chat now always accessible via floating button */}
            </div>

            {/* Floating Chat Button - Always accessible */}
            <FloatingChatButton onClick={onStartPractice} />

            {/* Completion Modal */}
            <CompletionModal
                isOpen={showCompletion}
                xpEarned={sessionXP}
                badges={userProgress.badges}
                onStartPractice={handleStartPractice}
            />
        </div>
    );
}
