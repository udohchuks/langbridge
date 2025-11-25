import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface NameStepProps {
    onNext: (name: string) => void;
    initialValue?: string;
}

export const NameStep = ({ onNext, initialValue = "" }: NameStepProps) => {
    const [name, setName] = useState(initialValue);

    return (
        <div className="flex flex-col h-full animate-fade-in p-6 pt-8">
            <div className="w-full max-w-md mx-auto space-y-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold text-earthy-brown font-display">
                        What should we call you?
                    </h1>
                    <p className="text-earthy-brown/60">
                        Your name will be used to personalize your journey
                    </p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-earthy-brown ml-1">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-xl border-2 border-earthy-brown/10 bg-white/50 p-4 text-lg text-earthy-brown placeholder:text-earthy-brown/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        autoFocus
                    />
                </div>

                <Button
                    onClick={() => onNext(name)}
                    disabled={!name.trim()}
                    className="w-full py-6 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};
