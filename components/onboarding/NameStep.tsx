import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface NameStepProps {
    onNext: (name: string) => void;
    initialValue?: string;
}

export const NameStep = ({ onNext, initialValue = "" }: NameStepProps) => {
    const [name, setName] = useState(initialValue);

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-earthy-brown dark:text-warm-off-white">
                    What should we call you?
                </h1>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-earthy-brown dark:text-sand-beige ml-1">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-xl border-0 bg-sand-beige/50 p-4 text-lg text-earthy-brown placeholder:text-earthy-brown/40 focus:ring-2 focus:ring-primary outline-none transition-all"
                        autoFocus
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    onClick={() => onNext(name)}
                    disabled={!name.trim()}
                    className="w-full py-6 text-lg rounded-full"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};
