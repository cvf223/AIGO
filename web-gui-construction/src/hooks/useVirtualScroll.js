/**
 * 📜 VIRTUAL SCROLL HOOK - Performance Optimization
 * ================================================
 * 
 * Virtual scrolling for large lists to improve performance
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useVirtualScroll = (items, itemHeight = 60, containerHeight = 600) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const scrollContainerRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const scrollTop = scrollContainerRef.current.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 5, // +5 buffer
      items.length
    );

    setVisibleRange({ start, end });
  }, [items.length, itemHeight, containerHeight]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    scrollContainerRef,
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange
  };
};

export default useVirtualScroll;

