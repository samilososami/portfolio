import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Award, Newspaper } from 'lucide-react';

const PRESS = [
  {
    outlet: 'COATT',
    date: '27 MAY 2026',
    label: 'Fuente oficial del concurso',
    url: 'https://coattgn.cat/linstitut-tarragona-guanya-el-gran-concurs-del-formigo-i-representara-tarragona-a-nivell-estatal/'
  },
  {
    outlet: 'InfoCamp',
    date: '19 MAY 2026',
    label: 'Leer la noticia',
    url: 'https://infocamp.cat/linstitut-tarragona-guanya-el-gran-concurs-del-formigo-i-representara-la-demarcacio-a-nivell-estatal/'
  },
  {
    outlet: 'Diari Més',
    date: '20 MAY 2026',
    label: 'Leer el reportaje',
    url: 'https://www.diarimes.com/ca/tarragona/260520/formigo-tarragoni-final-estatal_220514.html'
  }
];

export default function Recognition() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-180px' });

  return (
    <section
      id="recognition"
      className="recognition"
      aria-labelledby="recognition-title"
      title="Premio a la creatividad de Sami González Kamel"
    >
      <div className="recognition__grid" aria-hidden="true" />
      <motion.div
        ref={ref}
        className="recognition__inner"
        initial={{ opacity: 0, y: 34 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="recognition__intro">
          <p className="recognition__eyebrow">
            <Award size={15} aria-hidden="true" /> Reconocimiento · Tarragona · 2026
          </p>
          <h2 id="recognition-title" className="recognition__title">
            Premio a la<br />creatividad.
          </h2>
        </div>

        <div className="recognition__content">
          <p className="recognition__lead">
            Junto a <strong>Emilio Hernández</strong> y <strong>Marc Ferré</strong>, formé el equipo
            responsable del vídeo del Gran Concurso del Hormigón 2026. Nuestro trabajo recibió
            el premio a la creatividad en la fase de Tarragona. En las publicaciones sobre el
            concurso aparezco como <strong>Sami González</strong>.
          </p>

          <a
            className="recognition__detail-link"
            href="/reconocimientos/gran-concurso-hormigon-2026/"
            aria-label="Ver el reconocimiento y todas las menciones en prensa"
          >
            Ver reconocimiento y menciones <ArrowUpRight size={18} aria-hidden="true" />
          </a>

          <div className="recognition__press" aria-label="Menciones verificadas">
            <div className="recognition__press-heading">
              <Newspaper size={15} aria-hidden="true" />
              <span>Menciones verificadas</span>
            </div>
            {PRESS.map((item) => (
              <a
                className="recognition__press-row"
                href={item.url}
                target="_blank"
                rel="noopener"
                key={item.outlet}
              >
                <span>
                  <strong>{item.outlet}</strong>
                  <small>{item.label}</small>
                </span>
                <span className="recognition__press-meta">
                  {item.date} <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
