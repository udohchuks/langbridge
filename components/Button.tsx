import { Loader2 } from 'lucide-react';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', loading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`flex items-center justify-center rounded-xl px-6 py-3 font-medium transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
                disabled={loading || disabled}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;