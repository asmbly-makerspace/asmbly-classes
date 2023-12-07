/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './app.html',
        './src/routes/**/*.{svelte,js,ts}'
    ],
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                asmbly: {
                    "primary": "#2b2c6b",
                    "secondary": "#f2f4ef",
                    "accent": "#37cdbe",
                    "neutral": "#3d4451",
                    "base-100": "#f2f4ef",
                }
            },
            {
                asmblyDark: {
                    "primary": "#2b2c6b",
                    "secondary": "#3d4451",
                    "accent": "#37cdbe",
                    "neutral": "#3d4451",
                    "base-100": "#3d4451",
                }
            }
        ]
    },
    mode: 'jit'
}