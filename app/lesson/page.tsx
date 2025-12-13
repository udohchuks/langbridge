"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserProfile } from "@/lib/userStorage";
import { StudyView } from "@/components/lesson/StudyView";
import { LessonData } from "@/lib/lessonStorage";
import { MicWidget } from "@/components/lesson/MicWidget";
import { PronunciationFeedback } from "@/components/lesson/PronunciationFeedback";
import { DialectSwitcher } from "@/components/lesson/DialectSwitcher";
import { ProgressIndicators } from "@/components/lesson/ProgressIndicators";
import { SpeechEvaluationResult } from "@/lib/ai/agents/pronunciationAgent";
import { formatTitle } from "@/lib/format";
import { getUserProgress, getLessonProgress, calculateAccuracy } from "@/lib/progressStorage";


interface DialogueLine {
    id: string;
    speaker: "native" | "learner";
    nativeText: string;
    englishText: string;
    translation?: string;
    userEnglish?: string;
}



function LessonContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const context = searchParams.get("context") || "market";

    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dialogue, setDialogue] = useState<DialogueLine[]>([]);
    const [translationVisible, setTranslationVisible] = useState<Set<string>>(new Set());
    const [showCulturalNote, setShowCulturalNote] = useState(false);
    const [inputMode, setInputMode] = useState<"mic" | "text">("text");
    const [textInput, setTextInput] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; parts: string }[]>([]);

    const [viewMode, setViewMode] = useState<"study" | "practice">("study");

    const [speechResult, setSpeechResult] = useState<SpeechEvaluationResult | null>(null);
    const [isProcessingAudio, setIsProcessingAudio] = useState(false);
    const [currentDialect, setCurrentDialect] = useState("default");
    const [userLanguage, setUserLanguage] = useState("Yoruba");

    const dialogueRef = useRef<HTMLDivElement>(null);

    // Fetch lesson on mount
    useEffect(() => {
        const loadLesson = async () => {
            try {
                // First try to load from localStorage
                const { getLessonByContext } = await import("@/lib/lessonStorage");
                const cachedLesson = getLessonByContext(context);

                let currentLesson: LessonData | null = null;

                if (cachedLesson) {
                    currentLesson = cachedLesson;
                } else {
                    const userProfile = getUserProfile();

                    // Validate that user has completed onboarding with language preference
                    if (!userProfile || !userProfile.language) {
                        console.error("No language preference found. Redirecting to onboarding.");
                        router.push("/onboarding");
                        return;
                    }

                    const targetLanguage = userProfile.language;
                    setUserLanguage(targetLanguage);
                    const userLevel = userProfile.level || "Beginner";
                    const userGoal = userProfile.goal || "General";

                    const response = await fetch("/api/lesson/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            context,
                            language: targetLanguage,
                            userLevel,
                            userGoal,
                        }),
                    });

                    if (!response.ok) throw new Error("Failed to generate lesson");

                    const data = await response.json();
                    currentLesson = data;
                }

                if (currentLesson) {
                    setLesson(currentLesson);
                    if (currentLesson.initialDialogue && currentLesson.initialDialogue.length > 0) {
                        // Ensure all dialogue lines have an ID
                        const validatedDialogue = currentLesson.initialDialogue.map((line, index) => ({
                            ...line,
                            id: line.id || `msg-init-${Date.now()}-${index}`
                        }));

                        const initialAIMessage = validatedDialogue[0];
                        setDialogue([initialAIMessage]);
                        setChatHistory([{ role: "model", parts: initialAIMessage.nativeText }]);
                    } else {
                        setDialogue([]);
                        setChatHistory([]);
                    }

                    // Images will load asynchronously by the browser
                    setLoading(false);

                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to load lesson", error);
                setLoading(false);
            }
        };
        loadLesson();
    }, [context]);

    // Auto-scroll to bottom when dialogue updates
    useEffect(() => {
        if (dialogueRef.current) {
            dialogueRef.current.scrollTop = dialogueRef.current.scrollHeight;
        }
    }, [dialogue]);


    const [isTyping, setIsTyping] = useState(false);

    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const messageIdCounter = useRef(0);

    const generateUniqueId = () => {
        messageIdCounter.current += 1;
        return `msg-${Date.now()}-${messageIdCounter.current}`;
    };

    const playAudio = async (text: string) => {
        if (playingAudio) return; // Prevent overlapping playback
        setPlayingAudio(text);

        try {
            const userProfile = getUserProfile();
            const language = userProfile?.language || "English"; // Default or detect

            const response = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, language, dialect: currentDialect }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.audioData) {
                    // Assuming audioData is base64
                    const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
                    audio.onended = () => setPlayingAudio(null);
                    audio.onerror = () => setPlayingAudio(null);
                    await audio.play();
                    return;
                }
            }
        } catch (error) {
            console.error("TTS Error:", error);
        }

        // Fallback to browser TTS if API fails or no audio returned
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setPlayingAudio(null);
        utterance.onerror = () => setPlayingAudio(null);
        window.speechSynthesis.speak(utterance);
    };

    // Helper function to convert Blob to base64
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

    const handleSpeechEval = async (audioBlob: Blob) => {
        setIsProcessingAudio(true);
        setSpeechResult(null);
        try {
            const base64Audio = await blobToBase64(audioBlob);

            // Use the last native message as the expected text for pronunciation practice
            const lastNativeLine = [...dialogue].reverse().find(l => l.speaker === "native");
            const expectedText = lastNativeLine ? lastNativeLine.nativeText : "Hello";

            const userProfile = getUserProfile();

            // Determine the correct MIME type
            const mimeType = audioBlob.type || "audio/webm";

            const response = await fetch("/api/speech-eval", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audioBase64: base64Audio,
                    expectedText: expectedText,
                    language: userProfile?.language || "African Language",
                    mimeType: mimeType,
                    dialect: currentDialect
                })
            });

            if (response.ok) {
                const result = await response.json();
                setSpeechResult(result);
            } else {
                const errorData = await response.json().catch(() => ({ error: "Speech evaluation failed" }));
                setSpeechResult({
                    transcript: "",
                    phonemes: "",
                    accuracy: 0,
                    issues: [],
                    error: errorData.error || "Speech evaluation failed. Please try again."
                });
            }
        } catch (error) {
            console.error("Speech Eval Error:", error);
            setSpeechResult({
                transcript: "",
                phonemes: "",
                accuracy: 0,
                issues: [],
                error: "Could not process your speech. Please check your microphone and try again."
            });
        } finally {
            setIsProcessingAudio(false);
        }
    };

    const toggleTranslation = (messageId: string) => {
        console.log("Toggling translation for:", messageId);
        setTranslationVisible((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            console.log("New translationVisible set:", Array.from(newSet));
            return newSet;
        });
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !lesson) return;

        const userMessage: DialogueLine = {
            id: generateUniqueId(),
            speaker: "learner",
            nativeText: message,
            englishText: message,
        };
        setDialogue((prev) => [...prev, userMessage]);
        setTextInput("");
        setIsTyping(true);

        const newHistory = [...chatHistory, { role: "user" as const, parts: message }];

        try {
            const userProfile = getUserProfile();

            // Validate that user has language preference
            if (!userProfile || !userProfile.language) {
                const errorMessage: DialogueLine = {
                    id: generateUniqueId(),
                    speaker: "native",
                    nativeText: "Please complete your profile setup first.",
                    englishText: "Please complete your profile setup first.",
                    translation: "Please complete your profile setup first.",
                };
                setDialogue((prev) => [...prev, errorMessage]);
                setIsTyping(false);
                return;
            }

            const targetLanguage = userProfile.language;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: newHistory,
                    message,
                    language: targetLanguage,
                    context: lesson.scenario,
                }),
            });

            if (!response.ok) throw new Error("Chat failed");

            const data = await response.json();

            const aiMessage: DialogueLine = {
                id: generateUniqueId(),
                speaker: "native",
                nativeText: data.nativeText,
                englishText: data.englishText,
                translation: data.englishText,
            };

            setDialogue((prev) => prev.map(msg =>
                msg.id === userMessage.id
                    ? { ...msg, translation: data.userTranslation }
                    : msg
            ).concat(aiMessage));

            setChatHistory([...newHistory, { role: "model", parts: data.nativeText }]);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsTyping(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-sand-beige flex-col gap-4">
                <div className="w-64 bg-earthy-brown/10 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-primary animate-pulse rounded-full w-full origin-left scale-x-50"></div>
                </div>
                <p className="text-earthy-brown/60 text-sm font-medium animate-pulse">
                    Preparing your lesson...
                </p>
            </div>
        );
    }

    if (!lesson) return null;

    if (viewMode === "study") {
        return (
            <div className="relative h-[100dvh] w-full max-w-lg mx-auto bg-sand-beige">
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center bg-transparent p-4 justify-between pointer-events-none">
                    <button
                        onClick={() => router.back()}
                        className="flex size-12 items-center justify-center text-earthy-brown bg-white/80 backdrop-blur rounded-full hover:bg-white shadow-sm pointer-events-auto"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                </div>
                <StudyView
                    title={lesson.title}
                    goal={lesson.scenario}
                    vocabulary={lesson.vocabulary || []}
                    keyPhrases={lesson.keyPhrases || []}
                    culturalNote={lesson.culturalNote}
                    onStartPractice={() => setViewMode("practice")}
                    language={userLanguage}
                    dialect={currentDialect}
                    context={context}
                />
            </div>
        );
    }

    return (
        <div className="relative flex h-[100dvh] w-full max-w-lg mx-auto flex-col bg-sand-beige overflow-hidden">
            {/* Top Nav Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center bg-transparent p-4 justify-between">
                <button
                    onClick={() => setViewMode("study")}
                    className="flex size-12 items-center justify-center text-white bg-black/20 rounded-full hover:bg-black/30"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <ProgressIndicators
                    xp={getUserProgress().totalXP}
                    streak={getUserProgress().currentStreak}
                    accuracy={calculateAccuracy(getLessonProgress(context))}
                    compact={true}
                />
                {lesson && (
                    <DialectSwitcher
                        language={userLanguage}
                        currentDialect={currentDialect}
                        onDialectChange={setCurrentDialect}
                    />
                )}
            </div>

            {/* Scrollable Content Wrapper */}
            <div ref={dialogueRef} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                {/* Header Image (Top 45%) */}
                <div className="relative w-full flex-shrink-0 h-[35vh] sm:h-[45vh]" style={{ maxHeight: "400px" }}>
                    {lesson.headerImage ? (
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${lesson.headerImage}")` }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-sand-beige/50">
                            <div className="text-center">
                                <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto text-savanna-green/20">
                                    <rect x="10" y="10" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                                    <line x1="10" y1="10" x2="110" y2="110" stroke="currentColor" strokeWidth="2" />
                                    <line x1="110" y1="10" x2="10" y2="110" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <p className="text-sm text-savanna-green/40 mt-2">Loading image...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dialogue Area */}
                <div className="px-4 pt-4 space-y-6 pb-24 sm:pb-4">
                    {dialogue.map((line) => {
                        // console.log("Rendering line:", line.id, "UserEnglish:", line.userEnglish, "Translation:", line.translation, "EnglishText:", line.englishText);
                        return (
                            <div
                                key={line.id}
                                className={`flex items-end gap-3 ${line.speaker === "learner" ? "justify-end" : "justify-start"}`}
                            >
                                {line.speaker === "native" && (
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0 shadow"
                                        style={{ backgroundImage: `url("${lesson.characterImage}")` }}
                                    ></div>
                                )}

                                <div className={`flex flex-col gap-1 ${line.speaker === "learner" ? "items-end" : "items-start"}`}>
                                    {line.speaker === "native" && (
                                        <p className="text-savanna-green/70 text-[13px] font-medium">{lesson.character}</p>
                                    )}

                                    <div
                                        onClick={() => toggleTranslation(line.id)}
                                        className={`flex items-center gap-2 max-w-[90%] sm:max-w-[80%] w-fit min-w-[4rem] rounded-xl px-4 py-3 shadow cursor-pointer break-words ${line.speaker === "learner" ? "bg-terracotta-orange text-white" : "bg-white text-savanna-green"
                                            }`}
                                    >
                                        <p className="text-base font-normal flex-1">{line.nativeText}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const textToPlay = line.speaker === "learner" ? (line.translation || "") : line.nativeText;
                                                if (textToPlay) playAudio(textToPlay);
                                            }}
                                            className={`shrink-0 ${line.speaker === "learner" ? "text-white/80" : "text-savanna-green/60"}`}
                                            disabled={playingAudio === (line.speaker === "learner" ? (line.translation || "") : line.nativeText)}
                                        >
                                            <span className={`material-symbols-outlined text-xl ${playingAudio === (line.speaker === "learner" ? (line.translation || "") : line.nativeText) ? "animate-pulse" : ""}`}>
                                                {playingAudio === (line.speaker === "learner" ? (line.translation || "") : line.nativeText) ? "volume_up" : "volume_up"}
                                            </span>
                                        </button>
                                    </div>

                                    {translationVisible.has(line.id) && (
                                        <p className={`text-sm font-medium italic ${line.speaker === "learner" ? "text-savanna-green/80 mr-2" : "text-savanna-green/80 ml-2"}`}>
                                            {line.userEnglish || line.translation || line.englishText}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {isTyping && (
                        <div className="flex items-end gap-3 justify-start">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0 shadow"
                                style={{ backgroundImage: `url("${lesson.characterImage}")` }}
                            ></div>
                            <div className="flex flex-col gap-1 items-start">
                                <p className="text-savanna-green/70 text-[13px] font-medium">{lesson.character}</p>
                                <div className="bg-white text-savanna-green rounded-xl px-4 py-3 shadow w-fit">
                                    <div className="flex space-x-1 h-6 items-center">
                                        <div className="w-2 h-2 bg-savanna-green/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-savanna-green/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-savanna-green/40 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="relative shrink-0 bg-sand-beige border-t border-black/5">
                <div className="flex justify-center py-2">
                    <p className="text-xs text-savanna-green/60 italic">Tap a message to see translation</p>
                </div>

                <div className="flex flex-col gap-2 p-4">
                    {/* Pronunciation Feedback Area */}
                    {speechResult && (
                        <div className="mb-4">
                            <PronunciationFeedback result={speechResult} />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => setSpeechResult(null)}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={() => setShowCulturalNote(true)}
                            className="flex items-center justify-center size-12 sm:size-14 rounded-full bg-white/80 text-savanna-green shadow-md shrink-0"
                        >
                            <span className="material-symbols-outlined text-2xl sm:text-3xl">lightbulb</span>
                        </button>

                        {inputMode === "text" ? (
                            <div className="flex-1 mx-2 sm:mx-4 flex gap-2 min-w-0">
                                <input
                                    type="text"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSendMessage(textInput);
                                    }}
                                    placeholder="Type your response..."
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-full bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-terracotta-orange text-sm sm:text-base min-w-0"
                                />
                                <button
                                    onClick={() => handleSendMessage(textInput)}
                                    className="flex items-center justify-center size-12 sm:size-14 rounded-full bg-terracotta-orange text-white shadow-lg shrink-0"
                                >
                                    <span className="material-symbols-outlined text-2xl sm:text-3xl">send</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex justify-center">
                                <MicWidget
                                    onRecordingComplete={handleSpeechEval}
                                    isProcessing={isProcessingAudio}
                                />
                            </div>
                        )}

                        <button
                            onClick={() => setInputMode(inputMode === "mic" ? "text" : "mic")}
                            className="flex items-center justify-center size-12 sm:size-14 rounded-full bg-white/80 text-savanna-green shadow-md shrink-0"
                        >
                            <span className="material-symbols-outlined text-2xl sm:text-3xl">{inputMode === "mic" ? "keyboard" : "mic"}</span>
                        </button>
                    </div>
                </div>

                {/* Cultural Note Overlay */}
                {showCulturalNote && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg p-6 flex flex-col gap-4 z-20">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-savanna-green">{formatTitle(lesson.culturalNote.title)}</h2>
                            <p className="text-lg text-savanna-green/70">{lesson.culturalNote.pronunciation}</p>
                        </div>
                        <div className="text-center bg-sand-beige/60 p-3 rounded">
                            <p className="text-sm text-savanna-green">
                                <strong>Cultural Note:</strong> {lesson.culturalNote.description}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCulturalNote(false)}
                            className="w-full rounded-lg bg-terracotta-orange py-3 text-lg font-bold text-white"
                        >
                            Got it
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LessonPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-sand-beige flex-col gap-4">
                <div className="w-64 bg-earthy-brown/10 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-primary animate-pulse rounded-full w-full origin-left scale-x-50"></div>
                </div>
                <p className="text-earthy-brown/60 text-sm font-medium animate-pulse">
                    Loading...
                </p>
            </div>
        }>
            <LessonContent />
        </Suspense>
    );
}
