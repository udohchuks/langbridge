
import { Button } from "@/components/ui/Button";

interface ProficiencyStepProps {
    onNext: (level: string) => void;
    initialValue?: string;
}

const levels = [
    { id: "Beginner", label: "Beginner", description: "I'm new to this language" },
    { id: "Intermediate", label: "Intermediate", description: "I know some words & phrases" },
    { id: "Advanced", label: "Advanced", description: "I can have conversations" },
];

export function ProficiencyStep({ onNext, initialValue }: ProficiencyStepProps) {
    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-earthy-brown dark:text-warm-off-white">
                    What's your level?
                </h1>
                <p className="text-earthy-brown/60 dark:text-sand-beige/60">
                    This helps us tailor the lessons to you.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {levels.map((level) => (
                    <button
                        key={level.id}
                        onClick={() => onNext(level.id)}
                        className={`flex flex-col gap-1 rounded-2xl border-2 bg-white dark:bg-white/5 p-6 text-left hover:border-primary/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-sm ${initialValue === level.id
                            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                            : "border-transparent"
                            }`}
                    >
                        <h2 className="text-earthy-brown dark:text-warm-off-white text-lg font-bold leading-tight">
                            {level.label}
                        </h2>
                        <p className="text-earthy-brown/60 dark:text-sand-beige/60 text-sm">
                            {level.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
