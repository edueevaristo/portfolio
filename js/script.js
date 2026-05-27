

document.addEventListener('DOMContentLoaded', () => {
    
    const lenis = initSmoothScroll();

    initParticleCloud();

    init3DSpheres();

    initLanguageSwitcher();

    initGSAPAnimations();

    initMobileMenu();

    initContactForm();
});

function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                lenis.scrollTo(target, {
                    offset: -40,
                    immediate: false,
                    duration: 1.4
                });
            }
        });
    });

    return lenis;
}

function initParticleCloud() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const mouse = {
        x: null,
        y: null,
        radius: 120, 
        active: false
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
        mouse.active = false;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createNebulaCloud();
    });

    class Particle {
        constructor(cx, cy) {
            
            const power = 2.4; 
            this.radius = Math.pow(Math.random(), power) * Math.min(width, height) * 0.35;
            this.angle = Math.random() * Math.PI * 2;

            this.x = cx + Math.cos(this.angle) * this.radius;
            this.y = cy + Math.sin(this.angle) * this.radius;
            
            this.size = Math.random() * 2.2 + 0.8;
            this.orbitSpeed = (Math.random() * 0.0006 + 0.0002) * (Math.random() < 0.5 ? 1 : -1);

            this.bobSpeed = Math.random() * 0.02 + 0.005;
            this.bobDistance = Math.random() * 12 + 4;
            this.bobTime = Math.random() * 100;

            this.colorType = Math.random();
            if (this.colorType < 0.45) {
                this.color = { r: 0, g: 85, b: 255 };  
            } else if (this.colorType < 0.85) {
                this.color = { r: 0, g: 210, b: 255 }; 
            } else {
                this.color = { r: 248, g: 250, b: 252 }; 
            }
            
            this.alpha = Math.random() * 0.5 + 0.3; 
            this.originalAlpha = this.alpha;
            this.vx = 0;
            this.vy = 0;
        }

        update(cx, cy) {
            
            this.angle += this.orbitSpeed;
            let targetX = cx + Math.cos(this.angle) * this.radius;
            let targetY = cy + Math.sin(this.angle) * this.radius;

            this.bobTime += this.bobSpeed;
            targetY += Math.sin(this.bobTime) * this.bobDistance;
            targetX += Math.cos(this.bobTime * 0.7) * (this.bobDistance * 0.5);

            const springStrength = 0.035;
            this.vx += (targetX - this.x) * springStrength;
            this.vy += (targetY - this.y) * springStrength;

            if (mouse.active && mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.hypot(dx, dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius; 
                    const angle = Math.atan2(dy, dx);
                    
                    const pushFactor = 12;
                    this.vx += Math.cos(angle) * force * pushFactor;
                    this.vy += Math.sin(angle) * force * pushFactor;
                    
                    this.alpha = Math.min(1.0, this.alpha + 0.05);
                } else {
                    
                    this.alpha += (this.originalAlpha - this.alpha) * 0.03;
                }
            } else {
                this.alpha += (this.originalAlpha - this.alpha) * 0.03;
            }

            const friction = 0.88;
            this.vx *= friction;
            this.vy *= friction;
            this.x += this.vx;
            this.y += this.vy;
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

            if (this.size > 2.0) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
            }
            
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
            ctx.fill();
            ctx.restore();
        }
    }

    function createNebulaCloud() {
        particles = [];
        const cx = width / 2;
        const cy = height / 2;

        const particleCount = 450; 
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(cx, cy));
        }
    }

    function animateNebula() {
        ctx.clearRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        particles.forEach(p => {
            p.update(cx, cy);
            p.draw();
        });

        animationId = requestAnimationFrame(animateNebula);
    }

    createNebulaCloud();
    animateNebula();
}

