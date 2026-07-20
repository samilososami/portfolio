import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Github, Instagram, Youtube, ArrowUpRight } from 'lucide-react';

const TikTokIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const SOCIALS = [
  {
    label: 'GitHub',
    handle: '@samilososami',
    url: 'https://github.com/samilososami',
    icon: Github,
    desc: 'Aquí subo mis proyectos personales',
    aria: 'GitHub — visitar el perfil de Sami González Kamel (samilososami)',
    hoverShadow: '0 0 30px rgba(255,255,255,0.25)',
    hoverBorder: 'rgba(255,255,255,0.2)',
    iconColor: '#fff'
  },
  {
    label: 'Instagram',
    handle: '@samilososami',
    url: 'https://instagram.com/samilososami',
    icon: Instagram,
    desc: 'Fotos y demás',
    aria: 'Instagram — visitar el perfil de Sami González Kamel',
    hoverShadow: '0 0 30px rgba(225,48,108,0.25)',
    hoverBorder: 'linear-gradient(45deg, rgba(245,133,41,0.5), rgba(221,42,123,0.5), rgba(129,52,175,0.5))',
    iconColor: '#e1306c'
  },
  {
    label: 'TikTok',
    handle: '@samilososam1',
    url: 'https://tiktok.com/@samilososam1',
    icon: TikTokIcon,
    desc: 'Donde scrolleo todo el dia',
    aria: 'TikTok — visitar el perfil de Sami González Kamel',
    hoverShadow: '-10px 0 30px rgba(0,242,234,0.1), 10px 0 30px rgba(255,0,80,0.1)',
    hoverBorder: 'linear-gradient(45deg, rgba(0,242,234,0.5), rgba(255,0,80,0.5))',
    iconColor: '#fff'
  },
  {
    label: 'YouTube',
    handle: '@samilososami',
    url: 'https://youtube.com/@samilososami',
    icon: Youtube,
    desc: '¿Qué veo mientras ceno si no?',
    aria: 'YouTube — visitar el canal de Sami González Kamel',
    hoverShadow: '0 0 30px rgba(244,26,26,0.25)',
    hoverBorder: 'rgba(244,26,26,0.3)',
    iconColor: '#f41a1a'
  }
];

const AnimatedEmailLink = () => {
  const spanRef = useRef(null);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const percentage = (relX / rect.width) * 100;
    if (spanRef.current) {
      spanRef.current.style.transformOrigin = `${percentage}% 50%`;
      spanRef.current.style.transform = 'scaleX(1)';
    }
    e.currentTarget.style.color = '#fff';
  };

  const handleMouseLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const percentage = (relX / rect.width) * 100;
    if (spanRef.current) {
       spanRef.current.style.transformOrigin = `${percentage}% 50%`;
       spanRef.current.style.transform = 'scaleX(0)';
    }
    e.currentTarget.style.color = 'var(--text-primary)';
  };

  return (
    <a
      className="contact-email"
      href="mailto:samilososami@gmail.com"
      title="Enviar un correo electrónico a Sami González Kamel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center',
        gap: '0.8rem',
        fontSize: '1.5rem',
        color: 'var(--text-primary)',
        fontWeight: 600,
        textDecoration: 'none',
        paddingBottom: '0.8rem',
        transition: 'color 0.3s'
      }}
    >
      samilososami@gmail.com
      <ArrowUpRight size={26} />
      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--border-color)', borderRadius: '2px' }} />
      <span ref={spanRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#fff', transform: 'scaleX(0)', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', borderRadius: '2px' }} />
    </a>
  );
};

