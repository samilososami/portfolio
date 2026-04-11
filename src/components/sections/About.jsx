import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';



function FadeInBlock({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-150px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 40, filter: 'blur(8px)' }}
      transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay }}
      style={{
        paddingLeft: '2rem',
        borderLeft: '1px solid var(--border-color)',
        marginBottom: '4rem',
        position: 'relative'
      }}
    >
      <div style={{ position: 'absolute', left: '-4px', top: '10px', width: '7px', height: '7px', background: 'var(--border-color)', borderRadius: '50%' }} />
      {children}
    </motion.div>
  );
}

export default function About() {
  const gridRef = useRef(null);
  const isGridInView = useInView(gridRef, { once: true, margin: "-150px" });
  const sidePhotoRef = useRef(null);
  const isSidePhotoInView = useInView(sidePhotoRef, { once: true, margin: "-150px" });

  return (
    <section id="about" title="Perfil de Sami González Kamel" style={{ padding: '10rem 5vw', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem' }}>

        {/* Left Column: The Bio Blocks */}
        <div>
          <h2 className="heading-section" style={{ marginBottom: '4rem' }}>Perfil</h2>

          <FadeInBlock delay={0.1}>
            <p className="text-body" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '2rem' }}>
              Nacido el 9 de marzo de 2009 en El Cairo y formado entre Barcelona y Tarragona. Estudiante de 1º de Bachillerato interesado en ciberseguridad.
            </p>
            <p className="text-body" style={{ marginBottom: '1.5rem' }}>
              Me llamo <strong>Sami González Kamel</strong>. Empecé la primaria en Barcelona y en 2016, con 7 años, me mudé a Tarragona, donde completé la etapa primaria en la Escuela de Práctiques. Actualmente, con 17 años, curso primero de Bachillerato en el IES Tarragona, donde integro mis estudios con una constante evolución en el sector tecnológico.
            </p>
            <p className="text-body" style={{ marginBottom: '1.5rem' }}>
              Mi fascinación por la tecnología comenzó a los 14 años explorando el ecosistema Windows. Sin embargo, fue a los 15 cuando encontró mi verdadera vocación en la <strong>ciberseguridad y el pentesting</strong>. Desde entonces, he desarrollado un dominio avanzado operando laboratorios virtuales y distribuciones especializadas como Kali Linux y Parrot OS.
            </p>
            <motion.div
               ref={sidePhotoRef}
               className="profile-photo"
               initial={{ opacity: 0, x: -40 }}
               animate={isSidePhotoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
               transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
               style={{
                 width: '100%',
                 aspectRatio: '1/1', /* Formato cuadrado: muestra mucha más altura original */
                 borderRadius: '16px',
                 overflow: 'hidden',
                 border: '1px solid var(--border-color)',
                 position: 'relative',
                 marginTop: '4.5rem', /* Aumentado para separar y bajar todo el recuadro */
                 transition: 'box-shadow 0.5s ease'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.boxShadow = '0 0 50px rgba(255,255,255,0.045), 0 0 80px rgba(255,255,255,0.02)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.boxShadow = '0 0 50px rgba(255,255,255,0), 0 0 80px rgba(255,255,255,0)';
               }}
             >
               <img
                 src="/sami-gonzalez-kamel-pentesting-automatizacion.jpg"
                 alt="Sami González Kamel - Especialista en Ciberseguridad y Pentesting en Tarragona"
                 style={{
                   width: '100%',
                   height: '100%',
                   objectFit: 'cover',
                   objectPosition: 'center 20%', /* Bajamos la foto dentro del recuadro (enseña más por arriba) */
                   display: 'block',
                   filter: 'grayscale(15%) contrast(105%)'
                 }}
               />
             </motion.div>
          </FadeInBlock>
        </div>

        {/* Right Column: Tags & Arsenal */}
        <div style={{ paddingTop: '9.7rem' }} ref={gridRef}>
           <div style={{ marginBottom: '2rem' }}>
             <motion.div
               className="profile-photo"
               initial={{ opacity: 0, x: 40 }}
               animate={isGridInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
               transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
               style={{
                 width: '100%',
                 aspectRatio: '1/1',
                 borderRadius: '16px',
                 overflow: 'hidden',
                 border: '1px solid var(--border-color)',
                 position: 'relative',
                 transition: 'box-shadow 0.5s ease'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.boxShadow = '0 0 50px rgba(255,255,255,0.045), 0 0 80px rgba(255,255,255,0.02)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.boxShadow = '0 0 50px rgba(255,255,255,0), 0 0 80px rgba(255,255,255,0)';
               }}
             >
               <img
                 src="/sami-gonzalez-kamel-ciberseguridad-perfil.png"
                 alt="Sami González Kamel - Retrato profesional de ciberseguridad"
                 style={{
                   width: '100%',
                   height: '100%',
                   objectFit: 'cover',
                   filter: 'grayscale(15%) contrast(105%)'
                 }}
               />
             </motion.div>
           </div>

           {/* Detailed Tech Bio */}
           <div style={{ marginTop: '2.5rem' }}>
             <FadeInBlock delay={0.3}>
               <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                 He profundizado en la <strong>inteligencia artificial</strong> y en el desarrollo de bajo nivel, adquiriendo diversos conocimientos técnicos como la configuración y compilación de <strong>kernels para Android</strong>.
               </p>
               <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                 Mi base principal de programación es <strong>Python</strong>, donde manejo con soltura estructuras de automatización como bucles, funciones y clases. Esto lo complemento con un manejo sólido de Bash y fundamentos de PowerShell.
               </p>
               <p className="text-body">
                 A pesar de no centrarme en el diseño web, cuento con la base técnica necesaria en HTML y JavaScript para la auditoría y explotación de vectores como <strong>XSS e inyección HTML</strong>.
               </p>
             </FadeInBlock>
           </div>
        </div>


      </div>
    </section>
  );
}
