import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ContextChatStepProps {
    onNext: (value: string) => void;
    onSkip: () => void;
}

export function ContextChatStep({ onNext, onSkip }: ContextChatStepProps) {
    const [response, setResponse] = useState("");

    return (
        <div className="flex flex-col h-full animate-fade-in p-6 pt-8">
            <div className="w-full max-w-md mx-auto flex flex-col h-full">
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col justify-start pt-4 pb-6 gap-4 overflow-y-auto min-h-0 custom-scrollbar">
                        {/* Bot Message */}
                        <div className="flex gap-3 items-end">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-primary/20">
                                <span className="text-primary font-bold text-xs">RK</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm max-w-[85%] border border-earthy-brown/5">
                                <p className="text-earthy-brown text-sm leading-relaxed">
                                    Great choice! Tell me a bit more about what kind of fun activities you&apos;re interested in.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="flex flex-col gap-4 mt-auto shrink-0 pt-4 border-t border-earthy-brown/5">
                        <input
                            className="w-full rounded-xl border-2 border-earthy-brown/10 bg-white/50 p-4 text-earthy-brown placeholder:text-earthy-brown/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
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

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => onNext(response)}
                                disabled={!response.trim()}
                                className="w-full py-6 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Continue
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onSkip}
                                className="text-earthy-brown/60 hover:text-earthy-brown hover:bg-earthy-brown/5 rounded-xl"
                            >
                                Skip for now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
