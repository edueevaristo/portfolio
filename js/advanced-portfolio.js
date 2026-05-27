

gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);

let scene, camera, renderer, particles;
let backToTopButton;
let isLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
});

function initializePortfolio() {
    
    initThreeJS();

    initAdvancedGSAP();

    initBackToTop();

    initBackendVisualization();

    initParticleSystem();

    initAdvancedInteractions();

    isLoaded = true;
}

function initThreeJS() {
    const canvas = document.getElementById('threejs-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

        colors[i * 3] = Math.random() * 0.3 + 0.3; 
        colors[i * 3 + 1] = Math.random() * 0.3 + 0.7; 
        colors[i * 3 + 2] = Math.random() * 0.3 + 0.9; 

        sizes[i] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 customColor;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = customColor;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(time + position.x * 0.01) * 0.3);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            
            void main() {
                float distance = length(gl_PointCoord - vec2(0.5));
                if (distance > 0.5) discard;
                
                float alpha = 1.0 - distance * 2.0;
                gl_FragColor = vec4(vColor, alpha * 0.8);
            }
        `,
        transparent: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 1000;

    function animate() {
        requestAnimationFrame(animate);
        
        if (particles) {
            particles.rotation.x += 0.0005;
            particles.rotation.y += 0.001;
            particles.material.uniforms.time.value += 0.01;
        }
        
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initAdvancedGSAP() {
    
    const masterTL = gsap.timeline();

    initHeroAnimations();

    initScrollAnimations();

    

    initPortfolioEffects();

    initContactAnimations();
}

function initHeroAnimations() {
    
    gsap.set([".greeting", ".name", ".title", ".scroll-indicator"], {
        opacity: 0,
        y: 100,
        rotationX: 45
    });
    
    gsap.set(".logo-icon", {
        opacity: 0,
        scale: 0,
        rotation: -360
    });

    const heroTL = gsap.timeline({ delay: 0.5 });

    heroTL.to(".logo-icon", {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)"
    })

    .to([".greeting", ".name", ".title"], {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "back.out(1.7)"
    }, "-=0.8")

    .to(".scroll-indicator", {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.5");

    gsap.to(".scroll-arrow", {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });

    gsap.to(".name", {
        textShadow: "0 0 20px rgba(79, 70, 229, 0.8)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });
}

function initScrollAnimations() {
    
    ScrollTrigger.create({
        trigger: ".about-text",
        start: "top 80%",
        onEnter: () => {
            gsap.fromTo(".about-text", {
                opacity: 0,
                y: 50,
                scale: 0.9
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.5,
                ease: "power3.out"
            });
        }
    });

    ScrollTrigger.create({
        trigger: ".skills",
        start: "top 70%",
        onEnter: () => {
            const skillsTL = gsap.timeline();
            
            skillsTL.fromTo(".skill-text", {
                opacity: 0,
                scale: 0,
                rotation: 180
            }, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 1.5,
                stagger: 0.3,
                ease: "back.out(1.7)"
            })
            .to(".skill-text", {
                textShadow: "0 0 30px currentColor",
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut"
            }, "-=1");
        }
    });

    ScrollTrigger.create({
        trigger: ".quote",
        start: "top 80%",
        onEnter: () => {
            const quoteText = document.querySelector(".quote blockquote");
            const text = quoteText.textContent;
            quoteText.textContent = "";
            
            gsap.to(quoteText, {
                text: {
                    value: text,
                    delimiter: ""
                },
                duration: 4,
                ease: "none"
            });
        }
    });
}

            

            

            

            

            

            

            

            

            

            

            

            

            

function initPortfolioEffects() {
    
    gsap.utils.toArray(".project-card").forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: "top 85%",
            onEnter: () => {
                gsap.fromTo(card, {
                    opacity: 0,
                    y: 100,
                    rotationX: 45,
                    scale: 0.8
                }, {
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    scale: 1,
                    duration: 1.2,
                    delay: index * 0.1,
                    ease: "back.out(1.7)"
                });
            }
        });

        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -20,
                rotationY: 10,
                scale: 1.05,
                boxShadow: "0 30px 60px rgba(79, 70, 229, 0.3)",
                duration: 0.6,
                ease: "power2.out"
            });
            
            gsap.to(card.querySelector('.project-image img'), {
                scale: 1.2,
                rotation: 2,
                duration: 0.6,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                rotationY: 0,
                scale: 1,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                duration: 0.6,
                ease: "power2.out"
            });
            
            gsap.to(card.querySelector('.project-image img'), {
                scale: 1,
                rotation: 0,
                duration: 0.6,
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
            const contactTL = gsap.timeline();
            
            contactTL.fromTo(".avatar-circle", {
                opacity: 0,
                scale: 0,
                rotation: 360
            }, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 1.5,
                ease: "elastic.out(1, 0.5)"
            })
            .fromTo(".contact-name", {
                opacity: 0,
                y: 50,
                rotationX: 90
            }, {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 1,
                ease: "power2.out"
            }, "-=0.8")
            .fromTo(".resume-text", {
                opacity: 0,
                scale: 0.8
            }, {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: "back.out(1.7)"
            }, "-=0.5")
            .fromTo(".social-link", {
                opacity: 0,
                y: 30,
                rotation: 180,
                scale: 0
            }, {
                opacity: 1,
                y: 0,
                rotation: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }, "-=0.5");

            gsap.to(".avatar-circle", {
                boxShadow: "0 0 40px rgba(79, 70, 229, 0.8)",
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut"
            });
        }
    });
}

function initBackToTop() {
    backToTopButton = document.getElementById('backToTop');
    if (!backToTopButton) return;

    ScrollTrigger.create({
        start: "top -100",
        end: 99999,
        toggleClass: {className: "visible", targets: backToTopButton}
    });

    backToTopButton.addEventListener('click', () => {
        gsap.to(window, {
            scrollTo: {y: 0, autoKill: false},
            duration: 1.5,
            ease: "power2.inOut"
        });
    });

    backToTopButton.addEventListener('mouseenter', () => {
        gsap.to(backToTopButton, {
            scale: 1.1,
            rotation: 360,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    });
    
    backToTopButton.addEventListener('mouseleave', () => {
        gsap.to(backToTopButton, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: "back.out(1.7)"
        });
    });
}

function initBackendVisualization() {
    
    console.log("Backend visualization initialized");
}

function initParticleSystem() {
    
    for (let i = 0; i < 50; i++) {
        createParticle();
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    document.body.appendChild(particle);

    gsap.to(particle, {
        y: -window.innerHeight,
        x: (Math.random() - 0.5) * 200,
        opacity: 0,
        duration: Math.random() * 10 + 5,
        ease: "none",
        onComplete: () => {
            particle.remove();
            createParticle(); 
        }
    });
}

function initAdvancedInteractions() {
    
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(79, 70, 229, 0.8), rgba(6, 182, 212, 0.8));
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.1s ease;
    `;
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX - 10,
            y: e.clientY - 10,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    const interactiveElements = document.querySelectorAll('a, button, .project-card, .social-link, .skill-text');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, {
                scale: 2,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, {
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });
    });

    ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: self => {
            const progress = self.progress;

            gsap.to(".floating-shapes", {
                y: progress * -200,
                rotation: progress * 360,
                duration: 0.3,
                ease: "none"
            });

            if (camera) {
                camera.position.y = progress * 100;
                camera.rotation.z = progress * 0.1;
            }
        }
    });
}

ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
});

window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

window.addEventListener('load', () => {
    gsap.to('.loading', {
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
            document.querySelector('.loading')?.remove();
        }
    });
});