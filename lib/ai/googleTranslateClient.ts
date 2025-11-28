import { translate } from 'google-translate-api-x';
import { translationCache } from './translationCache';

const LANGUAGE_CODE_MAP: Record<string, string> = {
    'twi': 'ak',
    'akan': 'ak',
    // Add others if needed, but standard codes usually work
    // 'hausa': 'ha', // 'ha' is standard
    // 'yoruba': 'yo', // 'yo' is standard
};

const getGoogleLanguageCode = (lang: string): string => {
    const lower = lang.toLowerCase();
    return LANGUAGE_CODE_MAP[lower] || lower;
};

export const googleTranslateClient = {
    translateText: async (text: string, targetLanguage: string): Promise<string> => {
        try {
            // Check cache first
            const cached = translationCache.get(text, targetLanguage);
            if (cached) {
                return cached;
            }

            const targetCode = getGoogleLanguageCode(targetLanguage);
            const res = await translate(text, { to: targetCode });

            // Store in cache
            translationCache.set(text, targetLanguage, res.text);

            return res.text;
        } catch (error) {
            console.error(`Translation failed for text: "${text}" to ${targetLanguage}`, error);
            return text; // Fallback to original text
        }
    },

    translateToEnglish: async (text: string, sourceLanguageHint?: string): Promise<string> => {
        try {
            // Check cache first
            const cached = translationCache.get(text, 'en');
            if (cached) {
                return cached;
            }

            // 1. Try Auto-detect
            const res = await translate(text, { to: 'en' });

            let finalResult = res.text;

            // 2. If detected language is NOT English AND we have a hint that differs
            if (res.from.language.iso !== 'en' && sourceLanguageHint) {
                const hintCode = getGoogleLanguageCode(sourceLanguageHint);

                // If the detected language is different from our expected source language
                if (res.from.language.iso !== hintCode) {
                    try {
                        const forcedRes = await translate(text, { to: 'en', from: hintCode });

                        // Heuristic: If forced translation is same as input (failed to translate),
                        // but auto-detect found something different (likely correct language),
                        // prefer auto-detect.
                        // Example: "Bonjour" (Hint: ak) -> Forced: "Bonjour", Auto: "Hello". Use Auto.
                        // Example: "akwaaba" (Hint: ak) -> Forced: "welcome", Auto: "the egg". Use Forced.

                        const forcedChanged = forcedRes.text.toLowerCase() !== text.toLowerCase();
                        const autoChanged = res.text.toLowerCase() !== text.toLowerCase();

                        if (forcedChanged) {
                            finalResult = forcedRes.text;
                        } else if (autoChanged) {
                            // Forced didn't work, but Auto did. Revert to Auto result.
                            finalResult = res.text;
                        }

                    } catch (e) {
                        console.warn("Forced translation failed, falling back to auto-detect", e);
                    }
                }
            }

            // Store in cache
            translationCache.set(text, 'en', finalResult);

            return finalResult;
        } catch (error) {
            console.error(`Translation to English failed for text: "${text}"`, error);
            return text;
        }
    }
};
