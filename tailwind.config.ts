import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Safelist classes used only via @apply so Tailwind generates them
  safelist: [
    'inline-flex', 'items-center', 'justify-center',
    'px-4', 'py-2', 'rounded-full', 'text-white', 'font-semibold',
    // ProductCard classes
    'bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden',
    // Grid layout classes
    'grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-8',
  ],
  theme: {
    extend: {
      colors: {
        sai: {
          pink: '#F48FB1',
          dark: '#AD1457',
          cream: '#FDFBF7',
          gold: '#D4AF37',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;