function init3DSpheres() {
    const visualBox = document.querySelector('.about-visual');
    if (!visualBox) return;

    gsap.to('.sphere-1', { y: '-=25', x: '+=15', duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.sphere-2', { y: '+=35', x: '-=12', duration: 5.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.3 });
    gsap.to('.sphere-3', { y: '-=18', x: '-=20', duration: 3.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.6 });
    gsap.to('.sphere-4', { y: '+=25', x: '+=10', duration: 4.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.9 });

    visualBox.addEventListener('mousemove', (e) => {
        const rect = visualBox.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - (rect.width / 2);
        const mouseY = e.clientY - rect.top - (rect.height / 2);

        gsap.to('.sphere-1', { x: mouseX * 0.08, y: mouseY * 0.08, overwrite: 'auto', ease: 'power2.out', duration: 0.8 });
        gsap.to('.sphere-2', { x: mouseX * -0.04, y: mouseY * -0.04, overwrite: 'auto', ease: 'power2.out', duration: 0.8 });
        gsap.to('.sphere-3', { x: mouseX * 0.12, y: mouseY * 0.12, overwrite: 'auto', ease: 'power2.out', duration: 0.8 });
        gsap.to('.sphere-4', { x: mouseX * -0.06, y: mouseY * -0.06, overwrite: 'auto', ease: 'power2.out', duration: 0.8 });
    });

    visualBox.addEventListener('mouseleave', () => {
        gsap.to('.sphere', { x: 0, y: 0, ease: 'power3.out', duration: 1.2 });
    });
}

const translations = {
    pt: {
        "nav.home": "Início",
        "nav.about": "Sobre",
        "nav.projects": "Projetos",
        "nav.resume": "Currículo",
        "nav.contact": "Contato",
        "hero.greeting": "OLÁ, EU SOU",
        "hero.title": "FULL-STACK DEVELOPER",
        "hero.desc": "Desenvolvedor apaixonado por criar soluções digitais inovadoras, e-commerces escaláveis e experiências de alto nível.",
        "hero.btn_projects": "Ver Projetos",
        "hero.btn_contact": "Contato",
        "hero.scroll": "ROLAR",
        "about.pill1": "SOBRE",
        "about.headline": "Desenvolvedor Sênior apaixonado por dar vida ao código e solucionar desafios.",
        "about.p1": "Sou um <strong>Desenvolvedor Full Stack</strong> com mais de <strong>4 anos de experiência</strong>, especializado em criar aplicações web modernas, escaláveis e voltadas para e-commerce. Tenho paixão por tecnologia e foco em entregar soluções eficientes e de alta qualidade.",
        "about.p2": "Formado em <strong>Análise e Desenvolvimento de Sistemas</strong> na Universidade de Marília (Unimar), atuo como <strong>Desenvolvedor Fullstack Sênior na Fábrica de Códigos</strong>, participando do desenvolvimento do Shopping de Preços, plataforma que integra marketplaces e e-commerces.",
        "about.p3": "Possuo experiência prática consolidada com <strong>PHP, Laravel, Vue.js, PostgreSQL, MySQL, Docker, Git</strong> e integrações robustas via <strong>APIs REST e GraphQL</strong>. Busco sempre criar arquiteturas limpas, seguras e de alta performance. Com ênfase em front-end, possuo base sólida em <strong>GSAP</strong>, <strong>ScrollTrigger (GSAP)</strong>, <strong>Bootstrap (3, 4 e 5)</strong>, <strong>TailwindCSS</strong>.",
        "about.status": "Atualmente disponível somente para projetos",
        "projects.subtitle": "Onde desenvolvo conceitos e coloco minhas ideias em prática...",
        "projects.cat.dev_design": "DEV + DESIGN",
        "projects.cat.ui_dev": "UI DESIGN + DEV",
        "projects.cat.front": "FRONT-END DEVELOPER",
        "projects.glittr.desc": "Plataforma inteligente para comparação de preços de cosméticos e produtos de beleza.",
        "projects.fluent.desc": "Site e-commerce premium estruturado para lançamentos de coleções exclusivas de vestuário.",
        "projects.milena.desc": "Landing page de alta conversão para o lançamento de um guia devocional digital de 30 dias.",
        "projects.giovanni.desc": "Plataforma institucional imobiliária integrada com simulador de financiamento e captura de leads.",
        "projects.petfirst.desc": "Interface institucional moderna para centro estético animal, focada em UX e rapidez de navegação.",
        "projects.soon.title": "Em breve...",
        "projects.soon.desc": "Novos projetos inovadores, integrações e ideias backend estão sendo desenvolvidas.",
        "resume.badge": "CURRÍCULO",
        "resume.summary": "Desenvolvedor Sênior e arquiteto de software especializado em criar ecossistemas web escaláveis, integrações de marketplaces e APIs robustas de alta confiabilidade.",
        "resume.experience_title": "EXPERIÊNCIA",
        "resume.exp1.role": "Senior Fullstack Developer",
        "resume.exp2.role": "Freelancer & UI Developer",
        "resume.exp3.role": "Developer & Mentor",
        "resume.exp4.role": "Full Stack Developer",
        "resume.skills_title": "SKILLS",
        "resume.education_title": "EDUCAÇÃO",
        "resume.edu1.degree": "Análise e Desenvolvimento de Sistemas",
        "resume.edu2.degree": "Engenharia Eletrônica com ênfase em Software",
        "resume.edu3.degree": "Design de UX/UI Avançado",
        "resume.edu4.degree": "Web Design Completo",
        "resume.techs_title": "TECHS & TOOLS",
        "contact.title": "Vamos trabalhar juntos?",
        "contact.desc": "Estou sempre aberto a novas oportunidades de contratação, parcerias e projetos inovadores. Entre em contato comigo diretamente através dos canais abaixo.",
        "contact.phone": "Telefone / WhatsApp",
        "contact.location": "Localização",
        "contact.placeholder_name": "Seu nome",
        "contact.placeholder_email": "Seu email",
        "contact.placeholder_msg": "Sua mensagem",
        "contact.btn_submit": "Enviar Mensagem",
        "footer.desc": "Desenvolvedor Full Stack Sênior dedicado a construir soluções modernas e eficientes.",
        "footer.rights": "Todos os direitos reservados."
    },
    en: {
        "nav.home": "Home",
        "nav.about": "About",
        "nav.projects": "Projects",
        "nav.resume": "Resume",
        "nav.contact": "Contact",
        "hero.greeting": "HI, I AM",
        "hero.title": "FULL-STACK DEVELOPER",
        "hero.desc": "Developer passionate about creating innovative digital solutions, scalable e-commerces, and high-level experiences.",
        "hero.btn_projects": "View Projects",
        "hero.btn_contact": "Contact",
        "hero.scroll": "SCROLL",
        "about.pill1": "About",
        "about.headline": "Senior BR Developer passionate about bringing code to life and solving tech challenges.",
        "about.p1": "I am a <strong>Full Stack Developer</strong> with <strong>3+ years of experience</strong>, specialized in building modern, scalable, and e-commerce-focused web applications. I am passionate about technology and focused on delivering efficient, high-quality solutions.",
        "about.p2": "Graduated in <strong>Systems Analysis and Development</strong> at the University of Marília (Unimar), I work as a <strong>Senior Fullstack Developer at Fábrica de Códigos</strong>, participating in the development of Shopping de Preços, a platform integrating marketplaces and e-commerce stores.",
        "about.p3": "I have consolidated practical experience with <strong>PHP, Laravel, Vue.js, PostgreSQL, MySQL, Docker, Git</strong>, and robust integrations via <strong>REST and GraphQL APIs</strong>. I always aim to build clean, secure, and high-performance architectures. With a focus on front-end development, I have a solid foundation in <strong>GSAP</strong>, <strong>ScrollTrigger (GSAP)</strong>, <strong>Bootstrap (3, 4, and 5)</strong>, and <strong>TailwindCSS</strong>.",
        "about.status": "Available for projects",
        "projects.subtitle": "Where I develop concepts and put my ideas into practice...",
        "projects.cat.dev_design": "DEV + DESIGN",
        "projects.cat.ui_dev": "UI DESIGN + DEV",
        "projects.cat.front": "FRONT-END DEVELOPER",
        "projects.glittr.desc": "Intelligent beauty products and cosmetics comparison platform with live price index.",
        "projects.fluent.desc": "Premium e-commerce platform built for exclusive apparel drops and scalable cart sales.",
        "projects.milena.desc": "High-converting landing page built for the launch of a 30-day digital devotional guide.",
        "projects.giovanni.desc": "Real estate institutional platform integrated with a financing simulator and robust lead generation.",
        "projects.petfirst.desc": "Modern institutional web application for animal aesthetic center, focused on UX and speed.",
        "projects.soon.title": "Coming soon...",
        "projects.soon.desc": "New innovative projects, complex integrations, and backend ideas are currently in development.",
        "resume.badge": "RESUME",
        "resume.summary": "Senior Developer and software architect specialized in building scalable web ecosystems, complex marketplace integrations, and highly reliable APIs.",
        "resume.experience_title": "EXPERIENCE",
        "resume.exp1.role": "Senior Fullstack Developer",
        "resume.exp2.role": "Freelancer & UI Developer",
        "resume.exp3.role": "Developer & Mentor",
        "resume.exp4.role": "Full Stack Developer",
        "resume.skills_title": "SKILLS",
        "resume.education_title": "EDUCATION",
        "resume.edu1.degree": "Systems Analysis and Development",
        "resume.edu2.degree": "Electronics Engineering with Software emphasis",
        "resume.edu3.degree": "Advanced UX/UI Design",
        "resume.edu4.degree": "Complete Web Design",
        "resume.techs_title": "TECHS & TOOLS",
        "contact.title": "Let's work together?",
        "contact.desc": "I am always open to new job opportunities, partnerships, and innovative projects. Feel free to contact me directly through the channels below.",
        "contact.phone": "Phone / WhatsApp",
        "contact.location": "Location",
        "contact.placeholder_name": "Your name",
        "contact.placeholder_email": "Your email",
        "contact.placeholder_msg": "Your message",
        "contact.btn_submit": "Send Message",
        "footer.desc": "Senior Full Stack Developer dedicated to building modern, efficient solutions.",
        "footer.rights": "All rights reserved."
    }
};

function initLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');

    let currentLang = localStorage.getItem('portfolio_lang') || 'pt';
    setLanguage(currentLang);

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang === currentLang) return;
            
            currentLang = lang;
            localStorage.setItem('portfolio_lang', lang);
            setLanguage(lang);
        });
    });
}

