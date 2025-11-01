// GSAP Animations for Eduardo Evaristo Portfolio
// Advanced animations with ScrollTrigger for Backend/Frontend Developer

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Initialize GSAP animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initGSAPAnimations();
});

function initGSAPAnimations() {
    // Set initial states
    setInitialStates();
    
    // Hero animations
    initHeroAnimations();
    
    // Code animation in hero
    initCodeAnimations();
    
    // Skills section animations
    initSkillsAnimations();
    
    // Portfolio animations
    initPortfolioAnimations();
    
    // Contact animations
    initContactAnimations();
    
    // Scroll-triggered animations
    initScrollAnimations();
    
    // Advanced developer-specific animations
    initDeveloperAnimations();
}

function setInitialStates() {
    // Set initial opacity and transforms
    gsap.set([".greeting", ".name", ".title", ".scroll-indicator"], {
        opacity: 0,
        y: 50
    });
    
    gsap.set(".logo-icon", {
        opacity: 0,
        scale: 0.5,
        rotation: -180
    });
    
    gsap.set(".code-lines .code-line", {
        scaleX: 0,
        transformOrigin: "left center"
    });
    
    gsap.set(".database-icon", {
        opacity: 0,
        scale: 0,
        rotation: 180
    });
    
    gsap.set(".api-connections .api-node", {
        opacity: 0,
        scale: 0
    });
}

function initHeroAnimations() {
    const tl = gsap.timeline();
    
    // Logo animation with bounce effect
    tl.to(".logo-icon", {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.2,
        ease: "back.out(1.7)"
    })
    
    // Text animations with stagger
    .to([".greeting", ".name", ".title"], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
    }, "-=0.5")
    
    // Scroll indicator with pulse
    .to(".scroll-indicator", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.3")
    
    // Add continuous pulse to scroll indicator
    .to(".scroll-arrow", {
        scaleY: 1.2,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    }, "-=0.3");
}

function initCodeAnimations() {
    const tl = gsap.timeline({
        delay: 1.5
    });
    
    // Animate code lines typing effect
    tl.to(".code-lines .code-line", {
        scaleX: 1,
        duration: 0.8,
        stagger: 0.3,
        ease: "power2.out"
    })
    
    // Database icon animation
    .to(".database-icon", {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: "back.out(1.7)"
    }, "-=0.5")
    
    // API connections animation
    .to(".api-connections .api-line", {
        strokeDashoffset: 0,
        duration: 2,
        ease: "power2.inOut"
    }, "-=0.3")
    
    .to(".api-connections .api-node", {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.2,
        ease: "back.out(1.7)"
    }, "-=1");
    
    // Continuous pulse for API nodes
    gsap.to(".api-connections .api-node", {
        scale: 1.3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
        ease: "power2.inOut"
    });
}

function initSkillsAnimations() {
    // Backend animation
    ScrollTrigger.create({
        trigger: ".backend-svg",
        start: "top 80%",
        onEnter: () => {
            const tl = gsap.timeline();
            
            tl.to(".backend-svg .server-layer", {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: "power2.out"
            })
            .to(".backend-svg .server-light", {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }, "-=0.3");
            
            // Blinking server lights
            gsap.to(".backend-svg .server-light", {
                opacity: 0.3,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                stagger: 0.3,
                ease: "power2.inOut"
            });
        }
    });
    
    // Frontend animation
    ScrollTrigger.create({
        trigger: ".frontend-svg",
        start: "top 80%",
        onEnter: () => {
            const tl = gsap.timeline();
            
            tl.to(".frontend-svg .browser-frame", {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.7)"
            })
            .to(".frontend-svg .browser-header", {
                opacity: 1,
                duration: 0.4
            }, "-=0.4")
            .to(".frontend-svg .browser-dot", {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }, "-=0.2")
            .to(".frontend-svg .code-bracket", {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: "power2.out"
            }, "-=0.1");
        }
    });
    
    // Tech stack animation
    ScrollTrigger.create({
        trigger: ".tech-stack-svg",
        start: "top 90%",
        onEnter: () => {
            const tl = gsap.timeline();
            
            tl.to(".tech-connections .tech-node", {
                opacity: 1,
                scale: 1,
                duration: 0.5,
                stagger: 0.2,
                ease: "back.out(1.7)"
            })
            .to(".tech-connections .tech-label", {
                opacity: 1,
                duration: 0.3,
                stagger: 0.1
            }, "-=0.3")
            .to(".tech-connections .tech-line", {
                strokeDashoffset: 0,
                duration: 1.5,
                stagger: 0.2,
                ease: "power2.inOut"
            }, "-=0.5");
        }
    });
}

