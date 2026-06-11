import { useState, useEffect } from 'react';

// Animated counter that counts up to the final value
export default function AnimatedAmount({ value, prefix = '₹', duration = 800, style = {} }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = Math.abs(value || 0);
    if (end === 0) { setDisplay(0); return; }
    const stepTime = Math.max(10, duration / (end / 100));
    let current = start;
    const timer = setInterval(() => {
      current = Math.min(current + Math.ceil(end / (duration / stepTime)), end);
      setDisplay(current);
      if (current >= end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value, duration]);

  const formatted = display.toLocaleString('en-IN');

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{formatted}
    </span>
  );
}
