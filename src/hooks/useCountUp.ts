import { useState, useEffect, useRef } from "react";

/**
 * useCountUp — animates a number from 0 to `target` over `duration` ms.
 * Uses requestAnimationFrame with an easeOutExpo curve for a premium feel.
 *
 * @param target   - The final value to animate to
 * @param duration - Animation duration in ms (default 900)
 * @param delay    - Delay before animation starts in ms (default 0)
 * @param enabled  - Whether animation should run (default true)
 */
export function useCountUp(
  target: number,
  duration = 900,
  delay = 0,
  enabled = true,
): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    setValue(0);
    startRef.current = null;

    const delayTimer = setTimeout(() => {
      const animate = (ts: number) => {
        if (startRef.current === null) startRef.current = ts;
        const elapsed = ts - startRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setValue(Math.round(eased * target));

        if (progress < 1) {
          raf.current = requestAnimationFrame(animate);
        }
      };

      raf.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay, enabled]);

  return value;
}