function initPortfolioAnimations() {
    // Project cards animation
    gsap.utils.toArray(".project-card").forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: "top 85%",
            onEnter: () => {
                gsap.fromTo(card, {
                    opacity: 0,
                    y: 100,
                    rotationX: 45
                }, {
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "power2.out"
                });
            }
        });
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -20,
                rotationY: 5,
                scale: 1.02,
                duration: 0.4,
                ease: "power2.out"
            });
            
            gsap.to(card.querySelector('.project-image img'), {
                scale: 1.1,
                duration: 0.4,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                rotationY: 0,
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            });
            
            gsap.to(card.querySelector('.project-image img'), {
                scale: 1,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });
}

function initContactAnimations() {
    ScrollTrigger.create({
        trigger: ".contact",
        start: "top 80%",
        onEnter: () => {
            const tl = gsap.timeline();
            
            tl.fromTo(".avatar-circle", {
                opacity: 0,
                scale: 0,
                rotation: 180
            }, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 1,
                ease: "back.out(1.7)"
            })
            .fromTo(".contact-name", {
                opacity: 0,
                y: 30
            }, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out"
            }, "-=0.5")
            .fromTo(".resume-text", {
                opacity: 0,
                y: 20
            }, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.3")
            .fromTo(".social-link", {
                opacity: 0,
                y: 20,
                rotation: 180
            }, {
                opacity: 1,
                y: 0,
                rotation: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }, "-=0.2");
        }
    });
}

function initScrollAnimations() {
    // Parallax effect for floating shapes
    gsap.utils.toArray(".shape").forEach((shape, index) => {
        gsap.to(shape, {
            y: -100 * (index + 1),
            scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    });
    
    // Text reveal animations
    gsap.utils.toArray(".about-text, .quote blockquote").forEach(text => {
        ScrollTrigger.create({
            trigger: text,
            start: "top 80%",
            onEnter: () => {
                gsap.fromTo(text, {
                    opacity: 0,
                    y: 50
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power2.out"
                });
            }
        });
    });
}

function initDeveloperAnimations() {
    // Terminal cursor blinking
    gsap.to(".terminal-cursor", {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });
    
    // Code typing effect
    const codeLines = document.querySelectorAll(".code-line");
    codeLines.forEach((line, index) => {
        gsap.fromTo(line, {
            width: 0
        }, {
            width: line.getAttribute('width') + 'px',
            duration: 2,
            delay: 2 + (index * 0.5),
            ease: "none"
        });
    });
    
    // Database pulse animation
    gsap.to(".database-icon", {
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 3
    });
    
    // API data flow animation
    const apiNodes = document.querySelectorAll(".api-node");
    apiNodes.forEach((node, index) => {
        gsap.to(node, {
            r: 8,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            delay: index * 0.5,
            ease: "power2.inOut"
        });
    });
    
    // Tech stack connection animation
    gsap.to(".tech-connections .tech-node", {
        scale: 1.2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
        ease: "power2.inOut"
    });
    
    // Skill text glitch effect
    const skillTexts = document.querySelectorAll(".skill-text");
    skillTexts.forEach(text => {
        text.addEventListener('mouseenter', () => {
            gsap.to(text, {
                x: 2,
                duration: 0.1,
                repeat: 5,
                yoyo: true,
                ease: "power2.inOut"
            });
        });
    });
}

// Advanced scroll-based animations
ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: self => {
        const progress = self.progress;
        
        // Dynamic color changes based on scroll
        const hue = Math.floor(progress * 60 + 240); // From blue to cyan
        document.documentElement.style.setProperty('--dynamic-color', `hsl(${hue}, 70%, 60%)`);
        
        // Floating shapes rotation
        gsap.to(".floating-shapes", {
            rotation: progress * 360,
            duration: 0.3,
            ease: "none"
        });
    }
});

// Performance optimization
ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
});

// Refresh ScrollTrigger on window resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});