/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'oklch(0.13 0.04 265)',
        foreground: 'oklch(0.98 0.003 247)',
        card: 'oklch(0.21 0.04 265)',
        primary: 'oklch(0.85 0.16 88)',
        accent: 'oklch(0.15 0 0)',
        border: 'oklch(1 0 0 / 10%)',
        secondary: 'oklch(1 0 0 / 5%)',
        muted: {
          foreground: 'oklch(0.7 0.04 256)',
        },
        destructive: 'oklch(0.7 0.19 22)',
      },
    },
  },
  plugins: [],
}