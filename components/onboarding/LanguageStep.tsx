import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";

interface LanguageStepProps {
    onNext: (language: string) => void;
    initialValue?: string;
}

const LANGUAGES = [
    { id: "twi", name: "Twi", native: "Twi" },
    { id: "hausa", name: "Hausa", native: "Harshen Hausa" },
    { id: "yoruba", name: "Yoruba", native: "Èdè Yorùbá" },
    { id: "igbo", name: "Igbo", native: "Asụsụ Igbo" },
    { id: "swahili", name: "Swahili", native: "Kiswahili" },
    { id: "amharic", name: "Amharic", native: "አማርኛ" },
    { id: "zulu", name: "Zulu", native: "isiZulu" },
];

export const LanguageStep = ({ onNext, initialValue = "" }: LanguageStepProps) => {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(initialValue);

    const filteredLanguages = LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(search.toLowerCase()) ||
        lang.native.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 animate-fade-in h-full">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-earthy-brown dark:text-warm-off-white">
                    What language do you want to learn?
                </h1>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earthy-brown/40 w-5 h-5" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for a language..."
                    className="w-full rounded-xl border-0 bg-sand-beige/50 pl-12 p-4 text-lg text-earthy-brown placeholder:text-earthy-brown/40 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
            </div>

            <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-3 max-h-[40vh]">
                {filteredLanguages.map((lang) => (
                    <button
                        key={lang.id}
                        onClick={() => setSelected(lang.id)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selected === lang.id
                                ? "border-primary bg-primary/5"
                                : "border-transparent bg-white dark:bg-white/5 hover:bg-sand-beige/30"
                            }`}
                    >
                        <div className="text-left">
                            <div className="font-bold text-earthy-brown dark:text-warm-off-white">{lang.name}</div>
                            <div className="text-sm text-earthy-brown/60 dark:text-sand-beige">{lang.native}</div>
                        </div>
                        {selected === lang.id && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="pt-2 mt-auto">
                <Button
                    onClick={() => onNext(selected)}
                    disabled={!selected}
                    className="w-full py-6 text-lg rounded-full"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};
