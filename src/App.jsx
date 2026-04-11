import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

// Component imports
import Navigation from './components/layout/Navigation';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Contact from './components/sections/Contact';

function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorHidden, setCursorHidden] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);

    // Ocultar el cursor glow cuando el ratón está sobre project cards o la foto de perfil
    const handleOver = () => setCursorHidden(true);
    const handleOut = () => setCursorHidden(false);

    const observer = new MutationObserver(() => {
      document.querySelectorAll('#projects .project-card, .profile-photo').forEach(el => {
        el.removeEventListener('mouseenter', handleOver);
        el.removeEventListener('mouseleave', handleOut);
        el.addEventListener('mouseenter', handleOver);
        el.addEventListener('mouseleave', handleOut);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Bind initially too
    setTimeout(() => {
      document.querySelectorAll('#projects .project-card, .profile-photo').forEach(el => {
        el.addEventListener('mouseenter', handleOver);
        el.addEventListener('mouseleave', handleOut);
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      {/* Premium custom cursor effect - Soft aura */}
      <motion.div
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
          x: mousePosition.x - 300,
          y: mousePosition.y - 300
        }}
      />

      {/* Illuminating Grid overlay */}
      <motion.div
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
          WebkitMaskImage: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%)`
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
        <Contact />
      </main>
    </div>
  );
}

export default App;
