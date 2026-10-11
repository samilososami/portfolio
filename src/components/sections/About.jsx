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
      <div className="about-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6rem' }}>

        {/* Left Column: The Bio Blocks */}
        <div>
          <h2 className="heading-section" style={{ marginBottom: '4rem' }}>Perfil</h2>

          <FadeInBlock delay={0.1}>
            <p className="text-body" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 400, marginBottom: '2rem' }}>
              Nacido el 9 de marzo de 2009 en El Cairo y formado entre Barcelona y Tarragona. Estudiante de Bachillerato interesado en la inteligencia artificial, la informática y la tecnología en general.
            </p>
            <p className="text-body" style={{ marginBottom: '1.5rem' }}>
              Me llamo <strong>Sami González Kamel</strong>. Empecé la primaria en Barcelona y en 2016, con 7 años, me mudé a Tarragona, donde completé la etapa primaria. Compagino el Bachillerato con proyectos personales que me permiten experimentar y seguir aprendiendo por mi cuenta.
            </p>
            <p className="text-body" style={{ marginBottom: '1.5rem' }}>
              Mi interés por la tecnología comenzó a los 14 años explorando Windows. A los 15 empecé a profundizar en la <strong>ciberseguridad y el pentesting</strong>, trabajando con laboratorios virtuales y distribuciones como Kali Linux y Parrot OS. Con el tiempo, esa curiosidad se ha ampliado hacia la IA, la informática y la electrónica.
            </p>
            <motion.div
               ref={sidePhotoRef}
               className="profile-photo profile-photo--portrait"
               initial={{ opacity: 0, x: -40 }}
               animate={isSidePhotoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
               transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
               style={{
                 width: '100%',
                 aspectRatio: '4/5',
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
               <picture>
                 <source
                   srcSet="/sami-gonzalez-kamel-retrato-exterior-480.webp 480w, /sami-gonzalez-kamel-retrato-exterior.webp 864w"
                   sizes="(max-width: 700px) 90vw, (max-width: 980px) 70vw, 42vw"
                   type="image/webp"
                 />
                 <img
                   src="/sami-gonzalez-kamel-retrato-exterior.jpg"
                   srcSet="/sami-gonzalez-kamel-retrato-exterior-480.jpg 480w, /sami-gonzalez-kamel-retrato-exterior.jpg 864w"
                   sizes="(max-width: 700px) 90vw, (max-width: 980px) 70vw, 42vw"
                   alt="Sami González Kamel en un retrato exterior"
                   width="864"
                   height="1536"
                   loading="lazy"
                   decoding="async"
                   style={{
                     width: '100%',
                     height: '100%',
                     objectFit: 'cover',
                     objectPosition: 'center 34%',
                     display: 'block',
                     filter: 'grayscale(8%) contrast(104%)'
                   }}
                 />
               </picture>
             </motion.div>
          </FadeInBlock>
        </div>

        {/* Right Column: Tags & Arsenal */}
        <div className="about-grid__secondary" style={{ paddingTop: '9.7rem' }} ref={gridRef}>
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
               <picture>
                 <source
                   srcSet="/sami-gonzalez-kamel-ciberseguridad-perfil-360.webp 360w, /sami-gonzalez-kamel-ciberseguridad-perfil.webp 614w"
                   sizes="(max-width: 700px) 90vw, (max-width: 980px) 70vw, 42vw"
                   type="image/webp"
                 />
                 <img
                   src="/sami-gonzalez-kamel-ciberseguridad-perfil.png"
                   alt="Retrato de Sami González Kamel"
                   width="614"
                   height="921"
                   loading="lazy"
                   decoding="async"
                   style={{
                     width: '100%',
                     height: '100%',
                     objectFit: 'cover',
                     filter: 'grayscale(15%) contrast(105%)'
                   }}
                 />
               </picture>
             </motion.div>
           </div>

           {/* Detailed Tech Bio */}
           <div style={{ marginTop: '2.5rem' }}>
             <FadeInBlock delay={0.3}>
               <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                 Últimamente dedico más tiempo a la <strong>inteligencia artificial</strong>, la automatización y la conexión entre software y hardware. También he trabajado en tareas de bajo nivel, como la configuración y compilación de <strong>kernels para Android</strong>.
               </p>
               <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                 Mi base principal de programación es <strong>Python</strong>, donde manejo con soltura estructuras de automatización como bucles, funciones y clases. Esto lo complemento con un manejo sólido de Bash y fundamentos de PowerShell.
               </p>
               <p className="text-body">
                 Tengo conocimientos de <strong>electrónica y soldadura</strong>, que voy aplicando en proyectos prácticos. También estoy empezando con el <strong>diseño y la impresión 3D</strong>; de momento, mis conocimientos en este ámbito son básicos.
               </p>
               <p className="text-body" style={{ marginTop: '1.5rem' }}>
                 La ciberseguridad sigue formando parte de lo que hago, junto con Python, Bash y las bases de HTML y JavaScript. Ahora busco combinar esos conocimientos para construir herramientas y dispositivos que pueda usar en el día a día.
               </p>
             </FadeInBlock>
           </div>
        </div>


      </div>
    </section>
  );
}
