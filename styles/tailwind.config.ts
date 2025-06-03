import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'masters-green': '#00471B',
        'masters-gold': '#FFD700',
      },
    },
  },
  plugins: [],
};

export default config; 