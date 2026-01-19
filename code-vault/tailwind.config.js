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
          900: '#0a0a0c', // Main background (Very dark)
          800: '#13131f', // Panels
          700: '#2d2d3d', // Borders
        },
        neon: {
          cyan: '#00f2ff',
          green: '#0aff0a',
          pink: '#ff00ff',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'], // Or 'Courier New' if you don't have JetBrains
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}