import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';

const config = {
    plugins: [
        tailwind(),
        autoprefixer(),
    ]
};

export default config;