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

    translateToEnglish: async (text: string): Promise<string> => {
        try {
            // Check cache first
            const cached = translationCache.get(text, 'en');
            if (cached) {
                return cached;
            }

            const res = await translate(text, { to: 'en' });

            // Store in cache
            translationCache.set(text, 'en', res.text);

            return res.text;
        } catch (error) {
            console.error(`Translation to English failed for text: "${text}"`, error);
            return text;
        }
    }
};
