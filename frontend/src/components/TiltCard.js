import { useRef } from "react";
import { motion, useMotionValue, useMotionTemplate, useSpring, useTransform } from "framer-motion";

/**
 * A card that tilts in 3D toward the cursor and lifts a subtle glare
 * highlight, then eases back flat on mouse leave.
 */
export default function TiltCard({ children, className = "", ...props }) {
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const springConfig = { stiffness: 150, damping: 18, mass: 0.4 };
  const spx = useSpring(px, springConfig);
  const spy = useSpring(py, springConfig);

  const rotateX = useTransform(spy, [0, 1], [10, -10]);
  const rotateY = useTransform(spx, [0, 1], [-10, 10]);
  const glareX = useTransform(spx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(spy, [0, 1], ["0%", "100%"]);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.35), transparent 60%)`;

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: glareBackground }}
      />
      {children}
    </motion.div>
  );
}
