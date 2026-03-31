import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0C0D0E',
        bg2: '#141517',
        bg3: '#1C1E21',
        bg4: '#212428',
        border: 'rgba(255,255,255,0.07)',
        border2: 'rgba(255,255,255,0.13)',
        text: '#F0EDE8',
        text2: '#9B9791',
        text3: '#5E5C59',
        amber: '#E8A038',
        'amber-dim': 'rgba(232,160,56,0.1)',
        'amber-glow': 'rgba(232,160,56,0.05)',
        green: '#5DC48A',
        'green-dim': 'rgba(93,196,138,0.1)',
        red: '#E05A5A',
        'red-dim': 'rgba(224,90,90,0.1)',
        blue: '#6EA8D4',
        'blue-dim': 'rgba(110,168,212,0.1)',
        purple: '#A78BFA',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
