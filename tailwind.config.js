/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#1F3A2E", // Deep Forest
                secondary: "#2F5D50", // Forest Medium
                accent: "#B08968", // Soft Bronze
                muted: "#7C7C7C", // Muted Gray
                background: "#FBF8F3", // Soft Cream
                card: "#FFFFFF",
                "text-main": "#1F3A2E", // Matching primary for deep readability
                "text-muted": "#7C7C7C",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'boutique': '0 4px 20px -4px rgba(0, 0, 0, 0.03)',
                'boutique-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.08)',
            },
        },
    },
    plugins: [],
}
