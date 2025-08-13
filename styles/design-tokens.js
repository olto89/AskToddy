// AskToddy Design Tokens
// Single source of truth for all design values

export const designTokens = {
  // AskToddy Brand Colors
  colors: {
    // Toddy Orange (#FF6B35) - Primary brand color
    primary: {
      50: '#fff7f3',
      100: '#ffede6',
      200: '#ffd9cc',
      300: '#ffbfa8',
      400: '#ff9b73',
      500: '#FF6B35', // Main Toddy Orange
      600: '#f55a2e',
      700: '#e64a24',
      800: '#c2391f',
      900: '#9f2f1b',
    },
    // Warm Orange (#FF8C42) - Supporting brand color
    secondary: {
      50: '#fff8f4',
      100: '#ffefe8',
      200: '#ffdccf',
      300: '#ffc4ab',
      400: '#ffa175',
      500: '#FF8C42', // Main Warm Orange
      600: '#f77b35',
      700: '#e8672a',
      800: '#c9542a',
      900: '#a64326',
    },
    // Professional Navy (#2C3E50) - Primary text/navigation
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
      900: '#2C3E50', // Main Professional Navy
    },
    // Supporting Grey (#34495E) - Secondary text/UI elements
    grey: {
      50: '#f9fafb',
      100: '#f0f2f5',
      200: '#e2e6ea',
      300: '#cbd2d9',
      400: '#9ca4af',
      500: '#6c7482',
      600: '#505969',
      700: '#424954',
      800: '#34495E', // Main Supporting Grey
      900: '#2a3441',
    },
    // System colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    // Base neutral scale
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    }
  },

  // Typography
  fonts: {
    heading: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },

  // Border radius
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  }
}

export default designTokens