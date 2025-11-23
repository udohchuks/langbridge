interface TimelineProps {
    children: React.ReactNode;
}

export const Timeline = ({ children }: TimelineProps) => {
    return (
        <div className="relative w-full max-w-md mx-auto py-8">
            {/* Dashed Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 border-l-4 border-dashed border-earthy-brown/20 -z-10" />

            <div className="flex flex-col gap-12 px-6">
                {children}
            </div>
        </div>
    );
};
