/* ============================================================
   SAMI PORTFOLIO — PREMIUM JS
   ============================================================ */

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- INTERSECTION OBSERVER (REVEAL) ----------
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            en.target.classList.add('active');
            // Animate progress bars when visible
            en.target.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ---------- SMOOTH MOUSE PARALLAX ON AURORA ----------
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

const blobs = document.querySelectorAll('.aurora-blob');
function animateBlobs() {
    blobs.forEach((blob, i) => {
        const speed = (i + 1) * 8;
        blob.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
    });
    requestAnimationFrame(animateBlobs);
}
animateBlobs();

// ---------- HARDWARE CAROUSEL ----------
const HARDWARE = [
    { name: 'Rubber Ducky', company: 'Hak5', img: 'https://m.media-amazon.com/images/I/71-KfJZScdL.jpg' },
    { name: 'Flipper Zero', company: 'Flipper Devices', img: 'https://m.media-amazon.com/images/I/61hypBE3WXL.jpg' },
    { name: 'Proxmark3 Easy', company: 'Elechouse', img: 'https://m.media-amazon.com/images/I/51Zf+6tWpYL.jpg' },
    { name: 'WiFi Pineapple', company: 'Hak5', img: 'https://shop.hak5.org/cdn/shop/products/gokit1_1200x.jpg?v=1722645348' },
    { name: 'OM.G Plug', company: 'Hak5', img: 'https://shop.hak5.org/cdn/shop/products/Plug_600x.jpg?v=1668118141' },
    { name: 'Raspberry Pi 4', company: 'RPI Foundation', img: 'https://m.media-amazon.com/images/I/71Yjs1JDM-S.jpg' },
    { name: 'Alfa Adapter', company: 'Alfa Network', img: 'https://www.evxab.com/9155-large_default/alfa-awus036axml-80211ax.jpg' },
    { name: 'ESP32', company: 'Espressif', img: 'https://manuals.plus/wp-content/uploads/2024/06/keyestudio-ESP32-Development-Board-Product.png' },
    { name: 'Bash Bunny', company: 'Hak5', img: 'https://web-assets.eset.com/fileadmin/ESET/LATAM/Prensa/24-04-04.2.jpeg' },
    { name: 'WiFi Pineapple Pager', company: 'Hak5', img: 'https://shop.hak5.org/cdn/shop/files/wifi-pineapple-pager-black-white_bg_2000x.png' }
];

const hwTrack = document.getElementById('hwTrack');
function createHWCards() {
    const tripled = [...HARDWARE, ...HARDWARE, ...HARDWARE];
    hwTrack.innerHTML = tripled.map(hw => `
        <div class="hw-card">
            <div class="hw-img-wrap">
                <img src="${hw.img}" alt="${hw.name}" class="hw-img" loading="lazy">
                <div class="hw-img-fade"></div>
            </div>
            <div class="hw-info">
                <div class="hw-name">${hw.name}</div>
                <div class="hw-company">${hw.company}</div>
            </div>
        </div>
    `).join('');
}
createHWCards();

let scrollPos = 0;
const itemW = 280 + 24; // card width + gap
const totalSetW = HARDWARE.length * itemW;
let carouselSpeed = 0.4;

function animateCarousel() {
    scrollPos += carouselSpeed;
    if (scrollPos >= totalSetW) scrollPos = 0;
    hwTrack.style.transform = `translateX(${-scrollPos}px)`;
    requestAnimationFrame(animateCarousel);
}
requestAnimationFrame(animateCarousel);

// ---------- PROJECTS (GitHub API + fallback) ----------
const PROJECT_CONFIG = {
    'ESP32-SUITE': 'Colección de firmwares y scripts personalizados para la gestión y domótica con ESP32',
    'framework': 'Marco de trabajo personalizado para automatización de tareas de pentesting',
    'knap': 'Herramienta avanzada para el análisis de probes enviadas por dispositivos',
    'wifi2discord': 'Script en PowerShell que envía redes WiFi y contraseñas a una webhook',
    'wifiwer': 'Script en PowerShell para ver rápidamente contraseñas WiFi guardadas',
    'win7preter': 'Herramienta de explotación a Windows 7 para obtener sesión de meterpreter'
};

