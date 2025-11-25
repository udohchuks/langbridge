import { translate } from 'google-translate-api-x';

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
            const targetCode = getGoogleLanguageCode(targetLanguage);
            const res = await translate(text, { to: targetCode });
            return res.text;
        } catch (error) {
            console.error(`Translation failed for text: "${text}" to ${targetLanguage}`, error);
            return text; // Fallback to original text
        }
    },

    translateToEnglish: async (text: string): Promise<string> => {
        try {
            const res = await translate(text, { to: 'en' });
            return res.text;
        } catch (error) {
            console.error(`Translation to English failed for text: "${text}"`, error);
            return text;
        }
    }
};
