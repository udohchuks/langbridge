import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#E07A5F",        // Terracotta
                "sand-beige": "#F4F1DE",     // Beige
                "earthy-brown": "#3D405B",   // Deep Blue/Brown
                "warm-off-white": "#FAF8F1", // Off White
                "sunny-yellow": "#F2CC8F",   // Yellow
                "background-dark": "#201512",
                "background-light": "#FDFBF5",
                "text-main": "#3D405B",
                "tile-bg": "#F4F1DE",
                // Specific from lesson design
                "terracotta-orange": "#E07A5F",
                "savanna-green": "#3D405B",
            },
            fontFamily: {
                "display": ["var(--font-plus-jakarta)", "sans-serif"],
                "body": ["var(--font-plus-jakarta)", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "1.5rem",
                "xl": "2rem",
                "2xl": "3rem",
            },
            boxShadow: {
                'primary': '0 4px 14px 0 rgba(224, 122, 95, 0.39)',
            },
            animation: {
                'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                shake: {
                    '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                    '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                    '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                    '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;