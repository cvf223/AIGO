/**
 * 🎨 ELITE POSTCSS CONFIGURATION - PROFESSIONAL CSS PROCESSING
 * ===========================================================
 * 
 * Advanced PostCSS configuration for the Elite Arbitrage Syndicate
 * with professional-grade CSS optimization and processing
 */

export default {
  plugins: {
    // Tailwind CSS for elite utility classes
    tailwindcss: {},
    
    // Autoprefixer for elite browser compatibility
    autoprefixer: {
      overrideBrowserslist: [
        "> 1%",
        "last 2 versions",
        "not dead",
        "not ie 11"
      ],
      grid: true
    },
    
    // CSS Nano for elite production optimization
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          // Elite CSS optimization
          autoprefixer: false, // Already handled by autoprefixer plugin
          calc: true,
          colormin: true,
          convertValues: true,
          discardComments: { removeAll: true },
          discardEmpty: true,
          discardOverridden: true,
          discardUnused: false, // Keep for dynamic classes
          mergeIdents: true,
          mergeLonghand: true,
          mergeRules: true,
          minifyFontValues: true,
          minifyGradients: true,
          minifyParams: true,
          minifySelectors: true,
          normalizeCharset: true,
          normalizeDisplayValues: true,
          normalizePositions: true,
          normalizeRepeatStyle: true,
          normalizeString: true,
          normalizeTimingFunctions: true,
          normalizeUnicode: true,
          normalizeUrl: true,
          normalizeWhitespace: true,
          orderedValues: true,
          reduceIdents: false, // Preserve elite class names
          reduceInitial: true,
          reduceTransforms: true,
          svgo: true,
          uniqueSelectors: true,
          zindex: false // Preserve elite z-index system
        }]
      }
    } : {})
  }
};
