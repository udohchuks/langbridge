"use client";

import { Lock, Check } from "lucide-react";
import { useState } from "react";

interface LessonCardProps {
    title: string;
    status: "locked" | "active" | "completed";
    image: string;
    description?: string;
    context?: string;
    onClick?: () => void;
}

export const LessonCard = ({ title, status, image, description, context, onClick }: LessonCardProps) => {
    const isLocked = status === "locked";
    const isActive = status === "active";
    const isCompleted = status === "completed";

    // State to track image load errors
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Fallback image
    const fallbackImage = "/placeholder-lesson.svg";

    // Helper to clean markdown artifacts and unwanted prefixes
    const cleanText = (text: string) => {
        if (!text) return "";
        let cleaned = text.replace(/[*_]/g, "").trim();

        // Remove "Practice" prefix if present
        cleaned = cleaned.replace(/^Practice\s+/i, "");

        // Remove everything before the first colon (including the colon) if present
        // This handles "Detailed Learning Goal: ..." -> " ..."
        if (cleaned.includes(":")) {
            cleaned = cleaned.split(":").slice(1).join(":").trim();
        }

        // Capitalize first letter
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    };

    // Helper to format context (e.g. "first_meeting" -> "First Meeting")
    const formatContext = (ctx: string) => {
        return ctx.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    let displayTitle = cleanText(title);
    const displayDescription = cleanText(description || "");

    // Fallback: Use formatted context if title is too long or malformed
    if ((displayTitle.length > 30 || !displayTitle) && context) {
        displayTitle = formatContext(context);
    } else if (displayTitle.length > 50) {
        displayTitle = displayTitle.substring(0, 47) + "...";
    }

    // Determine which image to use
    const displayImage = imageError ? fallbackImage : image;

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
                {/* Hidden img element to detect loading errors */}
                <img
                    src={displayImage}
                    alt={displayTitle}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        console.warn(`Failed to load image for ${displayTitle}, using fallback`);
                        setImageError(true);
                        setImageLoading(false);
                    }}
                />

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
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
                    <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md line-clamp-1">
                        {displayTitle}
                    </h3>
                </div>
            </div>

            {/* Content */}
            <div className={`p-5 flex flex-col gap-4 flex-1 ${isActive ? "bg-white" : "bg-sand-beige/50"}`}>
                {displayDescription && (
                    <p className="text-base text-earthy-brown/80 line-clamp-2 leading-relaxed font-medium">
                        {displayDescription}
                    </p>
                )}

                <div className="mt-auto pt-2">
                    {isActive && (
                        <span className="text-sm font-bold text-terracotta-orange uppercase tracking-wider flex items-center gap-2">
                            Start Lesson <span className="material-symbols-outlined text-xl">arrow_forward</span>
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
