import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1 w-full">
                {label && (
                    <label className="text-sm font-medium text-text-main dark:text-gray-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full rounded-lg border border-text-main/20 bg-tile-bg dark:bg-gray-700 dark:text-white dark:border-gray-600 text-text-main placeholder-text-main/50 focus:border-text-main focus:ring-2 focus:ring-primary/50 transition-all duration-200 px-4 py-3 ${className}`}
                    {...props}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
