/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MenoWellness Brand Colors
        'meno': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899', // Primary brand color
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        primary: {
          50: '#fef7ee',
          100: '#feecd7',
          200: '#fcd6ae',
          300: '#f9b97a',
          400: '#f59144',
          500: '#f2751f',
          600: '#e35d15',
          700: '#bc4a14',
          800: '#963c18',
          900: '#793316',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        wellness: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },
        // Custom health-related colors
        'health': {
          emergency: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          info: '#3b82f6',
          calm: '#8b5cf6',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'health': '0 4px 14px 0 rgba(236, 72, 153, 0.1)',
        'health-lg': '0 10px 28px 0 rgba(236, 72, 153, 0.15)',
        'glow': '0 0 20px rgba(236, 72, 153, 0.3)',
      },
    },
  },
  plugins: [
    // Custom plugin for health-specific utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.gradient-meno': {
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        },
        '.gradient-health': {
          background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 100%)',
        },
        '.text-gradient': {
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.card-hover': {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            'box-shadow': '0 10px 28px 0 rgba(236, 72, 153, 0.15)',
          }
        },
        // Accessibility utilities
        '.focus-ring': {
          '&:focus': {
            outline: '2px solid #ec4899',
            'outline-offset': '2px',
          }
        },
        '.skip-link': {
          position: 'absolute',
          top: '-40px',
          left: '6px',
          background: '#ec4899',
          color: 'white',
          padding: '8px',
          'border-radius': '4px',
          'text-decoration': 'none',
          'z-index': '9999',
          '&:focus': {
            top: '6px',
          }
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
  // Safelist for dynamic classes
  safelist: [
    'bg-pink-50', 'bg-purple-50', 'bg-blue-50', 'bg-green-50', 'bg-red-50', 'bg-yellow-50',
    'border-pink-200', 'border-purple-200', 'border-blue-200', 'border-green-200', 'border-red-200', 'border-yellow-200',
    'text-pink-800', 'text-purple-800', 'text-blue-800', 'text-green-800', 'text-red-800', 'text-yellow-800',
    'text-pink-700', 'text-purple-700', 'text-blue-700', 'text-green-700', 'text-red-700', 'text-yellow-700',
  ]
}