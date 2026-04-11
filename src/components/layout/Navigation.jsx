import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'hero', label: 'Inicio' },
  { id: 'about', label: 'Perfil' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'contact', label: 'Contacto' }
];

export default function Navigation() {
  const [activeItem, setActiveItem] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const isManualScrolling = React.useRef(false);
  const timeoutRef = React.useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      if (isManualScrolling.current) return; // BLOQUEO: Si el usuario hizo clic, ignoramos el scroll

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveItem(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleManualClick = (id) => {
    // 1. Bloqueamos la detección automática del observer
    isManualScrolling.current = true;
    
    // 2. Saltamos directamente al ítem seleccionado
    setActiveItem(id);
    
    // 3. Hacemos el scroll suave
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    // 4. Bloqueo estricto durante la duración de todo el smooth scroll
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isManualScrolling.current = false;
    }, 4000);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2.5vw',
        zIndex: 1000,
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem',
        background: isScrolled ? 'rgba(5, 5, 5, 0.45)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(16px)' : 'none',
        borderRadius: '8px',
        border: isScrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        transition: 'all 0.5s ease'
      }}
    >
      {NAV_ITEMS.map((item) => (
        <a 
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            handleManualClick(item.id);
          }}
          style={{
            position: 'relative',
            padding: '0.6rem 1rem',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: activeItem === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            textDecoration: 'none',
            zIndex: 2,
            transition: 'color 0.3s ease'
          }}
        >
          {item.label}
          {activeItem === item.id && (
            <motion.div
              layoutId="nav-line"
              style={{
                position: 'absolute',
                bottom: '0px',
                left: '1rem',
                right: '1rem',
                height: '1px',
                background: 'var(--text-primary)',
                boxShadow: '0 0 8px rgba(255,255,255,0.8)',
                zIndex: -1
              }}
              transition={{ type: 'tween', duration: 0.25, ease: 'circOut' }}
            />
          )}
        </a>
      ))}
    </motion.nav>
  );
}
