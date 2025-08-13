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
        // AskToddy Brand Colors
        primary: {
          50: '#fff7f3',
          100: '#ffede6',
          200: '#ffd9cc',
          300: '#ffbfa8',
          400: '#ff9b73',
          500: '#FF6B35', // Toddy Orange
          600: '#f55a2e',
          700: '#e64a24',
          800: '#c2391f',
          900: '#9f2f1b',
        },
        secondary: {
          50: '#fff8f4',
          100: '#ffefe8',
          200: '#ffdccf',
          300: '#ffc4ab',
          400: '#ffa175',
          500: '#FF8C42', // Warm Orange
          600: '#f77b35',
          700: '#e8672a',
          800: '#c9542a',
          900: '#a64326',
        },
        navy: {
          50: '#f8f9fa',
          100: '#eceff4',
          200: '#d6dce8',
          300: '#b8c4d6',
          400: '#94a5c0',
          500: '#7386a8',
          600: '#5a6b8a',
          700: '#485670',
          800: '#3c485c',
          900: '#2C3E50', // Professional Navy
        },
        grey: {
          50: '#f9fafb',
          100: '#f0f2f5',
          200: '#e2e6ea',
          300: '#cbd2d9',
          400: '#9ca4af',
          500: '#6c7482',
          600: '#505969',
          700: '#424954',
          800: '#34495E', // Supporting Grey
          900: '#2a3441',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config