import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-very-slow': 'spin 20s linear infinite',
        'spin-ease': 'spin-ease 3s ease-in-out infinite',
      },
      keyframes: {
        'spin-ease': {
          '0%': { transform: 'rotate(0deg)', easing: 'ease-in' },
          '50%': { transform: 'rotate(180deg)', easing: 'ease-out' },
          '100%': { transform: 'rotate(360deg)', easing: 'ease-in' },
        },
      },
    },
  },
  plugins: [],
}
export default config
