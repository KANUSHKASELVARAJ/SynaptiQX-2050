/* ============================================================
   SynaptiQX 2050 — Main Application Controller
   Handles: Loader, Navigation, Scroll, Counters, Interactions,
            Magnetic buttons, Ripple effects, Mobile menu,
            Biometric modal, Course grid, GSAP animations
   ============================================================ */

(function () {
    'use strict';

    // ==================== LOADER SYSTEM ====================
    const Loader = {
        el: document.getElementById('loader-screen'),
        bar: document.getElementById('loader-bar'),
        text: document.getElementById('loader-text'),
        messages: [
            'Initializing neural systems...',
            'Loading quantum processors...',
            'Connecting AI models...',
            'Synchronizing holographic displays...',
            'Calibrating neural interfaces...',
            'System ready.'
        ],
        progress: 0,

        init() {
            let step = 0;
            const interval = setInterval(() => {
                step++;
                this.progress = Math.min(step * 18, 100);
                this.bar.style.width = this.progress + '%';
                const msgIndex = Math.min(Math.floor(step / 1.2), this.messages.length - 1);
                this.text.textContent = this.messages[msgIndex];

                if (this.progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => this.hide(), 400);
                }
            }, 250);
        },

        hide() {
            this.el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.el.style.opacity = '0';
            this.el.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.el.style.display = 'none';
                document.body.style.overflow = '';
                App.onReady();
            }, 600);
        }
    };

    // ==================== CURSOR GLOW ====================
    const CursorGlow = {
        el: document.getElementById('cursor-glow'),
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        active: false,

        init() {
            if (window.innerWidth < 1024) return;

            document.addEventListener('mousemove', (e) => {
                this.targetX = e.clientX;
                this.targetY = e.clientY;
                if (!this.active) {
                    this.active = true;
                    this.el.style.opacity = '1';
                }
            });

            document.addEventListener('mouseleave', () => {
                this.active = false;
                this.el.style.opacity = '0';
            });

            this.animate();
        },

        animate() {
            this.x += (this.targetX - this.x) * 0.08;
            this.y += (this.targetY - this.y) * 0.08;
            this.el.style.left = this.x + 'px';
            this.el.style.top = this.y + 'px';
            requestAnimationFrame(() => this.animate());
        }
    };

    // ==================== NAVIGATION ====================
    const Navigation = {
        nav: document.getElementById('main-nav'),
        links: document.querySelectorAll('.nav-link'),
        mobileLinks: document.querySelectorAll('.mobile-nav-link'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        mobileMenu: document.getElementById('mobile-menu'),
        isMenuOpen: false,
        sections: [],

        init() {
            this.sections = Array.from(document.querySelectorAll('section[id]'));

            // Scroll handler for nav background
            window.addEventListener('scroll', () => this.onScroll(), { passive: true });

            // Mobile menu toggle
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());

            // Close mobile menu on link click
            this.mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.isMenuOpen = false;
                    this.mobileMenu.classList.add('hidden');
                    this.updateMenuIcon();
                });
            });

            // Desktop link click
            this.links.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                });
            });

            this.onScroll();
        },

        onScroll() {
            const scrollY = window.scrollY;
            const navBar = this.nav.querySelector('.glass-nav');

            if (scrollY > 50) {
                navBar.classList.add('scrolled');
            } else {
                navBar.classList.remove('scrolled');
            }

            // Active section detection
            let current = '';
            this.sections.forEach(section => {
                const top = section.offsetTop - 200;
                if (scrollY >= top) {
                    current = section.id;
                }
            });

            this.links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });

            this.mobileLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        },

        toggleMobileMenu() {
            this.isMenuOpen = !this.isMenuOpen;
            this.mobileMenu.classList.toggle('hidden', !this.isMenuOpen);
            this.mobileMenuBtn.setAttribute('aria-expanded', this.isMenuOpen);
            this.updateMenuIcon();
        },

        updateMenuIcon() {
            const l1 = document.getElementById('menu-line-1');
            const l2 = document.getElementById('menu-line-2');
            const l3 = document.getElementById('menu-line-3');

            if (this.isMenuOpen) {
                l1.style.transform = 'translateY(7px) rotate(45deg)';
                l2.style.opacity = '0';
                l3.style.transform = 'translateY(-7px) rotate(-45deg)';
            } else {
                l1.style.transform = '';
                l2.style.opacity = '';
                l3.style.transform = '';
            }
        }
    };

    // ==================== MAGNETIC BUTTONS ====================
    const MagneticButtons = {
        init() {
            if (window.innerWidth < 1024) return;

            document.querySelectorAll('.magnetic-btn').forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                });
            });
        }
    };

    // ==================== RIPPLE EFFECT ====================
    const RippleEffect = {
        init() {
            document.querySelectorAll('.ripple-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const ripple = document.createElement('span');
                    ripple.classList.add('ripple-effect');
                    const size = Math.max(rect.width, rect.height);
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                    btn.appendChild(ripple);
                    ripple.addEventListener('animationend', () => ripple.remove());
                });
            });
        }
    };

    // ==================== HOVER TILT ====================
    const HoverTilt = {
        init() {
            if (window.innerWidth < 1024) return;

            document.querySelectorAll('.hover-tilt').forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    const tiltX = (y - 0.5) * 8;
                    const tiltY = (x - 0.5) * -8;
                    el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
                });

                el.addEventListener('mouseleave', () => {
                    el.style.transform = '';
                });
            });
        }
    };

    // ==================== ANIMATED COUNTERS ====================
    const Counters = {
        init() {
            const counters = document.querySelectorAll('.counter');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.counted) {
                        entry.target.dataset.counted = 'true';
                        this.animateCounter(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(c => observer.observe(c));
        },

        animateCounter(el) {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const duration = 2000;
            const start = performance.now();
            const isDecimal = target % 1 !== 0;

            const update = (timestamp) => {
                const progress = Math.min((timestamp - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                const current = target * eased;

                if (isDecimal) {
                    el.textContent = current.toFixed(1) + suffix;
                } else {
                    el.textContent = Math.floor(current).toLocaleString() + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    if (isDecimal) {
                        el.textContent = target.toFixed(1) + suffix;
                    } else {
                        el.textContent = Math.floor(target).toLocaleString() + suffix;
                    }
                }
            };

            requestAnimationFrame(update);
        }
    };

    // ==================== PROGRESS BARS ====================
    const ProgressBars = {
        init() {
            const bars = document.querySelectorAll('.progress-bar');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.animated) {
                        entry.target.dataset.animated = 'true';
                        const width = entry.target.dataset.width;
                        setTimeout(() => {
                            entry.target.style.width = width;
                        }, 200);
                    }
                });
            }, { threshold: 0.3 });

            bars.forEach(b => observer.observe(b));
        }
    };

    // ==================== EMOTION METERS ====================
    const EmotionMeters = {
        init() {
            const container = document.getElementById('emotion-meters');
            if (!container) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.animated) {
                        entry.target.dataset.animated = 'true';
                        const bars = entry.target.querySelectorAll('.emotion-bar');
                        bars.forEach((bar, i) => {
                            const value = bar.dataset.value;
                            const fill = bar.querySelector('.h-full');
                            setTimeout(() => {
                                fill.style.width = value + '%';
                            }, i * 150 + 300);
                        });
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(container);

            // Live updates every 5 seconds
            setInterval(() => this.fluctuate(), 5000);
        },

        fluctuate() {
            const bars = document.querySelectorAll('.emotion-bar');
            bars.forEach(bar => {
                const base = parseInt(bar.dataset.value);
                const variation = Math.floor(Math.random() * 6) - 3;
                const newVal = Math.max(40, Math.min(99, base + variation));
                const fill = bar.querySelector('.h-full');
                const label = bar.querySelector('.font-mono');
                fill.style.width = newVal + '%';
                label.textContent = newVal + '%';
            });
        }
    };

    // ==================== COURSE GRID ====================
    const CourseGrid = {
        courses: [
            { id: 1, title: 'Quantum Computing Mastery', category: 'quantum', icon: 'fas fa-atom', color: 'blue', level: 'Advanced', duration: '12 weeks', students: '14.2K', rating: 4.9, progress: 67, desc: 'Master quantum algorithms, qubit manipulation, and quantum error correction with hands-on holographic labs.' },
            { id: 2, title: 'Neural Network Architecture', category: 'ai', icon: 'fas fa-brain', color: 'purple', level: 'Expert', duration: '16 weeks', students: '23.8K', rating: 4.8, progress: 0, desc: 'Design and train next-gen neural networks using thought-based programming interfaces.' },
            { id: 3, title: 'Cognitive Neuroscience', category: 'neuro', icon: 'fas fa-head-side-virus', color: 'pink', level: 'Intermediate', duration: '10 weeks', students: '19.1K', rating: 4.7, progress: 45, desc: 'Explore the neural basis of cognition, memory formation, and brain-computer interfaces.' },
            { id: 4, title: 'Advanced Cyber Defense', category: 'cyber', icon: 'fas fa-shield-virus', color: 'green', level: 'Advanced', duration: '14 weeks', students: '11.4K', rating: 4.9, progress: 0, desc: 'Quantum-resistant encryption, neural intrusion detection, and AI-powered threat analysis.' },
            { id: 5, title: 'Holographic UI Systems', category: 'design', icon: 'fas fa-cube', color: 'orange', level: 'Intermediate', duration: '8 weeks', students: '16.7K', rating: 4.6, progress: 89, desc: 'Create multi-dimensional user interfaces for AR/VR/holographic display environments.' },
            { id: 6, title: 'Generative AI Studio', category: 'ai', icon: 'fas fa-wand-magic-sparkles', color: 'cyan', level: 'Expert', duration: '20 weeks', students: '31.2K', rating: 5.0, progress: 12, desc: 'Build next-generation generative models for art, music, code, and multi-modal content creation.' },
            { id: 7, title: 'Quantum Cryptography', category: 'quantum', icon: 'fas fa-lock', color: 'teal', level: 'Expert', duration: '18 weeks', students: '8.9K', rating: 4.8, progress: 0, desc: 'Implement quantum key distribution and post-quantum cryptographic protocols.' },
            { id: 8, title: 'Brain-Machine Interfaces', category: 'neuro', icon: 'fas fa-microchip', color: 'violet', level: 'Expert', duration: '22 weeks', students: '7.3K', rating: 4.9, progress: 0, desc: 'Design and implement direct neural communication channels between biological and digital systems.' },
            { id: 9, title: 'Spatial Computing Design', category: 'design', icon: 'fas fa-vr-cardboard', color: 'rose', level: 'Advanced', duration: '12 weeks', students: '20.5K', rating: 4.7, progress: 33, desc: 'Create immersive 3D experiences for spatial computing platforms and mixed reality environments.' },
        ],

        colorMap: {
            blue: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'rgba(59,130,246,0.1)' },
            purple: { bg: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'rgba(168,85,247,0.1)' },
            pink: { bg: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400', border: 'border-pink-500/20', glow: 'rgba(236,72,153,0.1)' },
            green: { bg: 'from-green-500/20 to-green-500/5', text: 'text-green-400', border: 'border-green-500/20', glow: 'rgba(34,197,94,0.1)' },
            orange: { bg: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'rgba(249,115,22,0.1)' },
            cyan: { bg: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'rgba(6,182,212,0.1)' },
            teal: { bg: 'from-teal-500/20 to-teal-500/5', text: 'text-teal-400', border: 'border-teal-500/20', glow: 'rgba(20,184,166,0.1)' },
            violet: { bg: 'from-violet-500/20 to-violet-500/5', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'rgba(139,92,246,0.1)' },
            rose: { bg: 'from-rose-500/20 to-rose-500/5', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'rgba(244,63,94,0.1)' },
        },

        currentFilter: 'all',

        init() {
            this.renderSkeletons();
            setTimeout(() => this.render(), 1200);
            this.bindFilters();
        },

        renderSkeletons() {
            const grid = document.getElementById('course-grid');
            let html = '';
            for (let i = 0; i < 6; i++) {
                html += `
                    <div class="skeleton-card">
                        <div class="skeleton skeleton-icon"></div>
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-text"></div>
                        <div class="skeleton skeleton-text-short"></div>
                        <div class="skeleton skeleton-bar"></div>
                    </div>`;
            }
            grid.innerHTML = html;
        },

        render() {
            const grid = document.getElementById('course-grid');
            const filtered = this.currentFilter === 'all'
                ? this.courses
                : this.courses.filter(c => c.category === this.currentFilter);

            let html = '';
            filtered.forEach((course, index) => {
                const cm = this.colorMap[course.color] || this.colorMap.blue;
                html += `
                    <div class="course-card" data-category="${course.category}" style="animation: fadeUp 0.6s ${index * 0.1}s ease-out both;">
                        <div class="card-glow" style="background: radial-gradient(ellipse at top, ${cm.glow}, transparent 70%);"></div>
                        <div class="card-header">
                            <div class="card-icon bg-gradient-to-br ${cm.bg} ${cm.text}">
                                <i class="${course.icon}"></i>
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-xs font-mono px-2 py-0.5 rounded bg-white/5 ${cm.text}">${course.level}</span>
                                <span class="text-xs text-white/30">${course.duration}</span>
                            </div>
                            <h3 class="text-lg font-bold text-white/90 leading-tight">${course.title}</h3>
                        </div>
                        <div class="card-body">
                            <p class="text-sm text-white/40 mb-4 leading-relaxed">${course.desc}</p>
                            ${course.progress > 0 ? `
                                <div class="mb-3">
                                    <div class="flex justify-between text-xs mb-1">
                                        <span class="text-white/40">Progress</span>
                                        <span class="text-white/60 font-mono">${course.progress}%</span>
                                    </div>
                                    <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div class="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full progress-bar" data-width="${course.progress}%"></div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="card-footer">
                            <div class="flex items-center gap-3 text-xs text-white/40">
                                <span><i class="fas fa-users mr-1"></i>${course.students}</span>
                                <span><i class="fas fa-star mr-1 text-yellow-500"></i>${course.rating}</span>
                            </div>
                            <button class="text-xs font-semibold ${cm.text} hover:text-white transition-colors flex items-center gap-1">
                                ${course.progress > 0 ? 'Continue' : 'Enroll'} <i class="fas fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>`;
            });

            grid.innerHTML = html;

            // Re-init progress bars for newly rendered cards
            setTimeout(() => ProgressBars.init(), 100);
        },

        bindFilters() {
            document.querySelectorAll('.course-filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.course-filter-btn').forEach(b => {
                        b.classList.remove('active');
                        b.setAttribute('aria-selected', 'false');
                    });
                    btn.classList.add('active');
                    btn.setAttribute('aria-selected', 'true');
                    this.currentFilter = btn.dataset.filter;
                    this.render();
                });
            });
        }
    };

    // ==================== BIOMETRIC MODAL ====================
    const BiometricModal = {
        modal: document.getElementById('biometric-modal'),
        content: document.getElementById('biometric-modal-content'),
        btn: document.getElementById('btn-biometric'),
        closeBtn: document.getElementById('close-biometric-modal'),
        scanner: document.getElementById('fingerprint-scanner'),
        scanLine: document.getElementById('scan-line'),
        scanProgress: document.getElementById('scan-progress'),
        scanStatus: document.getElementById('scan-status'),
        icon: document.getElementById('fingerprint-icon'),
        scanning: false,

        init() {
            this.btn.addEventListener('click', () => this.show());
            this.closeBtn.addEventListener('click', () => this.hide());
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.hide();
            });
            this.scanner.addEventListener('click', () => this.startScan());
        },

        show() {
            this.reset();
            this.modal.classList.remove('hidden');
            this.modal.classList.add('flex');
            requestAnimationFrame(() => {
                this.content.style.transform = 'scale(1)';
                this.content.style.opacity = '1';
            });
        },

        hide() {
            this.content.style.transform = 'scale(0.95)';
            this.content.style.opacity = '0';
            setTimeout(() => {
                this.modal.classList.add('hidden');
                this.modal.classList.remove('flex');
            }, 300);
        },

        reset() {
            this.scanning = false;
            this.scanProgress.style.width = '0%';
            this.scanStatus.textContent = 'Tap to scan';
            this.icon.style.color = '';
            this.scanLine.style.opacity = '0';
        },

        startScan() {
            if (this.scanning) return;
            this.scanning = true;
            this.scanStatus.textContent = 'Scanning neural patterns...';
            this.scanLine.style.opacity = '1';
            this.icon.style.color = 'var(--cyber-blue)';

            let progress = 0;
            const scanInterval = setInterval(() => {
                progress += Math.random() * 12 + 3;
                progress = Math.min(progress, 100);
                this.scanProgress.style.width = progress + '%';

                if (progress >= 100) {
                    clearInterval(scanInterval);
                    this.scanLine.style.opacity = '0';
                    this.scanStatus.textContent = 'Neural signature verified!';
                    this.scanStatus.style.color = 'var(--cyber-green)';
                    this.icon.style.color = 'var(--cyber-green)';
                    this.icon.className = 'fas fa-check-circle text-4xl';

                    // Animate success rings
                    const ring1 = document.getElementById('scan-ring-1');
                    const ring2 = document.getElementById('scan-ring-2');
                    ring1.style.borderColor = 'var(--cyber-green)';
                    ring2.style.borderColor = 'var(--cyber-green)';

                    setTimeout(() => {
                        this.hide();
                        // Reset icon
                        this.icon.className = 'fas fa-fingerprint text-4xl text-cyber-blue/60';
                        this.scanStatus.style.color = '';
                        ring1.style.borderColor = '';
                        ring2.style.borderColor = '';
                    }, 1500);
                }
            }, 120);
        }
    };

    // ==================== GSAP ANIMATIONS ====================
    const GSAPAnimations = {
        init() {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

            gsap.registerPlugin(ScrollTrigger);

            // Fade up animations
            gsap.utils.toArray('[data-animate="fade-up"]').forEach(el => {
                gsap.fromTo(el,
                    { y: 50, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 90%',
                            toggleActions: 'play none none none',
                            onEnter: () => el.style.visibility = 'visible'
                        },
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out'
                    }
                );
            });

            // Scale in animations
            gsap.utils.toArray('[data-animate="scale-in"]').forEach(el => {
                gsap.fromTo(el,
                    { scale: 0.9, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 90%',
                            toggleActions: 'play none none none',
                            onEnter: () => el.style.visibility = 'visible'
                        },
                        scale: 1,
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power3.out'
                    }
                );
            });

            // Stagger up animations
            gsap.utils.toArray('[data-animate="stagger-up"]').forEach(container => {
                const children = container.children;
                gsap.fromTo(children,
                    { y: 40, opacity: 0 },
                    {
                        scrollTrigger: {
                            trigger: container,
                            start: 'top 90%',
                            toggleActions: 'play none none none',
                            onEnter: () => {
                                Array.from(children).forEach(c => c.style.visibility = 'visible');
                            }
                        },
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: 'power3.out'
                    }
                );
            });

            // Hero section — handled by CSS animations now (no GSAP dependency)
            // GSAP only used for scroll-triggered sections below the fold
        }
    };

    // ==================== MASTER APP CONTROLLER ====================
    const App = {
        init() {
            document.body.style.overflow = 'hidden';
            Loader.init();
        },

        onReady() {
            CursorGlow.init();
            Navigation.init();
            MagneticButtons.init();
            RippleEffect.init();
            HoverTilt.init();
            Counters.init();
            ProgressBars.init();
            EmotionMeters.init();
            CourseGrid.init();
            BiometricModal.init();

            // Wait for GSAP to be fully available before initializing scroll animations
            const waitForGSAP = () => {
                if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                    GSAPAnimations.init();
                } else {
                    setTimeout(waitForGSAP, 100);
                }
            };
            waitForGSAP();

            // Safety fallback: if GSAP animations haven't triggered after 3s, force everything visible
            setTimeout(() => {
                document.querySelectorAll('[data-animate]').forEach(el => {
                    if (getComputedStyle(el).opacity === '0') {
                        el.style.opacity = '1';
                        el.style.transform = 'none';
                        el.style.visibility = 'visible';
                    }
                    Array.from(el.children).forEach(child => {
                        if (getComputedStyle(child).opacity === '0') {
                            child.style.opacity = '1';
                            child.style.transform = 'none';
                            child.style.visibility = 'visible';
                        }
                    });
                });
            }, 3000);
        }
    };

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

})();
