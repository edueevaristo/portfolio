// Advanced Portfolio with GSAP & Three.js
// Eduardo Evaristo - Ultimate Developer Portfolio

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);

// Global variables
let scene, camera, renderer, particles;
let backToTopButton;
let isLoaded = false;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
});

function initializePortfolio() {
    // Initialize Three.js background
    initThreeJS();
    
    // Initialize GSAP animations
    initAdvancedGSAP();
    
    // Initialize back to top button
    initBackToTop();
    
    // Initialize backend visualization
    initBackendVisualization();
    
    // Initialize particle system
    initParticleSystem();
    
    // Initialize advanced interactions
    initAdvancedInteractions();
    
    // Mark as loaded
    isLoaded = true;
}

// Three.js Background
function initThreeJS() {
    const canvas = document.getElementById('threejs-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Create particle system
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

        // Blue to cyan gradient
        colors[i * 3] = Math.random() * 0.3 + 0.3; // R
        colors[i * 3 + 1] = Math.random() * 0.3 + 0.7; // G
        colors[i * 3 + 2] = Math.random() * 0.3 + 0.9; // B

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

    // Animation loop
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

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Advanced GSAP Animations
function initAdvancedGSAP() {
    // Master timeline
    const masterTL = gsap.timeline();
    
    // Hero section with advanced animations
    initHeroAnimations();
    
    // Scroll-triggered animations
    initScrollAnimations();
    
    // Backend visualization animations
    // initBackendAnimations();
    
    // Portfolio advanced effects
    initPortfolioEffects();
    
    // Contact section with morphing
    initContactAnimations();
}

function initHeroAnimations() {
    // Set initial states
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

    // Hero timeline
    const heroTL = gsap.timeline({ delay: 0.5 });
    
    // Logo with elastic bounce
    heroTL.to(".logo-icon", {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)"
    })
    
    // Text with 3D rotation
    .to([".greeting", ".name", ".title"], {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "back.out(1.7)"
    }, "-=0.8")
    
    // Scroll indicator with morphing
    .to(".scroll-indicator", {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "power2.out"
    }, "-=0.5");

    // Continuous animations
    gsap.to(".scroll-arrow", {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });

    // Name text morphing effect
    gsap.to(".name", {
        textShadow: "0 0 20px rgba(79, 70, 229, 0.8)",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
    });
}

function initScrollAnimations() {
    // About section with split text
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

    // Skills section with morphing
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

    // Quote with typewriter effect
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

// function initBackendAnimations() {
//     // Server rack animation
//     ScrollTrigger.create({
//         trigger: ".skills",
//         start: "top 60%",
//         onEnter: () => {
//             const backendTL = gsap.timeline();
            
//             // Server rack appears
//             backendTL.to(".server-rack", {
//                 opacity: 1,
//                 duration: 1,
//                 ease: "power2.out"
//             })
            
//             // Server units slide in
//             .to(".server-unit", {
//                 opacity: 1,
//                 x: 0,
//                 duration: 0.8,
//                 stagger: 0.2,
//                 ease: "back.out(1.7)"
//             }, "-=0.5")
            
//             // Server LEDs blink
//             .to(".server-led", {
//                 opacity: 1,
//                 duration: 0.3,
//                 stagger: 0.1,
//                 ease: "power2.out"
//             }, "-=0.3");
            
//             // Continuous LED blinking
//             gsap.to(".server-led", {
//                 opacity: 0.3,
//                 duration: 1.5,
//                 repeat: -1,
//                 yoyo: true,
//                 stagger: 0.2,
//                 ease: "power2.inOut"
//             });
//         }
//     });

//     // Database cluster animation
//     ScrollTrigger.create({
//         trigger: ".skills",
//         start: "top 50%",
//         onEnter: () => {
//             const dbTL = gsap.timeline();
            
//             dbTL.to(".database-cluster", {
//                 opacity: 1,
//                 scale: 1,
//                 duration: 1.2,
//                 ease: "back.out(1.7)"
//             })
//             .to(".data-flow", {
//                 strokeDashoffset: 0,
//                 duration: 2,
//                 stagger: 0.3,
//                 ease: "power2.inOut"
//             }, "-=0.5");
            
//             // Continuous data flow
//             gsap.to(".data-flow", {
//                 strokeDashoffset: -100,
//                 duration: 3,
//                 repeat: -1,
//                 ease: "none"
//             });
//         }
//     });

//     // Load balancer and traffic
//     ScrollTrigger.create({
//         trigger: ".skills",
//         start: "top 40%",
//         onEnter: () => {
//             const lbTL = gsap.timeline();
            
//             lbTL.to(".load-balancer", {
//                 opacity: 1,
//                 y: 0,
//                 duration: 1,
//                 ease: "power2.out"
//             })
//             .to(".traffic-line", {
//                 strokeDashoffset: 0,
//                 duration: 1.5,
//                 stagger: 0.2,
//                 ease: "power2.out"
//             }, "-=0.5")
//             .to(".backend-server", {
//                 opacity: 1,
//                 scale: 1,
//                 duration: 0.8,
//                 stagger: 0.1,
//                 ease: "back.out(1.7)"
//             }, "-=0.8");
//         }
//     });

//     // API Gateway
//     ScrollTrigger.create({
//         trigger: ".skills",
//         start: "top 30%",
//         onEnter: () => {
//             const apiTL = gsap.timeline();
            
//             apiTL.to(".api-gateway", {
//                 opacity: 1,
//                 rotationY: 0,
//                 duration: 1.2,
//                 ease: "power2.out"
//             })
//             .to(".api-endpoint", {
//                 opacity: 1,
//                 scale: 1,
//                 duration: 0.6,
//                 stagger: 0.1,
//                 ease: "back.out(1.7)"
//             }, "-=0.5");
            
//             // Pulsing endpoints
//             gsap.to(".api-endpoint", {
//                 scale: 1.5,
//                 duration: 1.5,
//                 repeat: -1,
//                 yoyo: true,
//                 stagger: 0.3,
//                 ease: "power2.inOut"
//             });
//         }
//     });

//     // Microservices
//     ScrollTrigger.create({
//         trigger: ".skills",
//         start: "top 20%",
//         onEnter: () => {
//             const msTL = gsap.timeline();
            
//             msTL.to(".microservices", {
//                 opacity: 1,
//                 x: 0,
//                 duration: 1,
//                 ease: "power2.out"
//             })
//             .to(".microservice", {
//                 opacity: 1,
//                 scale: 1,
//                 rotation: 0,
//                 duration: 0.8,
//                 stagger: 0.15,
//                 ease: "back.out(1.7)"
//             }, "-=0.5");
            
//             // Microservice communication
//             gsap.to(".microservice", {
//                 borderColor: "#06b6d4",
//                 duration: 2,
//                 repeat: -1,
//                 yoyo: true,
//                 stagger: 0.4,
//                 ease: "power2.inOut"
//             });
//         }
//     });

//     // Network connections
//     ScrollTrigger.create({
//         trigger: ".skills",
//         start: "top 10%",
//         onEnter: () => {
//             const networkTL = gsap.timeline();
            
//             networkTL.to(".network-connections", {
//                 opacity: 1,
//                 duration: 0.8,
//                 ease: "power2.out"
//             })
//             .to(".network-line", {
//                 strokeDashoffset: 0,
//                 duration: 2,
//                 stagger: 0.3,
//                 ease: "power2.out"
//             }, "-=0.5")
//             .to(".data-packet", {
//                 opacity: 1,
//                 scale: 1,
//                 duration: 0.5,
//                 stagger: 0.2,
//                 ease: "back.out(1.7)"
//             }, "-=1");
            
//             // Data packet movement
//             gsap.to(".data-packet", {
//                 motionPath: {
//                     path: ".network-line",
//                     autoRotate: true
//                 },
//                 duration: 4,
//                 repeat: -1,
//                 ease: "none",
//                 stagger: 1
//             });
//         }
//     });
// }

function initPortfolioEffects() {
    // Advanced project card animations
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

        // Enhanced hover effects
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
            
            // Continuous avatar glow
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

    // Show/hide based on scroll
    ScrollTrigger.create({
        start: "top -100",
        end: 99999,
        toggleClass: {className: "visible", targets: backToTopButton}
    });

    // Smooth scroll to top
    backToTopButton.addEventListener('click', () => {
        gsap.to(window, {
            scrollTo: {y: 0, autoKill: false},
            duration: 1.5,
            ease: "power2.inOut"
        });
    });

    // Button hover effect
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
    // This is handled in initBackendAnimations()
    console.log("Backend visualization initialized");
}

function initParticleSystem() {
    // Create floating particles
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
    
    // Animate particle
    gsap.to(particle, {
        y: -window.innerHeight,
        x: (Math.random() - 0.5) * 200,
        opacity: 0,
        duration: Math.random() * 10 + 5,
        ease: "none",
        onComplete: () => {
            particle.remove();
            createParticle(); // Create new particle
        }
    });
}

function initAdvancedInteractions() {
    // Cursor follower
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

    // Interactive elements
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

    // Parallax scrolling
    ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: self => {
            const progress = self.progress;
            
            // Move background elements
            gsap.to(".floating-shapes", {
                y: progress * -200,
                rotation: progress * 360,
                duration: 0.3,
                ease: "none"
            });
            
            // Three.js camera movement
            if (camera) {
                camera.position.y = progress * 100;
                camera.rotation.z = progress * 0.1;
            }
        }
    });
}

// Performance optimization
ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
});

// Refresh on resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});

// Preloader
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