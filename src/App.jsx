import React, { useEffect, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from 'framer-motion';

// Component imports
import Navigation from './components/layout/Navigation';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import SecurityAudits from './components/sections/SecurityAudits';
import Contact from './components/sections/Contact';

function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const auraX = useTransform(mouseX, (value) => value - 300);
  const auraY = useTransform(mouseY, (value) => value - 300);
  const gridMask = useMotionTemplate`radial-gradient(circle 200px at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;
  const prefersReducedMotion = useReducedMotion();
  const [cursorHidden, setCursorHidden] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const interactiveSelector = '#projects .project-card, .profile-photo';
    const handleOver = (e) => {
      if (e.target.closest?.(interactiveSelector)) setCursorHidden(true);
    };
    const handleOut = (e) => {
      if (e.target.closest?.(interactiveSelector)) setCursorHidden(false);
    };

    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (!prefersReducedMotion && hasFinePointer) {
      window.addEventListener('pointermove', updateMousePosition, { passive: true });
    }
    if (hasFinePointer) {
      document.addEventListener('pointerover', handleOver);
      document.addEventListener('pointerout', handleOut);
    }

    return () => {
      window.removeEventListener('pointermove', updateMousePosition);
      document.removeEventListener('pointerover', handleOver);
      document.removeEventListener('pointerout', handleOut);
    };
  }, [mouseX, mouseY, prefersReducedMotion]);

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      {/* Premium custom cursor effect - Soft aura */}
      <motion.div
        className="cursor-aura"
        animate={{ opacity: cursorHidden ? 0 : 1 }}
        transition={{ duration: cursorHidden ? 0.3 : 0.5, ease: "easeInOut" }}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 223, 0, 0.03) 0%, rgba(212, 175, 55, 0.01) 40%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
          zIndex: -2,
          x: auraX,
          y: auraY
        }}
      />

      {/* Illuminating Grid overlay */}
      <motion.div
        className="cursor-grid"
        animate={{ opacity: cursorHidden ? 0 : 1 }}
        transition={{ duration: cursorHidden ? 0.3 : 0.5, ease: "easeInOut" }}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: -1,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          WebkitMaskImage: gridMask,
          maskImage: gridMask
        }}
      />

      {/* Progress bar */}
      <motion.div
        className="progress-bar"
        style={{
          scaleX,
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '2px',
          background: 'var(--text-primary)',
          transformOrigin: '0%',
          zIndex: 100
        }}
      />

      <Navigation />
      
      <main>
        <Hero />
        <About />
        <Projects />
        <SecurityAudits />
        <Contact />
      </main>
    </div>
  );
}

export default App;
