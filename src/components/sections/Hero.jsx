import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const terminalSequence = [
  { type: 'cmd', text: 'nmap -sS -p- -T4 10.0.0.1' },
  { type: 'out', delay: 800, text: 'Starting Nmap 7.93 ( https://nmap.org )' },
  { type: 'out', delay: 1500, text: 'Nmap scan report for 10.0.0.1\nHost is up (0.0020s latency).\nNot shown: 65530 closed ports' },
  { type: 'out', delay: 500, text: 'PORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https' },
  { type: 'out', delay: 2000, text: '' },
  { type: 'clear' },
  { type: 'cmd', text: 'gobuster dir -u http://10.0.0.1 -w common.txt -q' },
  { type: 'out', delay: 1200, text: '==================================================\nGobuster v3.6\n==================================================' },
  { type: 'out', delay: 600, text: '[+] Url:                     http://10.0.0.1/\n[+] Threads:                 10\n[+] Wordlist:                common.txt' },
  { type: 'out', delay: 1000, text: '==================================================' },
  { type: 'out', delay: 400, text: '/images               (Status: 301) [Size: 312]' },
  { type: 'out', delay: 300, text: '/css                  (Status: 301) [Size: 309]' },
  { type: 'out', delay: 800, text: '/index.php            (Status: 200) [Size: 4521]' },
  { type: 'out', delay: 1200, text: '/admin                (Status: 403) [Size: 280]' },
  { type: 'out', delay: 2000, text: '==================================================' },
  { type: 'clear' },
  { type: 'cmd', text: 'hydra -l root -P passwords.txt ssh://10.0.0.1' },
  { type: 'out', delay: 600, text: 'Hydra v9.x (c) 2026 by van Hauser/THC' },
  { type: 'out', delay: 500, text: 'Hydra starting at 2026-04-09 20:15:00' },
  { type: 'out', delay: 800, text: '[DATA] 16 tasks, 1 server, 1000 login tries (l:1/p:1000)' },
  { type: 'out', delay: 1500, text: '[DATA] attacking ssh://10.0.0.1:22/' },
  { type: 'out', delay: 3000, text: '[22] [ssh] host: 10.0.0.1   login: root   password: toor' },
  { type: 'out', delay: 500, text: '1 of 1 target completed, 1 valid password found' },
  { type: 'out', delay: 2000, text: '' },
  { type: 'clear' },
  { type: 'cmd', text: 'sqlmap -u "http://10.0.0.1/index.php?id=1" --batch --dbs' },
  { type: 'out', delay: 600, text: '        ___\n       __H__\n ___ ___["]_____ ___ ___  {1.8#stable}\n |_ -| . ["]     | .\'| . |\n |___|_  ["]_|_|_|__,|  _|\n       |_|V...       |_|   http://sqlmap.org\n' },
  { type: 'out', delay: 800, text: '[INFO] testing connection to the target URL' },
  { type: 'out', delay: 1500, text: '[INFO] GET parameter \'id\' is \'MySQL >= 5.0.12 AND time-based blind\' injectable' },
  { type: 'out', delay: 800, text: '[INFO] the back-end DBMS is MySQL' },
  { type: 'out', delay: 1200, text: '[INFO] fetching database names\navailable databases [3]:\n[*] information_schema\n[*] prod_db\n[*] users_db' },
  { type: 'out', delay: 3000, text: '' },
  { type: 'clear' },
  { type: 'cmd', text: 'hashcat -m 0 -a 0 hashes.txt rockyou.txt' },
  { type: 'out', delay: 800, text: 'hashcat (v6.2.6) starting...\n\n* Device #1: NVIDIA GeForce RTX 4090, 24108/24564 MB, 128MCU' },
  { type: 'out', delay: 1000, text: 'Hashes: 1 digests; 1 unique digests, 1 unique salts\nBitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes' },
  { type: 'out', delay: 2000, text: 'Status...........: Running\nSpeed.#1.........: 12543.2 MH/s\nProgress.........: 12345678 / 14344392 (86.07%)' },
  { type: 'out', delay: 1500, text: '\n5d41402abc4b2a76b9719d911017c592:s4mil0s0s4m1\n' },
  { type: 'out', delay: 800, text: 'Session..........: hashcat\nStatus...........: Cracked\nHash.Type........: MD5' },
  { type: 'out', delay: 3000, text: '' },
  { type: 'clear' },
  { type: 'cmd', text: 'python3 exploit.py -t 10.0.0.1 -p 443' },
  { type: 'out', delay: 800, text: '[*] Initializing memory leak sequence...' },
  { type: 'out', delay: 800, text: '[*] Injecting shellcode (x64 reverse_tcp)...' },
  { type: 'out', delay: 2000, text: '[+] Shellcode executed successfully!' },
  { type: 'out', delay: 600, text: '[*] Meterpreter session 1 opened (10.0.0.43:4444 -> 10.0.0.1:49213)' },
  { type: 'cmd', prompt: 'meterpreter > ', text: 'sysinfo' },
  { type: 'out', delay: 600, text: 'Computer        : PROD-SERVER-01\nOS              : Windows Server 2022 (Build 20348)\nArchitecture    : x64\nSystem Language : en_US' },
  { type: 'cmd', prompt: 'meterpreter > ', text: 'hashdump' },
  { type: 'out', delay: 1500, text: 'Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::\nGuest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::' },
  { type: 'out', delay: 5000, text: '' },
  { type: 'clear' }
];

function AnimatedTerminal() {
  const [history, setHistory] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('samilososami@kali:~# ');
  const [typedText, setTypedText] = useState('');
  
  useEffect(() => {
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
  }, []);

  return (
    <div 
      aria-label="Fondo decorativo de terminal técnico animado ejecutando herramientas de ciberseguridad"
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
           initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
           animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
           transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
           style={{ position: 'relative', zIndex: 10, width: '100%' }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <span 
              title="Nickname de Sami González Kamel"
              style={{ 
              display: 'block', 
              color: 'rgba(255, 255, 255, 0.28)', /* Lowered even more to feel like a watermark */
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
              className="heading-hero" 
              title="Sami González Kamel | Especialista en Ciberseguridad"
              style={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}
            >
              Sami González Kamel
            </h1>
          </div>
          
          <p className="text-body" style={{ maxWidth: '500px', marginBottom: '3rem', fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.55)' }}>
            Estudiante de Bachillerato enfocado en ciberseguridad y pentesting. Apasionado por la inteligencia artificial y el desarrollo de sistemas de bajo nivel.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <motion.a 
              href="#projects"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Ver proyectos de Sami González Kamel"
              aria-label="Navegar a la sección de proyectos destacados"
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
              Ver Proyectos
              <ArrowRight size={16} />
            </motion.a>
            <motion.a 
              href="#contact"
              whileHover={{ opacity: 0.7 }}
              title="Contactar con Sami González Kamel"
              aria-label="Navegar a la sección de contacto"
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
