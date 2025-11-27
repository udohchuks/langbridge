"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";


interface DialogueLine {
    id: string;
    speaker: "native" | "learner";
    nativeText: string;
    englishText: string;
    translation?: string;
}

interface LessonData {
    title: string;
    location: string;
    character: string;
    characterDescription: string;
    scenario: string;
    headerImage: string;
    characterImage: string;
    initialDialogue: DialogueLine[];
    culturalNote: {
        title: string;
        pronunciation: string;
        description: string;
    };
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
                    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
                    const targetLanguage = userProfile.language || "Twi";
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
                        const initialAIMessage = currentLesson.initialDialogue[0];
                        setDialogue([initialAIMessage]);
                        setChatHistory([{ role: "model", parts: initialAIMessage.nativeText }]);
                    } else {
                        setDialogue([]);
                        setChatHistory([]);
                    }

                    // Pre-load images before showing content
                    const imagesToLoad = [];
                    if (currentLesson.headerImage) imagesToLoad.push(currentLesson.headerImage);
                    if (currentLesson.characterImage) imagesToLoad.push(currentLesson.characterImage);

                    await Promise.all(imagesToLoad.map(src => {
                        return new Promise<void>((resolve) => {
                            const img = new Image();
                            img.onload = () => resolve();
                            img.onerror = () => resolve();
                            img.src = src;
                        });
                    }));

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


    const playAudio = (text: string) => {
        if (playingAudio) return; // Prevent overlapping playback

        setPlayingAudio(text);

        const utterance = new SpeechSynthesisUtterance(text);
        // Optional: Try to match voice to language if possible, but browser support for African languages is limited.
        // We rely on the browser's default behavior.

        utterance.onend = () => setPlayingAudio(null);
        utterance.onerror = () => setPlayingAudio(null);

        window.speechSynthesis.speak(utterance);
    };

    const toggleTranslation = (messageId: string) => {
        setTranslationVisible((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            return newSet;
        });
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !lesson) return;

        const userMessage: DialogueLine = {
            id: Date.now().toString(),
            speaker: "learner",
            nativeText: message,
            englishText: message,
        };
        setDialogue((prev) => [...prev, userMessage]);
        setTextInput("");
        setIsTyping(true);

        const newHistory = [...chatHistory, { role: "user" as const, parts: message }];

        try {
            const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
            const targetLanguage = userProfile.language || "Twi";

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
                id: (Date.now() + 1).toString(),
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

    return (
        <div className="relative flex h-[100dvh] w-full max-w-lg mx-auto flex-col bg-sand-beige overflow-hidden">
            {/* Top Nav Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center bg-transparent p-4 justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex size-12 items-center justify-center text-white bg-black/20 rounded-full hover:bg-black/30"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>

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
                    {dialogue.map((line) => (
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
                                        {line.translation || line.englishText}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
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

                <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-2">
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
                        <button className="relative flex items-center justify-center size-20 sm:size-24 rounded-full bg-terracotta-orange text-white shadow-lg shrink-0">
                            <span className="material-symbols-outlined text-5xl sm:text-6xl">mic</span>
                        </button>
                    )}

                    <button
                        onClick={() => setInputMode(inputMode === "mic" ? "text" : "mic")}
                        className="flex items-center justify-center size-12 sm:size-14 rounded-full bg-white/80 text-savanna-green shadow-md shrink-0"
                    >
                        <span className="material-symbols-outlined text-2xl sm:text-3xl">{inputMode === "mic" ? "keyboard" : "mic"}</span>
                    </button>
                </div>

                {/* Cultural Note Overlay */}
                {showCulturalNote && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg p-6 flex flex-col gap-4 z-20">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-savanna-green">{lesson.culturalNote.title}</h2>
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