function setLanguage(lang) {
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            gsap.to(element, {
                opacity: 0.3,
                y: -5,
                duration: 0.15,
                onComplete: () => {
                    element.innerHTML = translations[lang][key];
                    gsap.to(element, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
                }
            });
        }
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('placeholder', translations[lang][key]);
        }
    });
}

function initGSAPAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.reveal-fade-up').forEach((elem) => {
        gsap.fromTo(elem, {
            opacity: 0,
            y: 40
        }, {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: elem,
                start: 'top 88%',
                toggleActions: 'play none none none' 
            }
        });
    });

    gsap.utils.toArray('.reveal-text').forEach((elem) => {
        gsap.fromTo(elem, {
            opacity: 0,
            y: 20
        }, {
            opacity: 1,
            y: 0,
            duration: 1.3,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: elem,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });

    document.querySelectorAll('.tag-cloud-item').forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            gsap.to(tag, { scale: 1.06, duration: 0.25, ease: 'back.out(1.7)' });
        });
        tag.addEventListener('mouseleave', () => {
            gsap.to(tag, { scale: 1, duration: 0.25, ease: 'power2.out' });
        });
    });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 40%',
            end: 'bottom 40%',
            onEnter: () => updateNavHighlight(section.id),
            onEnterBack: () => updateNavHighlight(section.id)
        });
    });
}

