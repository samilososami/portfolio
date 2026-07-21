import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, Book, Star, GitFork, Phone, Video, Send, Wrench } from 'lucide-react';

const AtlasMark = () => (
  <svg
    className="atlas-mark"
    viewBox="0 0 400 520"
    fill="none"
    aria-hidden="true"
  >
    <path d="M28 472 200 34l172 438-172-98L28 472Z" />
    <path d="m112 337 88-222 88 222-88-54-88 54Z" />
  </svg>
);

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-200px' });
  const [callState, setCallState] = useState('idle');

  const handleCall = (e) => {
    e.preventDefault();
    if (callState !== 'idle') return;
    
    // 1. Fase de Flash Blanco + Boom
    const boomAudio = new Audio('/boom.mp3');
    const ringAudio = new Audio('/ringtone_part1.mp3');
    
    boomAudio.play().catch(err => console.log('Boom audio blocked:', err));
    setCallState('flash');

    // 2. Después de 200ms (0.2s flash), mostrar imagen + Ringtone
    setTimeout(() => {
      setCallState('calling');
      ringAudio.play().catch(err => console.log('Ringtone blocked:', err));
      
      // 3. Iniciar Fade Out rápido hacia el final del audio
      setTimeout(() => {
        setCallState('fadeout');
        
        setTimeout(() => {
          setCallState('idle');
          ringAudio.pause();
          ringAudio.currentTime = 0;
        }, 1000); // Reducido a 1s de fade out oscuro
      }, 3500); // Aumentado a 3.5s visible
    }, 200); 
  };
  
  return (
    <section id="projects" title="Proyectos y Repositorios de Sami González Kamel" style={{ padding: '8rem 5vw', borderTop: '1px dashed rgba(255,255,255,0.05)', position: 'relative' }}>
      
      <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }} ref={ref}>
        <div className="projects-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
          <div>
            <h2 className="heading-section">Proyectos Destacados</h2>
            <p className="text-body" style={{ marginTop: '1rem' }}>Desarrollos personales, investigaciones y repositorios</p>
          </div>
          <div className="projects-actions">
            <a
              className="projects-action"
              href="/tools/"
              title="Abrir las herramientas web de Sami González Kamel"
            >
              Abrir herramientas <Wrench size={17} aria-hidden="true" />
            </a>
            <a
              className="projects-action"
              href="https://github.com/samilososami"
              target="_blank"
              rel="noreferrer"
              title="Ver perfil completo de GitHub de @samilososami"
            >
              Ver todo en GitHub <Github size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Grid de Proyectos */}
        <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          
          {/* Card 1: ESP32-SUITE (GitHub Theme) */}
          <motion.a
            className="project-card"
            href="https://github.com/samilososami/ESP32-SUITE"
            target="_blank"
            rel="noreferrer"
            title="Proyecto ESP32-SUITE en GitHub"
            aria-label="ESP32-SUITE — herramientas y firmware para ESP32 desarrollado por Sami González Kamel"
            initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 25, filter: 'blur(4px)' }}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              background: '#0d1117', 
              border: '1px solid #30363d', 
              borderRadius: '6px',
              textDecoration: 'none',
              minHeight: '280px',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              const title = e.currentTarget.querySelector('.gh-title');
              if(title) title.style.textDecoration = 'underline';
              e.currentTarget.style.borderColor = 'rgba(88,166,255,0.5)';
            }}
            onMouseLeave={(e) => {
              const title = e.currentTarget.querySelector('.gh-title');
              if(title) title.style.textDecoration = 'none';
              e.currentTarget.style.borderColor = '#30363d';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Book color="#8b949e" size={16} />
              <span className="gh-title" style={{ color: '#58a6ff', fontWeight: 600, fontSize: '1.25rem' }}>ESP32-SUITE</span>
              <span style={{ border: '1px solid #30363d', color: '#8b949e', fontSize: '0.75rem', padding: '0 7px', borderRadius: '2em', lineHeight: '18px', marginLeft: 'auto', fontWeight: 500 }}>Public</span>
            </div>
            
            <p style={{ color: '#8b949e', fontSize: '0.95rem', marginBottom: '32px', flex: 1, lineHeight: 1.5 }}>
              Un pequeño resumen de herramientas y firmwares para una ESP32, como trabajo de robótica.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#8b949e' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f34b7d' }} /> 
                C++
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={16} /> 0
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GitFork size={16} /> 0
              </span>
            </div>
          </motion.a>

          {/* Card 2: ATLAS (Minimalista Extremo) */}
          <motion.div
            className="project-card atlas-card"
            title="ATLAS - Agente de IA Experimental"
            aria-label="ATLAS: Agente de IA para automatización y domótica por Sami González Kamel"
            initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 25, filter: 'blur(4px)' }}
            transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              position: 'relative',
              display: 'flex', 
              flexDirection: 'column', 
              padding: '3rem 2.5rem', 
              background: '#fff', 
              border: 'none', 
              borderRadius: '0', 
              minHeight: '280px', 
              boxShadow: 'inset 0 0 0 1px #000',
              transition: 'box-shadow 0.5s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #000, 0 0 35px rgba(255,255,255,0.35), 0 0 60px rgba(255,255,255,0.12), inset 0 0 20px rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #000, 0 0 35px rgba(255,255,255,0), 0 0 60px rgba(255,255,255,0), inset 0 0 20px rgba(255,255,255,0)';
            }}
          >
            <AtlasMark />

            <div style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#000', letterSpacing: '0.1em' }}>AI</span>
              <span style={{ width: '6px', height: '6px', background: '#000', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            </div>

            <div className="atlas-card__content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#000', marginBottom: '1.5rem', letterSpacing: '-0.05em', lineHeight: 1 }}>ATLAS.</h3>
              <p style={{ color: '#666', fontSize: '0.95rem', flex: 1, marginBottom: '2rem', lineHeight: 1.5, fontWeight: 500 }}>
                Mi proyecto de TDR del instituto. Es un agente de IA para automatizar tareas y domótica, basado en la arquitectura de OpenClaw.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#000', fontWeight: 700, textTransform: 'uppercase', opacity: 0.6 }}>Python // Experimental</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: wowMessenger (Chat App Theme) */}
          <motion.a
            className="project-card"
            href="https://github.com/samilososami/wowmessenger"
            target="_blank"
            rel="noreferrer"
            title="wowMessenger - App de mensajería experimental"
            aria-label="wowMessenger — aplicación de mensajería con soporte de voz y video por Sami González Kamel"
            initial={{ opacity: 0, y: 25, filter: 'blur(4px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 25, filter: 'blur(4px)' }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              background: '#18181b', 
              border: '1px solid #27272a',
              borderRadius: '16px',
              textDecoration: 'none',
              overflow: 'hidden',
              minHeight: '280px',
              padding: 0, 
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.4s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(168, 85, 247, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(168, 85, 247, 0)';
              e.currentTarget.style.borderColor = '#27272a';
            }}
          >
            {/* Pantalla de llamada oculta (Easter Egg) */}
            {callState !== 'idle' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
                pointerEvents: 'none',
                overflow: 'hidden',
                opacity: 1 
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'url(/john_pork.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'calc(50% - 10px) center',
                  zIndex: 51,
                  opacity: 1 
                }} />
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: '#000',
                  zIndex: 52,
                  opacity: callState === 'fadeout' ? 1 : 0,
                  transition: callState === 'fadeout' ? 'opacity 1s ease-in' : 'none'
                }} />
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: '#fff',
                  zIndex: 53,
                  opacity: callState === 'flash' ? 1 : 0,
                  transition: 'opacity 1s ease-out'
                }} />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#27272a', borderBottom: '1px solid #3f3f46' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>W</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: '12px', height: '12px', background: '#22c55e', border: '2px solid #27272a', borderRadius: '50%' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', lineHeight: 1.2, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.3px' }}>
                    wowMessenger<span style={{ fontSize: '0.6em', verticalAlign: 'super', marginLeft: '2px', opacity: 0.7 }}>TM</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Online</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', color: '#a1a1aa' }}>
                <Phone size={18} title="Hacer llamada" style={{ cursor: 'pointer' }} onClick={handleCall} />
                <Video size={18} title="Hacer videollamada" />
              </div>
            </div>

            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'radial-gradient(circle at center, #1f1f22 0%, #18181b 100%)' }}>
              <div style={{ alignSelf: 'flex-start', background: '#27272a', padding: '0.8rem 1.2rem', borderRadius: '0 16px 16px 16px', maxWidth: '85%', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                <p style={{ color: '#e4e4e7', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  ¿y de qué va wowMessenger?
                </p>
                <div style={{ fontSize: '0.65rem', color: '#71717a', textAlign: 'right', marginTop: '4px' }}>10:41 AM</div>
              </div>
              <div style={{ alignSelf: 'flex-end', background: '#a855f7', padding: '0.8rem 1.2rem', borderRadius: '16px 16px 0 16px', maxWidth: '85%', boxShadow: '0 2px 10px rgba(168,85,247,0.2)' }}>
                <p style={{ color: '#fff', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  es una aplicacion de mensajeria web que cree para entender como funcionan
                </p>
              </div>
              <div style={{ alignSelf: 'flex-end', background: '#a855f7', padding: '0.8rem 1.2rem', borderRadius: '16px 0 16px 16px', maxWidth: '85%', boxShadow: '0 2px 10px rgba(168,85,247,0.2)' }}>
                <p style={{ color: '#fff', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  permite conversar con amigos, hacer llamadas, videollamadas, e incluso enviar audios o fotos
                </p>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: '4px' }}>10:43 AM</div>
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', background: '#1c1c1f', borderTop: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, background: '#27272a', padding: '0.6rem 1rem', borderRadius: '999px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#71717a', fontSize: '0.85rem' }}>Escribe un mensaje...</span>
              </div>
              <div style={{ padding: '0.5rem', background: '#a855f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Send size={14} color="#fff" style={{ transform: 'translateX(-1px)' }} />
              </div>
            </div>
          </motion.a>

        </div>
      </div>
    </section>
  );
}
