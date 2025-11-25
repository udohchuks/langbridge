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
        <div className="flex flex-col h-full animate-fade-in p-6 pt-8">
            <div className="w-full max-w-md mx-auto flex flex-col h-full">
                <div className="space-y-6 shrink-0">
                    <div className="space-y-2 text-center">
                        <h1 className="text-3xl font-bold text-earthy-brown font-display">
                            What language do you want to learn?
                        </h1>
                        <p className="text-earthy-brown/60">
                            Choose from our available African languages
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earthy-brown/40 w-5 h-5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search for a language..."
                            className="w-full rounded-xl border-2 border-earthy-brown/10 bg-white/50 pl-12 p-4 text-lg text-earthy-brown placeholder:text-earthy-brown/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto -mx-2 px-2 py-4 space-y-3 min-h-0 custom-scrollbar mt-4">
                    {filteredLanguages.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => setSelected(lang.id)}
                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all shrink-0 ${selected === lang.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-earthy-brown/5 bg-white/50 hover:bg-white hover:border-earthy-brown/20"
                                }`}
                        >
                            <div className="text-left">
                                <div className="font-bold text-earthy-brown">{lang.name}</div>
                                <div className="text-sm text-earthy-brown/60">{lang.native}</div>
                            </div>
                            {selected === lang.id && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="pt-4 shrink-0">
                    <Button
                        onClick={() => onNext(selected)}
                        disabled={!selected}
                        className="w-full py-6 text-lg rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
};