function updateNavHighlight(id) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
        }
    });
}

function initMobileMenu() {
    const toggleBtn = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (!toggleBtn || !mobileMenu) return;

    toggleBtn.addEventListener('click', () => {
        const isActive = mobileMenu.classList.toggle('active');
        toggleBtn.classList.toggle('active');

        const bars = toggleBtn.querySelectorAll('.bar');
        if (isActive) {
            gsap.to(bars[0], { rotate: 45, y: 7, duration: 0.2 });
            gsap.to(bars[1], { opacity: 0, duration: 0.1 });
            gsap.to(bars[2], { rotate: -45, y: -7, duration: 0.2 });
        } else {
            gsap.to(bars[0], { rotate: 0, y: 0, duration: 0.2 });
            gsap.to(bars[1], { opacity: 1, duration: 0.1 });
            gsap.to(bars[2], { rotate: 0, y: 0, duration: 0.2 });
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            toggleBtn.classList.remove('active');
            
            const bars = toggleBtn.querySelectorAll('.bar');
            gsap.to(bars[0], { rotate: 0, y: 0, duration: 0.2 });
            gsap.to(bars[1], { opacity: 1, duration: 0.1 });
            gsap.to(bars[2], { rotate: 0, y: 0, duration: 0.2 });
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const message = document.getElementById('form-message').value.trim();

        if (!name || !email || !message) {
            showNotify('Por favor, preencha todos os campos.', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showNotify('Insira um endereço de e-mail válido.', 'error');
            return;
        }

        const submitBtn = form.querySelector('.btn-submit');
        gsap.to(submitBtn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 });

        showNotify('Mensagem enviada com sucesso! Muito obrigado.', 'success');
        form.reset();
    });
}

function showNotify(msg, type) {
    const box = document.createElement('div');
    box.className = `notify notify-${type}`;
    box.textContent = msg;

    box.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 16px 28px;
        border-radius: 14px;
        color: #ffffff;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        font-size: 14px;
        z-index: 10000;
        transform: translateY(100px);
        opacity: 0;
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        ${type === 'success' ? 'background: rgba(0, 85, 255, 0.2); border-color: rgba(0, 85, 255, 0.4); box-shadow: 0 10px 30px rgba(0, 85, 255, 0.15);' : 'background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 10px 30px rgba(239, 68, 68, 0.15);'}
    `;

    document.body.appendChild(box);

    setTimeout(() => {
        box.style.transform = 'translateY(0)';
        box.style.opacity = '1';
    }, 50);

    setTimeout(() => {
        box.style.transform = 'translateY(50px)';
        box.style.opacity = '0';
        setTimeout(() => {
            box.remove();
        }, 500);
    }, 4000);
}
