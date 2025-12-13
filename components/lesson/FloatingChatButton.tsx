import React from 'react';

interface FloatingChatButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function FloatingChatButton({ onClick, disabled = false }: FloatingChatButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="fixed bottom-6 right-6 z-20 size-16 rounded-full bg-terracotta-orange text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Start practice chat"
        >
            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                chat_bubble
            </span>

            {/* Pulse animation ring */}
            <span className="absolute inset-0 rounded-full bg-terracotta-orange animate-ping opacity-20"></span>
        </button>
    );
}
