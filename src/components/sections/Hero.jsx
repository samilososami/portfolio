import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const terminalSequence = [
  { type: 'cmd', text: 'python3 atlas.py' },
  { type: 'out', delay: 800, text: '[ATLAS] Preparando el entorno...\n[ATLAS] Voz, memoria y herramientas disponibles.' },
  { type: 'out', delay: 1800, text: 'Una idea, un prototipo y muchas pruebas.' },
  { type: 'out', delay: 3500, text: '' },
  { type: 'clear' },
  { type: 'cmd', text: 'uname -srmo' },
  { type: 'out', delay: 900, text: 'Linux · aarch64 · GNU/Linux' },
  { type: 'cmd', text: 'ls proyectos/' },
  { type: 'out', delay: 800, text: 'atlas/  electronica/  automatizacion/  laboratorios/' },
  { type: 'out', delay: 3500, text: '' },
  { type: 'clear' }
];

function AnimatedTerminal() {
  const terminalRef = useRef(null);
  const isInView = useInView(terminalRef, { margin: '160px' });
  const [history, setHistory] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('samilososami@kali:~# ');
  const [typedText, setTypedText] = useState('');
  
  useEffect(() => {
    if (!isInView) return undefined;

    let step = 0;
    let isTyping = false;
    let timeout;
    let typeInterval;
    
    const runStep = () => {
      if (step >= terminalSequence.length) {
        step = 0; // loop
      }
      
      const current = terminalSequence[step];
      
      if (current.type === 'clear') {
        setHistory([]);
        setTypedText('');
        setCurrentPrompt('samilososami@kali:~# ');
        step++;
        timeout = setTimeout(runStep, 500);
        return;
      }
      
      if (current.type === 'cmd') {
        const promptToUse = current.prompt || 'samilososami@kali:~# ';
        setCurrentPrompt(promptToUse);
        setTypedText('');
        
        // Type effect
        let charIndex = 0;
        const textToType = current.text;
        isTyping = true;
        
        typeInterval = setInterval(() => {
          setTypedText(textToType.substring(0, charIndex + 1));
          charIndex++;
          
          if (charIndex === textToType.length) {
            clearInterval(typeInterval);
            isTyping = false;
            // Wait a bit, then commit to history
            timeout = setTimeout(() => {
              setHistory(h => [...h, promptToUse + textToType]);
              setTypedText('');
              setCurrentPrompt(''); // Hides prompt while output runs
              step++;
              runStep();
            }, 300);
          }
        }, Math.random() * 50 + 20); // random typing speed 20-70ms per char
        return;
      }
      
      if (current.type === 'out') {
        timeout = setTimeout(() => {
          setHistory(h => [...h, current.text]);
          step++;
          runStep();
        }, current.delay || 300);
        return;
      }
    };
    
    timeout = setTimeout(runStep, 1000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(typeInterval);
    };
  }, [isInView]);

  return (
    <div
      ref={terminalRef}
      aria-hidden="true"
      style={{
      /* Reduced importance: very faint background, no border, just faint text */
      padding: '2rem',
      height: '750px',
      width: '100%',
      maxWidth: '900px',
      fontFamily: 'var(--font-mono)',
      fontSize: '1.2rem',
      color: 'rgba(255, 255, 255, 0.08)', // Reduced from 0.15
      lineHeight: 1.5,
      textAlign: 'left',
      position: 'relative',
      WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
      maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)',
      overflow: 'hidden',
      overflowAnchor: 'none' /* FIX: Prevents Chrome scroll jump when clearing history */
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {history.map((line, i) => {
          let pfx = '';
          let rest = line;
          if (line.startsWith('samilososami@kali:~# ')) {
            pfx = 'samilososami@kali:~# ';
            rest = line.substring(pfx.length);
          } else if (line.startsWith('meterpreter > ')) {
            pfx = 'meterpreter > ';
            rest = line.substring(pfx.length);
          }
          return (
            <div key={i} style={{ whiteSpace: 'pre-wrap', marginBottom: '0.2rem' }}>
              {pfx && <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>{pfx}</span>}
              <span>{rest}</span>
            </div>
          );
        })}
        {/* Current typing line */}
        <div style={{ whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.15)' }}>
          {currentPrompt && <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>{currentPrompt}</span>}
          <span>{typedText}</span>
          <motion.span 
            animate={{ opacity: [1, 0] }} 
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ display: 'inline-block', width: '6px', height: '12px', background: 'rgba(255,255,255,0.15)', verticalAlign: 'middle', marginLeft: '2px' }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section id="hero" title="Inicio - Sami González Kamel" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 5vw', position: 'relative', overflow: 'hidden' }}>
      
      {/* Abstract Graphic Alternative - Terminal (Moved to absolute section bounds) */}
      <motion.div
         className="hero-terminal"
         aria-hidden="true"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 2.5, delay: 1.2, ease: 'easeOut' }}
         style={{ 
           position: 'absolute',
           right: '-11%', // Moved a micro bit back to the right
           top: '15%',    // Moved slightly up
           width: '1000px', 
           pointerEvents: 'none',
           zIndex: 0,
           userSelect: 'none'
         }}
      >
        <AnimatedTerminal />
      </motion.div>

      <motion.div 
        style={{ 
          maxWidth: '1200px', 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Text Content */}
        <motion.div
           initial={{ opacity: 1, y: 18 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
           style={{ position: 'relative', zIndex: 10, width: '100%' }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <span 
              title="Nickname de Sami González Kamel"
              style={{ 
              display: 'block', 
              color: 'rgba(255, 255, 255, 0.36)',
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', 
              fontFamily: "'Major Mono Display', monospace",
              letterSpacing: '-0.02em', 
              marginBottom: '0.5rem', 
              fontWeight: 400,
              textShadow: '0 0 20px rgba(255, 255, 255, 0.02)'
            }}>
              samilososami
            </span>
            <h1 
              className="heading-hero hero-title"
              title="Sami González Kamel | Estudiante de Bachillerato interesado en tecnología, inteligencia artificial y ciberseguridad"
              style={{ lineHeight: 1.1 }}
            >
              Sami González Kamel
            </h1>
          </div>
          
          <p className="text-body" style={{ maxWidth: '500px', marginBottom: '3rem', fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.55)' }}>
            Estudiante de Bachillerato interesado en la tecnología, la inteligencia artificial y la ciberseguridad. Me gusta entender cómo funcionan las cosas y aprender construyendo mis propios proyectos.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <motion.a 
              href="#projects"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Conocer ATLAS, el proyecto de Sami González Kamel"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                background: 'var(--text-primary)',
                color: 'var(--bg-color)',
                borderRadius: '999px',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              Conocer ATLAS
              <ArrowRight size={16} />
            </motion.a>
            <motion.a 
              href="#contact"
              whileHover={{ opacity: 0.7 }}
              title="Contactar con Sami González Kamel"
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.2rem'
              }}
            >
              Contactar
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
