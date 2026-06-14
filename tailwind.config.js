/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Urbanist', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Urbanist', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#C8102E',
          'red-light': '#ff1a3c',
          'red-dark': '#990000',
          gold: '#E8B923',
          'gold-light': '#FFE65F',
          'gold-dark': '#DAA520',
        },
      },
      animation: {
        'gradient-x': 'gradient-x 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'text-shimmer': 'text-shimmer 3s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-red': 'pulse-red 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'text-shimmer': {
          '0%': { 'background-position': '-200% center' },
          '100%': { 'background-position': '200% center' },
        },
        'pulse-red': {
          '0%, 100%': { 'box-shadow': '0 0 15px rgba(200,16,46,0.3)' },
          '50%': { 'box-shadow': '0 0 40px rgba(200,16,46,0.7)' },
        },
        gradient: {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '200% 50%' },
        },
      },
      boxShadow: {
        'red-glow': '0 0 30px rgba(200,16,46,0.4)',
        'gold-glow': '0 0 30px rgba(232,185,35,0.4)',
        'premium': '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(200,16,46,0.1)',
        'card-hover': '0 30px 60px rgba(200,16,46,0.25), 0 0 0 1px rgba(232,185,35,0.1)',
      },
    },
  },
  plugins: [],
}
