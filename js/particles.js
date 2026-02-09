/* ============================================================
   SynaptiQX 2050 — Particle Background System
   Handles: Canvas-based particle network with mouse interaction,
            ambient floating particles, connection lines
   ============================================================ */

(function () {
    'use strict';

    const ParticleSystem = {
        canvas: null,
        ctx: null,
        particles: [],
        width: 0,
        height: 0,
        mouse: { x: null, y: null, radius: 150 },
        animId: null,
        dpr: 1,
        particleCount: 80,
        connectionDistance: 120,

        init() {
            this.canvas = document.getElementById('particle-canvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.dpr = Math.min(window.devicePixelRatio, 2);

            // Reduce particles on mobile
            if (window.innerWidth < 768) {
                this.particleCount = 30;
                this.connectionDistance = 80;
            } else if (window.innerWidth < 1200) {
                this.particleCount = 50;
                this.connectionDistance = 100;
            }

            this.resize();
            this.createParticles();

            window.addEventListener('resize', () => {
                this.resize();
                this.createParticles();
            });

            document.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            document.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });

            this.animate();
        },

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.scale(this.dpr, this.dpr);
        },

        createParticles() {
            this.particles = [];

            for (let i = 0; i < this.particleCount; i++) {
                const colorChoice = Math.random();
                let color;
                if (colorChoice < 0.4) color = { r: 0, g: 240, b: 255 };       // cyber-blue
                else if (colorChoice < 0.7) color = { r: 176, g: 0, b: 255 };   // cyber-purple
                else if (colorChoice < 0.85) color = { r: 0, g: 255, b: 136 };  // cyber-green
                else color = { r: 255, g: 0, b: 110 };                           // cyber-pink

                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: 1 + Math.random() * 1.5,
                    color: color,
                    opacity: 0.2 + Math.random() * 0.3,
                    pulseSpeed: 0.01 + Math.random() * 0.02,
                    pulseOffset: Math.random() * Math.PI * 2,
                });
            }
        },

        animate() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            const time = Date.now() * 0.001;

            // Update and draw particles
            this.particles.forEach((p, i) => {
                // Movement
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > this.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.height) p.vy *= -1;

                // Keep in bounds
                p.x = Math.max(0, Math.min(this.width, p.x));
                p.y = Math.max(0, Math.min(this.height, p.y));

                // Mouse repulsion
                if (this.mouse.x !== null) {
                    const dx = p.x - this.mouse.x;
                    const dy = p.y - this.mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.mouse.radius) {
                        const force = (this.mouse.radius - dist) / this.mouse.radius;
                        p.x += dx * force * 0.02;
                        p.y += dy * force * 0.02;
                    }
                }

                // Pulse opacity
                const pulse = Math.sin(time * p.pulseSpeed * 10 + p.pulseOffset) * 0.15;
                const currentOpacity = p.opacity + pulse;

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentOpacity})`;
                this.ctx.fill();

                // Draw connections
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p2 = this.particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.connectionDistance) {
                        const alpha = (1 - dist / this.connectionDistance) * 0.08;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            });

            // Mouse attraction drawing
            if (this.mouse.x !== null) {
                this.particles.forEach(p => {
                    const dx = p.x - this.mouse.x;
                    const dy = p.y - this.mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.mouse.radius * 1.5) {
                        const alpha = (1 - dist / (this.mouse.radius * 1.5)) * 0.06;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(this.mouse.x, this.mouse.y);
                        this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        this.ctx.lineWidth = 0.3;
                        this.ctx.stroke();
                    }
                });
            }

            this.animId = requestAnimationFrame(() => this.animate());
        },

        destroy() {
            if (this.animId) cancelAnimationFrame(this.animId);
        }
    };

    // ==================== WAVE SHADER CANVAS ====================
    // Additional ambient wave animation layered at bottom of page
    const WaveShader = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 60,
        time: 0,

        init() {
            // Create wave canvas element and inject before footer
            const footer = document.querySelector('footer');
            if (!footer) return;

            this.canvas = document.createElement('canvas');
            this.canvas.style.cssText = 'width: 100%; height: 60px; display: block; opacity: 0.3;';
            this.canvas.setAttribute('aria-hidden', 'true');
            footer.parentNode.insertBefore(this.canvas, footer);

            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        },

        resize() {
            const dpr = Math.min(window.devicePixelRatio, 2);
            this.width = this.canvas.parentElement?.clientWidth || window.innerWidth;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.scale(dpr, dpr);
        },

        animate() {
            this.time += 0.02;
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw multiple wave layers
            this.drawWave(0.005, 20, 'rgba(0, 240, 255, 0.15)', 0);
            this.drawWave(0.008, 15, 'rgba(176, 0, 255, 0.1)', 1);
            this.drawWave(0.003, 25, 'rgba(0, 255, 136, 0.08)', 2);

            requestAnimationFrame(() => this.animate());
        },

        drawWave(frequency, amplitude, color, offset) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height / 2);

            for (let x = 0; x <= this.width; x += 2) {
                const y = this.height / 2 +
                    Math.sin(x * frequency + this.time + offset) * amplitude +
                    Math.sin(x * frequency * 1.5 + this.time * 1.3 + offset) * (amplitude * 0.4);
                this.ctx.lineTo(x, y);
            }

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();
        }
    };

    // ==================== INITIALIZATION ====================
    function initParticles() {
        ParticleSystem.init();

        // Wave shader is a nice-to-have, init after main content
        setTimeout(() => WaveShader.init(), 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        initParticles();
    }
})();
