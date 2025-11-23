import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ContextChatStepProps {
    onNext: (value: string) => void;
    onSkip: () => void;
}

export function ContextChatStep({ onNext, onSkip }: ContextChatStepProps) {
    const [response, setResponse] = useState("");

    return (
        <div className="flex flex-col h-full animate-fade-in justify-between w-full">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col justify-start pt-4 pb-6 gap-4">
                {/* Bot Message */}
                <div className="flex gap-3 items-end">
                    <div className="w-8 h-8 rounded-full bg-sand-beige flex items-center justify-center shrink-0 overflow-hidden">
                        <span className="text-earthy-brown font-bold text-xs">RK</span>
                    </div>
                    <div className="bg-white dark:bg-white/10 p-4 rounded-2xl rounded-bl-none shadow-sm max-w-[85%]">
                        <p className="text-earthy-brown dark:text-warm-off-white text-sm leading-relaxed">
                            Great choice! Tell me a bit more about what kind of fun activities you're interested in.
                        </p>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="flex flex-col gap-4 mt-auto">
                <input
                    className="w-full rounded-2xl border-0 bg-sand-beige/30 p-4 text-earthy-brown placeholder:text-earthy-brown/40 focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="Type your response here..."
                    type="text"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && response.trim()) {
                            onNext(response);
                        }
                    }}
                    autoFocus
                />

                <div className="flex flex-col gap-3 pt-2">
                    <Button
                        onClick={() => onNext(response)}
                        disabled={!response.trim()}
                        className="w-full py-6 text-lg rounded-full shadow-md"
                    >
                        Continue
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onSkip}
                        className="text-earthy-brown/60 hover:text-earthy-brown"
                    >
                        Skip for now
                    </Button>
                </div>
            </div>
        </div>
    );
}
