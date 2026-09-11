/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0D0E11',        // Master deep canvas background
          sidebar: '#121316',   // Screenshot sidebar tone
          header: '#141519',    // Header bar
          card: '#18191E',      // Elevated cards from screenshot
          cardLighter: '#1E2026',
          border: '#24262E',    // Thin subtle border
          borderLight: '#2D3039',
          hover: '#22242D',
          muted: '#8E94A0',
          subtext: '#646A78'
        },
        orange: {
          brand: '#F66103',     // Master screenshot orange accent
          hover: '#FF751F',
          glow: 'rgba(246, 97, 3, 0.16)',
          pill: 'rgba(246, 97, 3, 0.12)',
          border: 'rgba(246, 97, 3, 0.35)'
        }
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(246, 97, 3, 0.15)',
        'glow-md': '0 0 24px rgba(246, 97, 3, 0.22)',
        'glow-lg': '0 0 40px rgba(246, 97, 3, 0.30)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
