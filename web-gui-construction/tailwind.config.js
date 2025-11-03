/**
 * 🎨 TAILWIND CONFIGURATION - Construction Theme
 * ==============================================
 * 
 * Elite construction/architecture-inspired design system
 * with blueprint aesthetics and industrial color palette
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Blueprint-inspired color palette
        blueprint: {
          dark: '#0A2647',
          grid: '#144272',
          light: '#2C74B3',
          accent: '#205295'
        },
        
        // Construction materials
        concrete: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#D4D4D4',
          300: '#A8A9AD',
          400: '#8B8D91',
          500: '#6E7075',
          600: '#52545A',
          700: '#36383E'
        },
        
        steel: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151'
        },
        
        // Functional colors
        construction: {
          orange: '#FF6B35',
          yellow: '#FFB800',
          green: '#00D9FF',
          red: '#FF0044',
          beige: '#E5DCC5'
        }
      },
      
      fontFamily: {
        industrial: ['"Roboto Condensed"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        architectural: ['"Bebas Neue"', 'sans-serif']
      },
      
      backgroundImage: {
        'blueprint-grid': "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M 40 0 L 0 0 0 40\" fill=\"none\" stroke=\"%23144272\" stroke-width=\"0.5\" opacity=\"0.3\"/%3E%3C/svg%3E')",
        'blueprint-paper': 'linear-gradient(135deg, #0A2647 0%, #144272 50%, #0A2647 100%)'
      },
      
      boxShadow: {
        'steel': '0 4px 6px -1px rgba(107, 114, 128, 0.3), 0 2px 4px -1px rgba(107, 114, 128, 0.2)',
        'blueprint': '0 10px 40px -5px rgba(20, 66, 114, 0.5)',
        'construction': '0 20px 60px -10px rgba(255, 107, 53, 0.4)'
      },
      
      borderWidth: {
        '3': '3px',
        '6': '6px'
      },
      
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite'
      }
    }
  },
  plugins: []
};

