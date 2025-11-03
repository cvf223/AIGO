/**
 * ⚡ PERFORMANCE UTILITIES - Optimization Helpers
 * ==============================================
 * 
 * Memoization, throttling, and performance monitoring utilities
 */

/**
 * Throttle function execution
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Deep equality check for memoization
 */
export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Format bytes to human-readable
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration to human-readable
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 16) { // More than 1 frame at 60fps
      console.warn(`⚠️ ${componentName} render took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
}

/**
 * Batch updates to reduce re-renders
 */
export class UpdateBatcher {
  constructor(callback, delay = 100) {
    this.callback = callback;
    this.delay = delay;
    this.updates = [];
    this.timer = null;
  }

  add(update) {
    this.updates.push(update);
    
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    this.timer = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  flush() {
    if (this.updates.length > 0) {
      this.callback(this.updates);
      this.updates = [];
    }
    this.timer = null;
  }
}

export default {
  throttle,
  deepEqual,
  formatBytes,
  formatDuration,
  measureRenderTime,
  UpdateBatcher
};

