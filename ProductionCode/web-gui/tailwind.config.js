/**
 * 🎨 ELITE TAILWIND CONFIGURATION - PROFESSIONAL DESIGN SYSTEM
 * ===========================================================
 * 
 * Advanced Tailwind CSS configuration for the Elite Arbitrage Syndicate
 * with custom colors, animations, and professional design tokens
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  darkMode: 'class',
  
  theme: {
    extend: {
      // Elite color system - Professional intimidation guaranteed
      colors: {
        // Elite brand colors
        elite: {
          black: '#0a0a0a',
          dark: '#1a1a1a',
          gray: '#2a2a2a',
          'light-gray': '#3a3a3a',
          white: '#ffffff',
          primary: '#1e1b4b',
          secondary: '#312e81',
          accent: '#fbbf24',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          quantum: '#8b5cf6'
        },
        
        // Constitutional colors
        constitutional: {
          authority: '#1e1b4b',
          validation: '#10b981',
          warning: '#f59e0b',
          rejection: '#ef4444',
          supreme: '#fbbf24',
          'royal-blue': '#1e40af',
          'deep-purple': '#581c87',
          'quantum-violet': '#7c3aed'
        },
        
        // Multi-token prediction colors
        'multi-token': {
          revolutionary: '#8b5cf6',
          excellence: '#3b82f6',
          creativity: '#ec4899',
          breakthrough: '#10b981',
          constitutional: '#fbbf24'
        },
        
        // Quantum system colors
        quantum: {
          superposition: '#8b5cf6',
          entanglement: '#3b82f6',
          coherence: '#10b981',
          interference: '#f59e0b',
          measurement: '#ef4444'
        },
        
        // System connection colors
        connections: {
          superior: '#fbbf24',
          quantum: '#8b5cf6',
          formal: '#3b82f6',
          constitutional: '#1e1b4b',
          intelligence: '#10b981',
          performance: '#f59e0b'
        }
      },
      
      // Elite typography - Professional excellence
      fontFamily: {
        elite: ['Inter', 'system-ui', 'sans-serif'],
        'elite-display': ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
        'elite-mono': ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace']
      },
      
      fontSize: {
        'elite-xs': ['0.75rem', { lineHeight: '1rem' }],
        'elite-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'elite-base': ['1rem', { lineHeight: '1.5rem' }],
        'elite-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'elite-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'elite-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'elite-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'elite-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        'elite-5xl': ['3rem', { lineHeight: '1' }],
        'elite-supreme': ['4rem', { lineHeight: '1' }]
      },
      
      // Elite spacing system
      spacing: {
        'elite-xs': '0.25rem',
        'elite-sm': '0.5rem',
        'elite-md': '1rem',
        'elite-lg': '1.5rem',
        'elite-xl': '2rem',
        'elite-2xl': '3rem',
        'elite-3xl': '4rem',
        'elite-supreme': '6rem'
      },
      
      // Elite border radius
      borderRadius: {
        'elite-sm': '0.375rem',
        'elite-md': '0.5rem',
        'elite-lg': '0.75rem',
        'elite-xl': '1rem',
        'elite-2xl': '1.5rem',
        'elite-supreme': '2rem'
      },
      
      // Elite shadows - Professional depth
      boxShadow: {
        'elite-sm': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'elite-md': '0 10px 25px rgba(0, 0, 0, 0.15)',
        'elite-lg': '0 20px 40px rgba(0, 0, 0, 0.25)',
        'elite-quantum': '0 15px 35px rgba(139, 92, 246, 0.25)',
        'elite-constitutional': '0 20px 40px rgba(30, 27, 75, 0.3)',
        'elite-supreme': '0 25px 50px rgba(251, 191, 36, 0.3)',
        'elite-glow': '0 0 20px currentColor',
        'elite-glow-lg': '0 0 40px currentColor'
      },
      
      // Elite background images
      backgroundImage: {
        'elite-gradient-primary': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
        'elite-gradient-royal': 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)',
        'elite-gradient-quantum': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #1e40af 100%)',
        'elite-gradient-gold': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)',
        'elite-gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        'elite-gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
        'quantum-field': 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        'constitutional-authority': 'radial-gradient(circle at 30% 70%, rgba(251, 191, 36, 0.2) 0%, transparent 50%)'
      },
      
      // Elite animations - Smooth as silk
      animation: {
        'elite-glow': 'eliteGlow 2s ease-in-out infinite',
        'constitutional-pulse': 'constitutionalPulse 3s ease-in-out infinite',
        'quantum-float': 'quantumFloat 4s ease-in-out infinite',
        'supreme-shimmer': 'supremeShimmer 2s infinite',
        'elite-rotate': 'eliteRotate 4s linear infinite',
        'elite-bounce': 'eliteBounce 1s ease-in-out infinite',
        'constitutional-fade-in': 'constitutionalFadeIn 0.5s ease-out',
        'quantum-slide-up': 'quantumSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'supreme-scale': 'supremeScale 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      },
      
      // Elite keyframes
      keyframes: {
        eliteGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px currentColor',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 20px currentColor, 0 0 30px currentColor',
            opacity: '0.8'
          }
        },
        constitutionalPulse: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '1'
          },
          '50%': { 
            transform: 'scale(1.05)',
            opacity: '0.8'
          }
        },
        quantumFloat: {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)'
          },
          '33%': { 
            transform: 'translateY(-10px) rotate(120deg)'
          },
          '66%': { 
            transform: 'translateY(-5px) rotate(240deg)'
          }
        },
        supremeShimmer: {
          '0%': { 
            backgroundPosition: '-200px 0'
          },
          '100%': { 
            backgroundPosition: 'calc(200px + 100%) 0'
          }
        },
        eliteRotate: {
          from: { 
            transform: 'rotate(0deg)'
          },
          to: { 
            transform: 'rotate(360deg)'
          }
        },
        eliteBounce: {
          '0%, 20%, 53%, 80%, 100%': { 
            transform: 'translateY(0)'
          },
          '40%, 43%': { 
            transform: 'translateY(-10px)'
          },
          '70%': { 
            transform: 'translateY(-5px)'
          },
          '90%': { 
            transform: 'translateY(-2px)'
          }
        },
        constitutionalFadeIn: {
          from: { 
            opacity: '0',
            transform: 'translateY(20px)'
          },
          to: { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        quantumSlideUp: {
          from: { 
            opacity: '0',
            transform: 'translateY(100px)'
          },
          to: { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        supremeScale: {
          from: { 
            opacity: '0',
            transform: 'scale(0.8)'
          },
          to: { 
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      
      // Elite transitions
      transitionTimingFunction: {
        'elite-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'elite-bounce': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'elite-elastic': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'constitutional': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'quantum': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      },
      
      // Elite backdrop filters
      backdropBlur: {
        'elite-sm': '10px',
        'elite-md': '20px',
        'elite-lg': '30px',
        'elite-xl': '40px',
        'constitutional': '25px',
        'quantum': '35px'
      },
      
      // Elite grid systems
      gridTemplateColumns: {
        'elite-auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'constitutional-layers': 'repeat(auto-fit, minmax(300px, 1fr))',
        'quantum-systems': 'repeat(auto-fit, minmax(280px, 1fr))',
        'supreme-analytics': 'repeat(auto-fit, minmax(320px, 1fr))'
      },
      
      // Elite breakpoints
      screens: {
        'elite-xs': '475px',
        'elite-sm': '640px',
        'elite-md': '768px',
        'elite-lg': '1024px',
        'elite-xl': '1280px',
        'elite-2xl': '1536px',
        'elite-3xl': '1920px',
        'constitutional': '1400px',
        'quantum': '1600px'
      },
      
      // Elite z-index system
      zIndex: {
        'elite-dropdown': '1000',
        'elite-modal': '1050',
        'elite-notification': '1100',
        'elite-tooltip': '1150',
        'constitutional-overlay': '1200',
        'supreme-authority': '1300'
      }
    },
  },
  
  plugins: [
    // Elite custom plugins
    function({ addUtilities, addComponents, theme }) {
      // Elite glassmorphism utilities
      addUtilities({
        '.elite-glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)'
        },
        '.elite-glass-strong': {
          'background': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(30px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)'
        },
        '.constitutional-glass': {
          'background': 'rgba(30, 27, 75, 0.2)',
          'backdrop-filter': 'blur(25px)',
          'border': '1px solid rgba(251, 191, 36, 0.3)'
        },
        '.quantum-glass': {
          'background': 'rgba(139, 92, 246, 0.1)',
          'backdrop-filter': 'blur(35px)',
          'border': '1px solid rgba(139, 92, 246, 0.3)'
        }
      });
      
      // Elite gradient utilities
      addUtilities({
        '.bg-elite-primary': {
          'background': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)'
        },
        '.bg-elite-quantum': {
          'background': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #1e40af 100%)'
        },
        '.bg-elite-gold': {
          'background': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)'
        },
        '.bg-elite-success': {
          'background': 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
        },
        '.text-elite-gradient': {
          'background': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #dc2626 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text'
        },
        '.text-constitutional-gradient': {
          'background': 'linear-gradient(135deg, #1e1b4b 0%, #8b5cf6 50%, #fbbf24 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text'
        }
      });
      
      // Elite component utilities
      addComponents({
        '.elite-card': {
          'background': 'rgba(255, 255, 255, 0.08)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
          'border-radius': theme('borderRadius.elite-lg'),
          'padding': theme('spacing.elite-lg'),
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        '.elite-card:hover': {
          'background': 'rgba(255, 255, 255, 0.12)',
          'transform': 'translateY(-3px)',
          'box-shadow': '0 20px 40px rgba(0, 0, 0, 0.25)'
        },
        '.constitutional-card': {
          'background': 'rgba(30, 27, 75, 0.1)',
          'backdrop-filter': 'blur(25px)',
          'border': '1px solid rgba(251, 191, 36, 0.2)',
          'border-radius': theme('borderRadius.elite-xl'),
          'padding': theme('spacing.elite-xl')
        },
        '.quantum-card': {
          'background': 'rgba(139, 92, 246, 0.1)',
          'backdrop-filter': 'blur(35px)',
          'border': '1px solid rgba(139, 92, 246, 0.3)',
          'border-radius': theme('borderRadius.elite-xl'),
          'padding': theme('spacing.elite-lg'),
          'box-shadow': '0 15px 35px rgba(139, 92, 246, 0.25)'
        },
        '.elite-button': {
          'display': 'flex',
          'align-items': 'center',
          'gap': '0.5rem',
          'padding': '0.75rem 1.5rem',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'border-radius': theme('borderRadius.elite-md'),
          'background': 'rgba(255, 255, 255, 0.05)',
          'color': 'white',
          'font-weight': '600',
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          'cursor': 'pointer'
        },
        '.elite-button:hover': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'border-color': theme('colors.elite.accent'),
          'box-shadow': '0 0 15px rgba(251, 191, 36, 0.3)',
          'transform': 'translateY(-2px)'
        },
        '.constitutional-button': {
          'background': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          'border': '1px solid rgba(251, 191, 36, 0.3)',
          'color': 'white'
        },
        '.constitutional-button:hover': {
          'background': 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
          'box-shadow': '0 0 20px rgba(251, 191, 36, 0.4)'
        }
      });
      
      // Elite effect utilities
      addUtilities({
        '.elite-glow-text': {
          'text-shadow': '0 0 10px currentColor'
        },
        '.elite-glow-box': {
          'box-shadow': '0 0 20px currentColor'
        },
        '.constitutional-authority': {
          'background': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          'color': '#fbbf24',
          'text-shadow': '0 0 10px #fbbf24',
          'border': '1px solid rgba(251, 191, 36, 0.5)'
        },
        '.quantum-enhancement': {
          'background': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          'box-shadow': '0 0 25px rgba(139, 92, 246, 0.4)'
        },
        '.supreme-authority': {
          'background': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          'color': '#1e1b4b',
          'font-weight': '700',
          'text-shadow': '0 0 10px rgba(251, 191, 36, 0.5)',
          'box-shadow': '0 0 30px rgba(251, 191, 36, 0.5)'
        }
      });
    }
  ],
  
  // Elite safelist - Ensure dynamic classes are included
  safelist: [
    // Elite color variations
    'text-elite-accent',
    'text-elite-success',
    'text-elite-warning',
    'text-elite-danger',
    'text-elite-quantum',
    'bg-elite-primary',
    'bg-elite-quantum',
    'bg-elite-gold',
    'bg-elite-success',
    
    // Constitutional variations
    'text-constitutional-authority',
    'text-constitutional-validation',
    'text-constitutional-warning',
    'text-constitutional-rejection',
    'text-constitutional-supreme',
    'bg-constitutional-glass',
    'border-constitutional-authority',
    
    // Animation classes
    'animate-elite-glow',
    'animate-constitutional-pulse',
    'animate-quantum-float',
    'animate-supreme-shimmer',
    'animate-elite-rotate',
    
    // Dynamic state classes
    'opacity-0',
    'opacity-25',
    'opacity-50',
    'opacity-75',
    'opacity-100',
    'scale-0',
    'scale-50',
    'scale-75',
    'scale-90',
    'scale-95',
    'scale-100',
    'scale-105',
    'scale-110',
    
    // Elite responsive classes
    'elite-sm:text-elite-lg',
    'elite-md:text-elite-xl',
    'elite-lg:text-elite-2xl',
    'constitutional:grid-cols-4',
    'quantum:grid-cols-5'
  ]
};
