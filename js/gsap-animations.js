

gsap.registerPlugin(ScrollTrigger, TextPlugin);

document.addEventListener('DOMContentLoaded', function() {
    initGSAPAnimations();
});

function initGSAPAnimations() {
    
    setInitialStates();

    initHeroAnimations();

    initCodeAnimations();

    initSkillsAnimations();

    initPortfolioAnimations();

    initContactAnimations();

    initScrollAnimations();

    initDeveloperAnimations();
}

function setInitialStates() {
    
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

    tl.to(".logo-icon", {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.2,
        ease: "back.out(1.7)"
    })

    .to([".greeting", ".name", ".title"], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
    }, "-=0.5")

    .to(".scroll-indicator", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.3")

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

    tl.to(".code-lines .code-line", {
        scaleX: 1,
        duration: 0.8,
        stagger: 0.3,
        ease: "power2.out"
    })

    .to(".database-icon", {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: "back.out(1.7)"
    }, "-=0.5")

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
    
    gsap.to(".terminal-cursor", {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });

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

    gsap.to(".database-icon", {
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 3
    });

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

    gsap.to(".tech-connections .tech-node", {
        scale: 1.2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
        ease: "power2.inOut"
    });

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

ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: self => {
        const progress = self.progress;

        const hue = Math.floor(progress * 60 + 240); 
        document.documentElement.style.setProperty('--dynamic-color', `hsl(${hue}, 70%, 60%)`);

        gsap.to(".floating-shapes", {
            rotation: progress * 360,
            duration: 0.3,
            ease: "none"
        });
    }
});

ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
});

window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});