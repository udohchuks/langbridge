"use client";

import React from 'react';
import { Settings2 } from 'lucide-react';

interface DialectSwitcherProps {
    language: string;
    currentDialect: string;
    onDialectChange: (dialect: string) => void;
}

const DIALECT_OPTIONS: Record<string, { id: string; label: string; description: string }[]> = {
    'yoruba': [
        { id: 'lagos', label: 'Lagos (Urban)', description: 'Fast, merged tones, English-influenced' },
        { id: 'ibadan', label: 'Ibadan (Formal)', description: 'Standard, clear, distinct tones' },
        { id: 'abeokuta', label: 'Abeokuta (Egba)', description: 'Deep, rural, distinct intonation' }
    ],
    'twi': [
        { id: 'asante', label: 'Asante', description: 'Most common, standard Twi' },
        { id: 'akuapem', label: 'Akuapem', description: 'Softer, "pure" Twi' }
    ],
    'swahili': [
        { id: 'kenyan', label: 'Kenyan', description: 'Nairobi style' },
        { id: 'tanzanian', label: 'Tanzanian', description: 'Standard, formal' }
    ]
};

export const DialectSwitcher: React.FC<DialectSwitcherProps> = ({ language, currentDialect, onDialectChange }) => {
    const options = DIALECT_OPTIONS[language.toLowerCase()];

    if (!options) return null;

    return (
        <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <Settings2 className="w-4 h-4 text-gray-400" />
            <select
                value={currentDialect}
                onChange={(e) => onDialectChange(e.target.value)}
                className="bg-transparent text-sm text-gray-200 border-none outline-none focus:ring-0 cursor-pointer"
            >
                <option value="default" className="text-black">Standard {language}</option>
                {options.map((opt) => (
                    <option key={opt.id} value={opt.id} className="text-black">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};
