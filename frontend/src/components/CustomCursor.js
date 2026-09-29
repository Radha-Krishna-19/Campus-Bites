import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Minimal custom cursor: a small solid dot glued to the pointer, and a
 * soft ring that trails behind with spring easing. The ring grows and
 * tints on hover over interactive elements. Disabled on touch devices.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isDown, setIsDown] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { damping: 30, stiffness: 250, mass: 0.4 });
  const ringY = useSpring(dotY, { damping: 30, stiffness: 250, mass: 0.4 });

  useEffect(() => {
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasFinePointer) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      const target = e.target.closest?.('a, button, [role="button"], input, textarea, select, [data-cursor]');
      setIsPointer(!!target);
    };
    const down = () => setIsDown(true);
    const up = () => setIsDown(false);
    const leave = () => {
      dotX.set(-100);
      dotY.set(-100);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] w-1.5 h-1.5 rounded-full bg-orange-500"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: isDown ? 0.5 : 1, opacity: isPointer ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border border-orange-400/70"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: isPointer ? 40 : 22,
          height: isPointer ? 40 : 22,
          scale: isDown ? 0.85 : 1,
          backgroundColor: isPointer ? "rgba(249,115,22,0.10)" : "rgba(249,115,22,0)",
          borderColor: isPointer ? "rgba(234,88,12,0.9)" : "rgba(251,146,60,0.5)",
        }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
      />
    </>
  );
}
