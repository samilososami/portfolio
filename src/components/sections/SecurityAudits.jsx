import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Check, FileCheck2, ScanSearch, ShieldCheck } from 'lucide-react';

const SCOPE_STEPS = [
  {
    number: '01',
    title: 'Alcance definido por ti',
    text: 'Tú indicas qué dominios, subdominios o entornos puedo revisar.'
  },
  {
    number: '02',
    title: 'Límites claros',
    text: 'Respeto exclusiones concretas: bases de datos, autenticación, producción o cualquier área sensible.'
  },
  {
    number: '03',
    title: 'Hallazgos útiles',
    text: 'Te entrego un resumen comprensible con los posibles riesgos detectados y recomendaciones de mejora.'
  }
];

export default function SecurityAudits() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-140px' });

  return (
    <section
      id="audits"
      ref={sectionRef}
      className="security-audits"
      aria-labelledby="audits-title"
    >
      <div className="security-audits__radar" aria-hidden="true">
        <span className="security-audits__radar-ring security-audits__radar-ring--outer" />
        <span className="security-audits__radar-ring security-audits__radar-ring--inner" />
        <motion.span
          className="security-audits__radar-scan"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="security-audits__inner">
        <motion.header
          className="security-audits__header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="security-audits__eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            Colaboraciones · Seguridad web
          </div>
          <h2 id="audits-title" className="security-audits__title">
            ¿Quieres reforzar<br />{' '}la seguridad de tu web?
          </h2>
        </motion.header>

        <div className="security-audits__layout">
          <motion.div
            className="security-audits__intro"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="security-audits__lead">
              Busco colaborar con empresas, proyectos y particulares realizando revisiones de seguridad web <strong>gratuitas y sin compromiso</strong>, siempre con autorización previa y bajo las instrucciones del propietario.
            </p>

            <div className="security-audits__assurances" aria-label="Condiciones de la auditoría">
              <span><Check size={14} aria-hidden="true" /> Sin coste</span>
              <span><Check size={14} aria-hidden="true" /> Sin compromiso</span>
              <span><Check size={14} aria-hidden="true" /> Solo con autorización</span>
            </div>

            <p className="security-audits__note">
              Si la revisión te resulta útil, cualquier propina o incentivo será más que agradecido y me ayudará a seguir aprendiendo y practicando. Es completamente opcional.
            </p>

            <div className="security-audits__actions">
              <motion.a
                href="mailto:samilososami@gmail.com?subject=Propuesta%20de%20auditor%C3%ADa%20web%20autorizada"
                className="security-audits__primary-action"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                Proponer una auditoría
                <ArrowUpRight size={18} aria-hidden="true" />
              </motion.a>
              <a href="#contact" className="security-audits__secondary-action">
                Hablar por redes
              </a>
            </div>
          </motion.div>

          <motion.div
            className="security-audits__scope"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="security-audits__scope-head">
              <div>
                <span>Proceso</span>
                <strong>Un alcance acordado antes de empezar</strong>
              </div>
              <ScanSearch size={28} aria-hidden="true" />
            </div>

            <div className="security-audits__scope-list">
              {SCOPE_STEPS.map((step) => (
                <div className="security-audits__scope-row" key={step.number}>
                  <span className="security-audits__scope-number">{step.number}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="security-audits__authorization">
              <FileCheck2 size={18} aria-hidden="true" />
              <span>No realizo pruebas sin permiso explícito del propietario.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
