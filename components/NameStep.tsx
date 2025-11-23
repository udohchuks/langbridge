'use client';
import { useState } from 'react';
import Button from '@/components/Button';

export const NameStep = ({ onNext }: { onNext: (name: string) => void }) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsLoading(false);
        onNext(name);
    };

    return (
        <div className="flex h-full flex-col px-6 pt-8 pb-6">
            {/* Progress Bar Inline for now */}
            <div className="w-full space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Step 1 of 5</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200/50">
                    <div className="h-full w-[20%] rounded-full bg-terracotta" />
                </div>
            </div>

            <div className="mt-12 flex-1">
                <h2 className="text-4xl font-bold leading-tight tracking-tight text-textDark font-display">
                    What should we call you?
                </h2>

                <div className="mt-10">
                    <label className="block text-lg font-medium text-gray-700 mb-3">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-2xl px-6 py-5 text-lg outline-none focus:ring-2 focus:ring-orange-300 transition-all placeholder:text-gray-400 bg-inputBg"
                        autoFocus
                    />
                </div>
            </div>

            <div className="mt-auto">
                <Button onClick={handleSubmit} disabled={!name.trim()} loading={isLoading}>
                    Continue
                </Button>
            </div>
        </div>
    );
};
