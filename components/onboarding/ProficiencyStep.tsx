

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
        <div className="flex flex-col h-full animate-fade-in p-6 pt-8">
            <div className="w-full max-w-md mx-auto flex flex-col h-full">
                <div className="space-y-6 shrink-0">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold text-earthy-brown font-display">
                            What&apos;s your level?
                        </h1>
                        <p className="text-earthy-brown/60">
                            This helps us tailor the lessons to you.
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto -mx-2 px-2 py-4 space-y-4 min-h-0 custom-scrollbar mt-4">
                    {levels.map((level) => (
                        <button
                            key={level.id}
                            onClick={() => onNext(level.id)}
                            className={`flex flex-col gap-1 rounded-2xl border-2 p-6 text-left transition-all duration-200 shadow-sm shrink-0 w-full group ${initialValue === level.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                                : "border-earthy-brown/10 bg-white/50 hover:bg-white hover:border-primary/30 hover:shadow-md"
                                }`}
                        >
                            <h2 className={`text-lg font-bold leading-tight transition-colors ${initialValue === level.id ? "text-primary" : "text-earthy-brown group-hover:text-primary"}`}>
                                {level.label}
                            </h2>
                            <p className="text-earthy-brown/60 text-sm">
                                {level.description}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
