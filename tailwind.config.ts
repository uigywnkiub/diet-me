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
        'spin-ease': 'spin-ease 1.5s ease-in-out infinite',
      },
      keyframes: {
        'spin-ease': {
          '0%': {
            transform: 'rotate(0deg) scale(1)',
            filter: 'blur(0px)',
            easing: 'ease-in',
          },
          '50%': {
            transform: 'rotate(180deg) scale(0.95)',
            filter: 'blur(1px)',
            easing: 'ease-out',
          },
          '100%': {
            transform: 'rotate(360deg) scale(1)',
            filter: 'blur(0px)',
            easing: 'ease-in',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
