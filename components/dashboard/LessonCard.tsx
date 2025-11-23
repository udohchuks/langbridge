import { Lock, Check } from "lucide-react";

interface LessonCardProps {
    title: string;
    status: "locked" | "active" | "completed";
    image: string;
    description?: string;
    onClick?: () => void;
}

export const LessonCard = ({ title, status, image, description, onClick }: LessonCardProps) => {
    const isLocked = status === "locked";
    const isActive = status === "active";
    const isCompleted = status === "completed";

    return (
        <div
            onClick={!isLocked ? onClick : undefined}
            className={`
                relative w-full rounded-3xl overflow-hidden transition-all duration-300
                ${isActive ? "cursor-pointer transform hover:scale-[1.02] shadow-lg ring-4 ring-primary/20" : ""}
                ${isLocked ? "opacity-80 grayscale" : ""}
                ${isCompleted ? "cursor-pointer opacity-90" : ""}
                bg-sand-beige flex flex-col
            `}
        >
            {/* Image Container */}
            <div className="relative h-48 w-full shrink-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                />
                <div className={`absolute inset-0 ${isLocked ? "bg-black/40" : "bg-gradient-to-t from-black/60 to-transparent"}`} />

                {/* Status Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {isLocked && (
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                    )}
                    {isCompleted && (
                        <div className="absolute top-4 right-4 bg-sunny-yellow text-earthy-brown p-2 rounded-full shadow-md">
                            <Check className="w-6 h-6" strokeWidth={3} />
                        </div>
                    )}
                </div>

                {/* Title Overlay (Bottom of Image) */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white leading-tight shadow-black/50 drop-shadow-md">
                        {title}
                    </h3>
                </div>
            </div>

            {/* Content */}
            <div className={`p-4 flex flex-col gap-3 flex-1 ${isActive ? "bg-white" : "bg-sand-beige/50"}`}>
                {description && (
                    <p className="text-sm text-earthy-brown/80 line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                )}

                <div className="mt-auto pt-2">
                    {isActive && (
                        <span className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                            Start Lesson <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </span>
                    )}
                    {isLocked && (
                        <span className="text-sm font-medium text-earthy-brown/50">
                            Locked
                        </span>
                    )}
                    {isCompleted && (
                        <span className="text-sm font-medium text-earthy-brown/60">
                            Completed
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
