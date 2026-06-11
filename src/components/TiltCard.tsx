"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

/**
 * Glass card with 3D mouse-tilt and red edge glow on hover.
 * Tilt is disabled automatically for users preferring reduced motion.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 5,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) scale3d(1.015, 1.015, 1)`;
    },
    [maxTilt]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "glass group relative overflow-hidden transition-[box-shadow,border-color,transform] duration-300 will-change-transform",
        "hover:border-race/50 hover:shadow-glow-red",
        className
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
