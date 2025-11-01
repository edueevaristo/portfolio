document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initTypingEffect();
    initBackToTop();
    initSmoothScrolling();
    initProjectAnimations();
    initFormValidation();
    initSkillTooltips();
});

function initNavigation() {

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', () => {

        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    });

    navLinks.forEach(link => {

        link.addEventListener('click', () => {

            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        });

    });

    window.addEventListener('scroll', () => {

        const nav = document.querySelector('.nav');

        if (window.scrollY > 100) {

            nav.style.background = 'rgba(15, 15, 15, 0.98)';

        } else {

            nav.style.background = 'rgba(15, 15, 15, 0.95)';
        }
    });
}


function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll(`
        .about-text,
        .stat-item,
        .skill-item,
        .project-card,
        .contact-info,
        .contact-form
    `);

    elementsToAnimate.forEach((el, index) => {

        if (index % 3 === 0) {

            el.classList.add('fade-in');

        } else if (index % 3 === 1) {

            el.classList.add('slide-in-left');

        } else {

            el.classList.add('slide-in-right');
        }
        
        observer.observe(el);
    });

    const skillItems = document.querySelectorAll('.skill-item');

    skillItems.forEach((skill, index) => {

        skill.classList.add('scale-in');
        skill.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(skill);
    });
}

function initTypingEffect() {

    const typingText = document.querySelector('.typing-text');
    const cursor = document.querySelector('.cursor');
    
    if (!typingText) return;

    const texts = [
        'Full Stack Developer',
        'Backend Developer'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {

            setTimeout(() => {
                isDeleting = true;
            }, 2000);

        } else if (isDeleting && charIndex === 0) {

            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

function initBackToTop() {

    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {

        if (window.pageYOffset > 300) {

            backToTopBtn.classList.add('visible');

        } else {

            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    });
}

function initSmoothScrolling() {

    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {

        link.addEventListener('click', (e) => {

            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {

                const offsetTop = targetSection.offsetTop - 70;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (scrollIndicator) {

        scrollIndicator.addEventListener('click', () => {

            const aboutSection = document.querySelector('#about');

            if (aboutSection) {

                const offsetTop = aboutSection.offsetTop - 70;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }
}

function initProjectAnimations() {

    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });


        card.addEventListener('click', (e) => {

            if (!e.target.closest('.project-link')) {

                card.style.transform = 'translateY(-5px) scale(0.98)';

                setTimeout(() => {
                    card.style.transform = 'translateY(-10px) scale(1.02)';
                }, 150);
            }
        });
    });
}

function initFormValidation() {

    const form = document.querySelector('.contact-form form');
    
    if (!form) return;

    form.addEventListener('submit', (e) => {

        e.preventDefault();
        
        const formData = new FormData(form);
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const message = form.querySelector('textarea').value;
        
        // Validação básica
        if (!name || !email || !message) {

            showNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {

            showNotification('Por favor, insira um email válido.', 'error');
            return;
        }

        showNotification('Mensagem enviada com sucesso!', 'success');
        form.reset();
    });
}

function isValidEmail(email) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: linear-gradient(135deg, #00ff88, #00cc6a);' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #ff4757, #ff3742);' : ''}
        ${type === 'info' ? 'background: linear-gradient(135deg, #667eea, #764ba2);' : ''}
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function animateCounters() {

    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + '+';
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
}


function initParallax() {

    let ticking = false;
    
    function updateParallax() {

        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero::before');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

function initCustomCursor() {

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';

    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.1s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {

        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
        cursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {

        cursor.style.opacity = '0';
    });

    const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-item');

    interactiveElements.forEach(el => {

        el.addEventListener('mouseenter', () => {

            cursor.style.transform = 'scale(1.5)';

        });

        el.addEventListener('mouseleave', () => {

            cursor.style.transform = 'scale(1)';

        });

    });
}


function initLazyLoading() {

    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const img = entry.target;
                img.src = img.dataset.src;

                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }

        });

    });
    
    images.forEach(img => imageObserver.observe(img));
}


function initThemeToggle() {

    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';

    themeToggle.className = 'theme-toggle';
    themeToggle.style.cssText = `
        position: fixed;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        color: white;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', () => {

        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');

        icon.className = (document.body.classList.contains('light-theme') ? 'fas fa-sun' : 'fas fa-moon');
    });
}

function debounce(func, wait) {

    let timeout;

    return function executedFunction(...args) {

        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const optimizedScroll = debounce(() => {

}, 10);

window.addEventListener('scroll', optimizedScroll);


window.addEventListener('load', () => {

    setTimeout(() => {

        initParallax();
        initLazyLoading();
        animateCounters();

        if (window.innerWidth > 768) {

            initCustomCursor();
        }

    }, 500);
});



function initSkillTooltips() {

    const skillItems = document.querySelectorAll('.skill-item[data-skill]');
    
    skillItems.forEach(item => {
        const skillName = item.dataset.skill;
        const skillLevel = item.dataset.level;

        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';

        tooltip.innerHTML = `
            <div>${skillName}</div>
            <div class="skill-progress">
                <div class="skill-progress-bar" data-width="${skillLevel}"></div>
            </div>
            <div class="skill-level">${skillLevel}%</div>
        `;
        
        item.appendChild(tooltip);

        item.addEventListener('mouseenter', () => {

            const progressBar = tooltip.querySelector('.skill-progress-bar');

            setTimeout(() => {
                progressBar.style.width = skillLevel + '%';
            }, 100);

        });
        
        item.addEventListener('mouseleave', () => {

            const progressBar = tooltip.querySelector('.skill-progress-bar');
            progressBar.style.width = '0%';

        });
    });
}