export default function Contact() {
  const ref = useRef(null);
  const socialsRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-300px" });
  const socialsInView = useInView(socialsRef, { once: true, margin: "-150px" });

  return (
    <section id="contact" title="Contacto y Redes Sociales de Sami González Kamel" style={{ padding: '10rem 5vw', background: '#111111', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }} ref={ref}>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '6rem' }}
        >
          <p style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--text-secondary)', marginBottom: '0.8rem', letterSpacing: '0.08em' }}>Contacto</p>
          <h2 className="heading-hero" style={{ lineHeight: 1.1, textTransform: 'none' }}>¿Alguna pregunta?</h2>
          <p className="text-body" style={{ maxWidth: '600px', marginTop: '1.5rem', fontSize: '1.1rem' }}>
            Si tienes alguna pregunta, solicitud o sugerencia, no dudes en enviarme un correo o escribirme en alguna de mis redes
          </p>
          
          <div style={{ marginTop: '3rem' }}>
            <AnimatedEmailLink />
          </div>
        </motion.div>

        {/* Social Grid */}
        <motion.div
          ref={socialsRef}
          initial={{ opacity: 0 }}
          animate={socialsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
          style={{ marginBottom: '8rem' }}
        >
          <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            Redes
          </p>
          <div className="social-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {SOCIALS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  title={s.label}
                  aria-label={s.aria}
                  initial={{ opacity: 0, y: 25 }}
                  animate={socialsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                  transition={{ duration: 0.9, delay: 0.15 + (i * 0.12), ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '2rem 1.5rem',
                    background: '#161616',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    transition: 'border-color 0.3s, background 0.3s, box-shadow 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (s.hoverBorder.includes('gradient')) {
                      e.currentTarget.style.border = '1px solid transparent';
                      e.currentTarget.style.background = `linear-gradient(#161616, #161616) padding-box, ${s.hoverBorder} border-box`;
                    } else {
                      e.currentTarget.style.borderColor = s.hoverBorder;
                    }
                    e.currentTarget.style.boxShadow = s.hoverShadow;
                    const icon = e.currentTarget.querySelector('.social-icon');
                    if (icon) icon.style.color = s.iconColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px solid var(--border-color)';
                    e.currentTarget.style.background = '#161616';
                    // Desvanecimiento suave en lugar de corte brusco para las sombras
                    if (s.label === 'TikTok') {
                      e.currentTarget.style.boxShadow = '-10px 0 30px rgba(0,242,234,0), 10px 0 30px rgba(255,0,80,0)';
                    } else if (s.hoverShadow.includes('rgba')) {
                      e.currentTarget.style.boxShadow = s.hoverShadow.replace(/0\.\d+\)/, '0)');
                    } else {
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(255,255,255,0)';
                    }
                    const icon = e.currentTarget.querySelector('.social-icon');
                    if (icon) icon.style.color = 'var(--text-secondary)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <s.icon className="social-icon" size={28} style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {s.handle}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: 'auto' }}>
                    {s.desc}
                  </div>
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}
        >
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Sami González Kamel
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.5 }}>
              Hecho con ayuda de
            </span>
            {/* Gemini */}
            <a
              href="https://gemini.google.com" target="_blank" rel="noreferrer"
              title="Google Gemini - IA de Google"
              aria-label="Google Gemini"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.3s, filter 0.3s', display: 'flex' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#4285f4';
                e.currentTarget.style.filter = 'drop-shadow(0 0 4px rgba(66,133,244,0.5))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C12 0 12 11.5 0 12c12 .5 12 12 12 12s0-11.5 12-12C12 11.5 12 0 12 0z"/>
              </svg>
            </a>
            {/* Claude */}
            <a
              href="https://claude.ai" target="_blank" rel="noreferrer"
              title="Claude AI - Anthropic"
              aria-label="Claude AI"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.3s, filter 0.3s', display: 'flex' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#d97757';
                e.currentTarget.style.filter = 'drop-shadow(0 0 4px rgba(217,119,87,0.5))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/>
              </svg>
            </a>
            {/* ChatGPT */}
            <a
              href="https://chat.openai.com" target="_blank" rel="noreferrer"
              title="ChatGPT - OpenAI"
              aria-label="ChatGPT"
              style={{ color: 'rgba(255,255,255,0.3)', transition: 'color 0.3s, filter 0.3s', display: 'flex' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.filter = 'drop-shadow(0 0 4px rgba(255,255,255,0.4))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
              </svg>
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
