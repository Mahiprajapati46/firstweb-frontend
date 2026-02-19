/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2F3E46",
                accent: "#52796F",
                "soft-accent": "#84A98C",
                background: "#F8F9FA",
                card: "#FFFFFF",
                "text-main": "#1B263B",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