const FALLBACK = [
    { title: 'ESP32-SUITE', desc: 'Colección de firmware ofensivo y defensivo para el ESP32.', lang: 'C++', color: '#f34b7d', stars: 156, forks: 42, repo: 'https://github.com/samilososami/ESP32-SUITE', updated: '2 days ago' },
    { title: 'framework', desc: 'Marco de trabajo para automatización de pentesting.', lang: 'Python', color: '#3572A5', stars: 89, forks: 15, repo: 'https://github.com/samilososami/framework', updated: '1 week ago' },
    { title: 'knap', desc: 'Análisis de sondas Wi-Fi y detección de redes ocultas.', lang: 'Python', color: '#3572A5', stars: 210, forks: 34, repo: 'https://github.com/samilososami/knap', updated: '3 days ago' },
    { title: 'wifi2discord', desc: 'Notificación de credenciales Wi-Fi a Discord vía Webhooks.', lang: 'Python', color: '#3572A5', stars: 124, forks: 28, repo: 'https://github.com/samilososami/wifi2discord', updated: 'Last month' },
    { title: 'wifiwer', desc: 'Suite de auditoría para redes inalámbricas automatizada.', lang: 'Shell', color: '#89e051', stars: 76, forks: 9, repo: 'https://github.com/samilososami/wifiwer', updated: '2 months ago' },
    { title: 'win7preter', desc: 'Post-explotación orientada a sistemas Windows 7 legacy.', lang: 'Python', color: '#3572A5', stars: 45, forks: 12, repo: 'https://github.com/samilososami/win7preter', updated: 'Last week' }
];

function getLangColor(lang) {
    const c = { 'Python': '#3572A5', 'C++': '#f34b7d', 'Shell': '#89e051', 'JavaScript': '#f1e05a', 'TypeScript': '#2b7489', 'HTML': '#e34c26', 'CSS': '#563d7c' };
    return c[lang] || '#8b949e';
}

const repoSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/></svg>`;
const starSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>`;
const forkSvg = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>`;

async function fetchProjects() {
    const grid = document.getElementById('projects-grid');
    try {
        const res = await fetch('https://api.github.com/users/samilososami/repos');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const projects = data
            .filter(r => PROJECT_CONFIG[r.name])
            .map(r => ({
                title: r.name,
                desc: PROJECT_CONFIG[r.name],
                lang: r.language || 'Code',
                stars: r.stargazers_count,
                forks: r.forks_count,
                repo: r.html_url,
                updated: new Date(r.updated_at).toLocaleDateString(),
                color: getLangColor(r.language)
            }))
            .sort((a, b) => b.stars - a.stars);
        if (!projects.length) throw new Error('empty');
        renderProjects(projects, grid);
    } catch (e) {
        console.warn('GitHub API fallback:', e);
        renderProjects(FALLBACK, grid);
    }
}

function renderProjects(projects, grid) {
    grid.innerHTML = '';
    projects.forEach((p, i) => {
        const card = document.createElement('a');
        card.href = p.repo;
        card.target = '_blank';
        card.className = 'project-card reveal';
        card.style.transitionDelay = `${i * 0.05}s`;
        card.innerHTML = `
            <div class="project-header">
                <div class="project-icon">${repoSvg}</div>
                <span class="project-title">${p.title}</span>
                <span class="project-badge">Public</span>
            </div>
            <p class="project-desc">${p.desc}</p>
            <div class="project-meta">
                <span class="meta-item"><span class="lang-dot" style="background:${p.color}"></span>${p.lang}</span>
                <span class="meta-item">${starSvg} ${p.stars}</span>
                <span class="meta-item">${forkSvg} ${p.forks}</span>
            </div>
        `;
        grid.appendChild(card);
        revealObs.observe(card);
    });
}
fetchProjects();

// ---------- NAVIGATION DOCK ----------
const navDock = document.getElementById('navDock');
const navDrop = document.getElementById('nav-drop');
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('section');
const backBtn = document.getElementById('back-to-top');

let isManual = false;

function moveDrop(el) {
    navDrop.style.width = `${el.offsetWidth}px`;
    navDrop.style.transform = `translateX(${el.offsetLeft}px)`;
    navItems.forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        isManual = true;
        moveDrop(e.target);
        setTimeout(() => { isManual = false; }, 800);
    });
});

setTimeout(() => {
    const active = document.querySelector('.nav-item.active');
    if (active) moveDrop(active);
}, 100);

window.addEventListener('scroll', () => {
    if (!isManual) {
        let current = '';
        sections.forEach(s => {
            if (pageYOffset >= s.offsetTop - 350) current = s.id;
        });
        if (pageYOffset < 100) current = 'hero';
        const active = document.querySelector(`.nav-item[data-nav="${current}"]`);
        if (active && !active.classList.contains('active')) moveDrop(active);
    }

    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY;
    if ((scrollTotal - scrollY) < 5) {
        navDock.classList.add('hidden');
        backBtn.classList.add('visible');
    } else {
        navDock.classList.remove('hidden');
        backBtn.classList.remove('visible');
    }
});

backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
