/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // 모바일 safe area 지원
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)'
      },
      colors: {
        primary: {
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#A78BFA',
          700: '#6D28D9',
          900: '#3B0764',
        },
        dawn: {
          rose: '#F9A8D4',
          gold: '#FDE68A',
        },
        bg: {
          base: '#FAF5E9',
          surface: '#FFFFFF',
          elevated: '#F3F0FF',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(109,40,217,0.08)',
        elevated: '0 8px 24px rgba(109,40,217,0.14)',
      },
    }
  },
  plugins: []
}
