import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Github, Wrench } from 'lucide-react';

export default function Projects() {
  const reducedMotion = useReducedMotion();
  return (
    <section id="projects" className="featured-project" aria-labelledby="project-title">
      <div className="featured-project__inner">
        <div className="projects-header">
          <div>
            <h2 id="project-title" className="heading-section">Proyecto destacado</h2>
            <p className="text-body">Una forma de unir lo que voy aprendiendo.</p>
          </div>
          <a className="projects-action" href="/tools/">Abrir herramientas <Wrench size={17} aria-hidden="true" /></a>
        </div>
        <motion.article className="featured-atlas" initial={reducedMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .7 }}>
          <div className="featured-atlas__visual" aria-hidden="true">
            <span className="featured-atlas__word">ATLAS</span>
            <svg className="featured-atlas__face" viewBox="0 0 400 280" fill="none">
              <ellipse cx="116" cy="116" rx="26" ry="50" fill="currentColor" />
              <ellipse cx="284" cy="116" rx="26" ry="50" fill="currentColor" />
              <path d="M169 188 Q200 216 231 188" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
            </svg>
            <span className="featured-atlas__caption">IA · Software · Hardware</span>
          </div>
          <div className="featured-atlas__content">
            <p className="featured-atlas__label">Mi trabajo de investigación</p>
            <h3>ATLAS.</h3>
            <p className="text-body">ATLAS es mi <strong>TDR (Treball de Recerca) de Bachillerato</strong>: un prototipo de agente de inteligencia artificial físico, con voz, memoria y herramientas para realizar tareas.</p>
            <p className="text-body">Su primera versión, ATLAS A1, funciona sobre una Raspberry Pi 5 con pantalla táctil. En él voy conectando IA, programación y electrónica, documentando tanto las pruebas como lo que todavía queda por mejorar.</p>
            <div className="featured-atlas__actions">
              <a className="featured-atlas__primary" href="https://atlas.samilososami.com/">Ver la web de ATLAS <ArrowUpRight size={18} aria-hidden="true" /></a>
              <a className="projects-action" href="https://github.com/samilososami/ATLAS" target="_blank" rel="noopener noreferrer">Ver repositorio <Github size={18} aria-hidden="true" /></a>
            </div>
          </div>
        </motion.article>
        <a className="featured-project__more projects-action" href="https://github.com/samilososami" target="_blank" rel="noopener noreferrer">Más proyectos en GitHub <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
