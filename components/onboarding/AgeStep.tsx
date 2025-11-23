import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AgeStepProps {
    onNext: (age: string) => void;
    initialValue?: string;
}

export const AgeStep = ({ onNext, initialValue = "" }: AgeStepProps) => {
    const [age, setAge] = useState(initialValue);

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-earthy-brown dark:text-warm-off-white">
                    How old are you?
                </h1>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="age" className="text-sm font-medium text-earthy-brown dark:text-sand-beige ml-1">
                        Age
                    </label>
                    <input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Enter your age"
                        className="w-full rounded-xl border-0 bg-sand-beige/50 p-4 text-lg text-earthy-brown placeholder:text-earthy-brown/40 focus:ring-2 focus:ring-primary outline-none transition-all"
                        autoFocus
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    onClick={() => onNext(age)}
                    disabled={!age.trim()}
                    className="w-full py-6 text-lg rounded-full"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};
