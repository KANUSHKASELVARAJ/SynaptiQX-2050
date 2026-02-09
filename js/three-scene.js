/* ============================================================
   SynaptiQX 2050 — Three.js Neural Scene
   Handles: Hero brain canvas, VR classroom canvas,
            background neural network visualization
   ============================================================ */

(function () {
    'use strict';

    // ==================== HERO BRAIN VISUALIZATION ====================
    const HeroBrain = {
        canvas: null,
        ctx: null,
        nodes: [],
        connections: [],
        width: 0,
        height: 0,
        animId: null,
        mouse: { x: 0.5, y: 0.5 },
        time: 0,

        init() {
            this.canvas = document.getElementById('hero-brain-canvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.createNodes();
            this.connectNodes();

            window.addEventListener('resize', () => this.resize());
            this.canvas.closest('.relative')?.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = (e.clientX - rect.left) / rect.width;
                this.mouse.y = (e.clientY - rect.top) / rect.height;
            });

            this.animate();
        },

        resize() {
            const parent = this.canvas.parentElement;
            const dpr = Math.min(window.devicePixelRatio, 2);
            this.width = parent.clientWidth;
            this.height = parent.clientHeight;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.scale(dpr, dpr);
        },

        createNodes() {
            this.nodes = [];
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const radius = Math.min(this.width, this.height) * 0.38;
            const nodeCount = 60;

            for (let i = 0; i < nodeCount; i++) {
                // Brain-shaped distribution
                const angle = (i / nodeCount) * Math.PI * 2;
                const r = radius * (0.5 + Math.random() * 0.5);
                const brainShape = 1 + 0.15 * Math.sin(angle * 2);

                this.nodes.push({
                    x: centerX + Math.cos(angle) * r * brainShape,
                    y: centerY + Math.sin(angle) * r * brainShape * 0.85,
                    baseX: centerX + Math.cos(angle) * r * brainShape,
                    baseY: centerY + Math.sin(angle) * r * brainShape * 0.85,
                    radius: 1.5 + Math.random() * 2.5,
                    pulseSpeed: 0.02 + Math.random() * 0.03,
                    pulseOffset: Math.random() * Math.PI * 2,
                    color: Math.random() > 0.5 ? '#00f0ff' : (Math.random() > 0.5 ? '#b000ff' : '#00ff88'),
                    active: false,
                    activationTime: 0,
                });
            }

            // Add inner cluster
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = radius * (0.1 + Math.random() * 0.3);
                this.nodes.push({
                    x: centerX + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r,
                    baseX: centerX + Math.cos(angle) * r,
                    baseY: centerY + Math.sin(angle) * r,
                    radius: 1 + Math.random() * 2,
                    pulseSpeed: 0.015 + Math.random() * 0.02,
                    pulseOffset: Math.random() * Math.PI * 2,
                    color: '#00f0ff',
                    active: false,
                    activationTime: 0,
                });
            }
        },

        connectNodes() {
            this.connections = [];
            const maxDist = Math.min(this.width, this.height) * 0.25;

            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const dx = this.nodes[i].x - this.nodes[j].x;
                    const dy = this.nodes[i].y - this.nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        this.connections.push({
                            from: i,
                            to: j,
                            dist: dist,
                            maxDist: maxDist,
                            signal: 0,
                            signalSpeed: 0.01 + Math.random() * 0.02,
                        });
                    }
                }
            }
        },

        animate() {
            this.time += 0.016;
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Randomly activate signals
            if (Math.random() < 0.03) {
                const randomConn = this.connections[Math.floor(Math.random() * this.connections.length)];
                if (randomConn) randomConn.signal = 0.01;
            }

            // Draw connections
            this.connections.forEach(conn => {
                const from = this.nodes[conn.from];
                const to = this.nodes[conn.to];
                const alpha = (1 - conn.dist / conn.maxDist) * 0.15;

                this.ctx.beginPath();
                this.ctx.moveTo(from.x, from.y);
                this.ctx.lineTo(to.x, to.y);
                this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                this.ctx.lineWidth = 0.5;
                this.ctx.stroke();

                // Signal animation
                if (conn.signal > 0 && conn.signal < 1) {
                    conn.signal += conn.signalSpeed;
                    const sx = from.x + (to.x - from.x) * conn.signal;
                    const sy = from.y + (to.y - from.y) * conn.signal;

                    this.ctx.beginPath();
                    this.ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#00f0ff';
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowColor = '#00f0ff';
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;

                    if (conn.signal >= 1) {
                        conn.signal = 0;
                        this.nodes[conn.to].active = true;
                        this.nodes[conn.to].activationTime = this.time;
                    }
                }
            });

            // Draw nodes
            this.nodes.forEach(node => {
                // Mouse influence
                const mx = this.mouse.x * this.width;
                const my = this.mouse.y * this.height;
                const dx = mx - node.baseX;
                const dy = my - node.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const influence = Math.max(0, 1 - dist / 150);

                node.x = node.baseX + dx * influence * 0.1;
                node.y = node.baseY + dy * influence * 0.1;

                // Pulse
                const pulse = Math.sin(this.time * node.pulseSpeed * 60 + node.pulseOffset) * 0.3 + 0.7;
                const r = node.radius * pulse;

                // Activation glow
                let glow = 0;
                if (node.active) {
                    glow = 1 - (this.time - node.activationTime) * 2;
                    if (glow <= 0) {
                        node.active = false;
                        glow = 0;
                    }
                }

                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, r + glow * 3, 0, Math.PI * 2);
                this.ctx.fillStyle = node.color;
                this.ctx.globalAlpha = 0.4 + pulse * 0.3 + glow * 0.3;

                if (glow > 0) {
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = node.color;
                }

                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.globalAlpha = 1;
            });

            this.animId = requestAnimationFrame(() => this.animate());
        },

        destroy() {
            if (this.animId) cancelAnimationFrame(this.animId);
        }
    };

    // ==================== VR CLASSROOM CANVAS ====================
    const VRClassroom = {
        canvas: null,
        ctx: null,
        width: 0,
        height: 0,
        animId: null,
        time: 0,
        objects: [],
        spawnedObjects: [],
        environment: 'classroom',
        mouse: { x: 0.5, y: 0.5, rawX: 0, rawY: 0, down: false, dragObj: null },
        camera: { zoom: 1, orbitAngle: 0, autoOrbit: false },
        showGrid: true,
        showParticles: true,
        showScanlines: false,
        paused: false,
        recording: false,
        recordStart: 0,
        fps: 60,
        lastFrameTime: 0,
        frameCount: 0,
        fpsInterval: 0,
        sessionTime: 0,
        students: [],
        dataStreams: [],
        envTransition: 0,
        envColors: {
            classroom: { bg1: 'rgba(15, 15, 40, 0.8)', bg2: 'rgba(5, 5, 20, 0.95)', grid: 'rgba(0, 240, 255, 0.08)', accent: '#00f0ff' },
            space: { bg1: 'rgba(5, 0, 30, 0.85)', bg2: 'rgba(0, 0, 10, 0.95)', grid: 'rgba(100, 100, 255, 0.06)', accent: '#8080ff' },
            ocean: { bg1: 'rgba(0, 20, 40, 0.8)', bg2: 'rgba(0, 10, 25, 0.95)', grid: 'rgba(0, 180, 200, 0.07)', accent: '#00b4c8' },
            molecular: { bg1: 'rgba(10, 25, 10, 0.8)', bg2: 'rgba(5, 15, 5, 0.95)', grid: 'rgba(0, 255, 136, 0.06)', accent: '#00ff88' }
        },

        init() {
            this.canvas = document.getElementById('vr-canvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.createScene();
            this.createStudents();
            this.createDataStreams();
            this.bindControls();

            window.addEventListener('resize', () => this.resize());

            // Mouse / touch tracking
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.rawX = e.clientX - rect.left;
                this.mouse.rawY = e.clientY - rect.top;
                this.mouse.x = this.mouse.rawX / this.width;
                this.mouse.y = this.mouse.rawY / this.height;
                // Update mouse position display
                const posEl = document.getElementById('vr-mouse-pos');
                if (posEl) posEl.textContent = `${Math.round(this.mouse.rawX)}, ${Math.round(this.mouse.rawY)}`;
                // Drag spawned object
                if (this.mouse.down && this.mouse.dragObj) {
                    this.mouse.dragObj.x = this.mouse.rawX;
                    this.mouse.dragObj.y = this.mouse.rawY;
                }
            });

            this.canvas.addEventListener('mousedown', (e) => {
                this.mouse.down = true;
                // Check if clicking on a spawned object
                const rx = this.mouse.rawX, ry = this.mouse.rawY;
                for (let i = this.spawnedObjects.length - 1; i >= 0; i--) {
                    const o = this.spawnedObjects[i];
                    const floatY = Math.sin(this.time * o.floatSpeed + o.floatOffset) * 10;
                    const dx = rx - o.x, dy = ry - (o.y + floatY);
                    if (Math.sqrt(dx * dx + dy * dy) < o.size) {
                        this.mouse.dragObj = o;
                        break;
                    }
                }
            });

            this.canvas.addEventListener('mouseup', () => {
                this.mouse.down = false;
                this.mouse.dragObj = null;
            });

            this.canvas.addEventListener('mouseleave', () => {
                this.mouse.down = false;
                this.mouse.dragObj = null;
            });

            // Click to select object — pulse highlight
            this.canvas.addEventListener('click', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
                [...this.objects, ...this.spawnedObjects].forEach(o => {
                    const floatY = Math.sin(this.time * o.floatSpeed + o.floatOffset) * 10;
                    const dx = cx - o.x, dy = cy - (o.y + floatY);
                    if (Math.sqrt(dx * dx + dy * dy) < o.size) {
                        o.selected = true;
                        o.selectTime = this.time;
                    }
                });
            });

            // Intersection observer for performance
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) this.startAnimation();
                    else this.stopAnimation();
                });
            }, { threshold: 0.1 });
            observer.observe(this.canvas);
        },

        resize() {
            const parent = this.canvas.parentElement;
            const dpr = Math.min(window.devicePixelRatio, 2);
            this.width = parent.clientWidth;
            this.height = parent.clientHeight;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
            this.ctx.scale(dpr, dpr);
        },

        createScene() {
            // Floating holographic objects
            this.objects = [];
            const objectTypes = ['cube', 'sphere', 'pyramid', 'ring', 'helix', 'torus', 'star', 'dna'];
            for (let i = 0; i < 10; i++) {
                this.objects.push(this.makeObject(
                    objectTypes[i % objectTypes.length],
                    this.width * 0.15 + Math.random() * this.width * 0.7,
                    this.height * 0.15 + Math.random() * this.height * 0.55
                ));
            }

            // Particles
            this.particles = [];
            for (let i = 0; i < 80; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: Math.random() * 2.5,
                    speed: 0.15 + Math.random() * 0.5,
                    drift: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.4 + 0.15,
                    color: ['#00f0ff', '#b000ff', '#00ff88', '#ff006e', '#ffd700'][Math.floor(Math.random() * 5)],
                    twinkle: Math.random() * Math.PI * 2
                });
            }

            // Nebula clouds for space environment
            this.nebulae = [];
            for (let i = 0; i < 5; i++) {
                this.nebulae.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: 60 + Math.random() * 140,
                    color: ['rgba(176, 0, 255, 0.03)', 'rgba(0, 240, 255, 0.03)', 'rgba(255, 0, 110, 0.02)', 'rgba(0, 255, 136, 0.02)'][Math.floor(Math.random() * 4)],
                    drift: (Math.random() - 0.5) * 0.2
                });
            }
        },

        makeObject(type, x, y) {
            return {
                type,
                x, y,
                size: 22 + Math.random() * 38,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: 0.005 + Math.random() * 0.02,
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: 0.5 + Math.random() * 1,
                color: ['#00f0ff', '#b000ff', '#00ff88', '#ff006e', '#ffd700'][Math.floor(Math.random() * 5)],
                selected: false,
                selectTime: 0,
                label: type.charAt(0).toUpperCase() + type.slice(1)
            };
        },

        createStudents() {
            // AI student avatars sitting around
            this.students = [];
            const names = ['AX-7', 'QZ-3', 'NR-9', 'LM-2', 'PK-5', 'VR-1'];
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + Math.PI / 4;
                this.students.push({
                    x: this.width * 0.5 + Math.cos(angle) * this.width * 0.32,
                    y: this.height * 0.75 + Math.sin(angle) * this.height * 0.08,
                    name: names[i],
                    headBob: Math.random() * Math.PI * 2,
                    bobSpeed: 0.8 + Math.random() * 0.5,
                    color: ['#00f0ff', '#b000ff', '#00ff88', '#ff006e', '#ffd700', '#ff8800'][i],
                    active: Math.random() > 0.3,
                    focusLine: Math.random() > 0.5
                });
            }
        },

        createDataStreams() {
            // Flowing data stream lines
            this.dataStreams = [];
            for (let i = 0; i < 12; i++) {
                this.dataStreams.push({
                    startX: Math.random() * this.width,
                    y: this.height * 0.1 + Math.random() * this.height * 0.3,
                    length: 40 + Math.random() * 120,
                    speed: 1 + Math.random() * 3,
                    offset: Math.random() * this.width,
                    color: ['#00f0ff', '#b000ff', '#00ff88'][Math.floor(Math.random() * 3)],
                    opacity: 0.1 + Math.random() * 0.15
                });
            }
        },

        bindControls() {
            // Environment switcher
            document.querySelectorAll('.vr-env-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.vr-env-btn').forEach(b => {
                        b.classList.remove('active');
                        b.querySelector('span').classList.remove('text-white/80');
                        b.querySelector('span').classList.add('text-white/60');
                        b.classList.remove('border-cyber-pink/30', 'border-cyber-blue/30', 'border-cyan-400/30', 'border-cyber-green/30');
                        b.classList.add('border-white/10');
                    });
                    btn.classList.add('active');
                    btn.querySelector('span').classList.remove('text-white/60');
                    btn.querySelector('span').classList.add('text-white/80');
                    const env = btn.dataset.env;
                    const borderMap = { classroom: 'border-cyber-pink/30', space: 'border-cyber-blue/30', ocean: 'border-cyan-400/30', molecular: 'border-cyber-green/30' };
                    btn.classList.remove('border-white/10');
                    btn.classList.add(borderMap[env] || 'border-cyber-pink/30');
                    this.switchEnvironment(env);
                });
            });

            // Object spawner
            document.querySelectorAll('.vr-spawn-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const shape = btn.dataset.shape;
                    const obj = this.makeObject(shape,
                        this.width * 0.3 + Math.random() * this.width * 0.4,
                        this.height * 0.2 + Math.random() * this.height * 0.4
                    );
                    obj.spawnTime = this.time;
                    obj.spawnScale = 0;
                    this.spawnedObjects.push(obj);
                    this.updateStats();
                });
            });

            // Clear spawned
            const clearBtn = document.getElementById('vr-clear-objects');
            if (clearBtn) clearBtn.addEventListener('click', () => {
                this.spawnedObjects = [];
                this.updateStats();
            });

            // Auto orbit
            const orbitBtn = document.getElementById('vr-orbit-toggle');
            if (orbitBtn) orbitBtn.addEventListener('click', () => {
                this.camera.autoOrbit = !this.camera.autoOrbit;
                orbitBtn.classList.toggle('bg-cyber-blue/10', this.camera.autoOrbit);
                orbitBtn.querySelector('i').classList.toggle('text-cyber-blue/60', this.camera.autoOrbit);
            });

            // Zoom
            const zoomIn = document.getElementById('vr-zoom-in');
            const zoomOut = document.getElementById('vr-zoom-out');
            if (zoomIn) zoomIn.addEventListener('click', () => { this.camera.zoom = Math.min(2, this.camera.zoom + 0.15); });
            if (zoomOut) zoomOut.addEventListener('click', () => { this.camera.zoom = Math.max(0.5, this.camera.zoom - 0.15); });

            // Grid toggle
            const gridBtn = document.getElementById('vr-grid-toggle');
            if (gridBtn) gridBtn.addEventListener('click', () => {
                this.showGrid = !this.showGrid;
                gridBtn.classList.toggle('bg-cyber-blue/10', this.showGrid);
                gridBtn.querySelector('i').classList.toggle('text-cyber-blue/60', this.showGrid);
            });

            // Particles toggle
            const partBtn = document.getElementById('vr-particles-toggle');
            if (partBtn) partBtn.addEventListener('click', () => {
                this.showParticles = !this.showParticles;
                partBtn.classList.toggle('bg-cyber-green/10', this.showParticles);
                partBtn.querySelector('i').classList.toggle('text-cyber-green/60', this.showParticles);
            });

            // Scanlines toggle
            const scanBtn = document.getElementById('vr-scanlines-toggle');
            if (scanBtn) scanBtn.addEventListener('click', () => {
                this.showScanlines = !this.showScanlines;
                scanBtn.classList.toggle('bg-cyber-orange/10', this.showScanlines);
                scanBtn.querySelector('i').classList.toggle('text-cyber-orange/60', this.showScanlines);
            });

            // Play / Pause
            const playBtn = document.getElementById('vr-play-pause');
            if (playBtn) playBtn.addEventListener('click', () => {
                this.paused = !this.paused;
                playBtn.querySelector('i').className = this.paused ? 'fas fa-play text-xs' : 'fas fa-pause text-xs';
            });

            // Screenshot
            const ssBtn = document.getElementById('vr-screenshot');
            if (ssBtn) ssBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `vr-classroom-${Date.now()}.png`;
                link.href = this.canvas.toDataURL('image/png');
                link.click();
            });

            // Record toggle
            const recBtn = document.getElementById('vr-record');
            const recInd = document.getElementById('vr-recording-indicator');
            if (recBtn) recBtn.addEventListener('click', () => {
                this.recording = !this.recording;
                if (this.recording) {
                    this.recordStart = Date.now();
                    recBtn.classList.add('border-red-400/40');
                    recBtn.querySelector('i').classList.add('text-red-400');
                    if (recInd) recInd.classList.remove('hidden');
                    if (recInd) recInd.classList.add('flex');
                } else {
                    recBtn.classList.remove('border-red-400/40');
                    recBtn.querySelector('i').classList.remove('text-red-400');
                    if (recInd) recInd.classList.add('hidden');
                    if (recInd) recInd.classList.remove('flex');
                }
            });

            // Fullscreen
            const fsBtn = document.getElementById('vr-fullscreen');
            if (fsBtn) fsBtn.addEventListener('click', () => {
                const vp = document.getElementById('vr-viewport');
                if (vp) {
                    if (!document.fullscreenElement) vp.requestFullscreen?.();
                    else document.exitFullscreen?.();
                }
            });
        },

        switchEnvironment(env) {
            this.environment = env;
            this.envTransition = 1;
            const nameEl = document.getElementById('vr-env-name');
            const iconEl = document.getElementById('vr-env-icon');
            const map = {
                classroom: { name: 'NEURAL CLASSROOM', icon: 'fas fa-chalkboard-teacher text-cyber-pink' },
                space: { name: 'SPACE STATION LAB', icon: 'fas fa-rocket text-cyber-blue' },
                ocean: { name: 'DEEP OCEAN LAB', icon: 'fas fa-water text-cyan-400' },
                molecular: { name: 'MOLECULAR LAB', icon: 'fas fa-atom text-cyber-green' }
            };
            const info = map[env] || map.classroom;
            if (nameEl) nameEl.textContent = info.name;
            if (iconEl) iconEl.className = info.icon + ' text-sm';
        },

        updateStats() {
            const total = this.objects.length + this.spawnedObjects.length;
            const el = document.getElementById('vr-obj-count');
            if (el) el.textContent = total;
            const pEl = document.getElementById('vr-particle-count');
            if (pEl) pEl.textContent = this.showParticles ? this.particles.length : 0;
        },

        startAnimation() {
            if (this.animId) return;
            this.lastFrameTime = performance.now();
            this.sessionTime = 0;
            this.animate();
        },

        stopAnimation() {
            if (this.animId) {
                cancelAnimationFrame(this.animId);
                this.animId = null;
            }
        },

        animate() {
            const now = performance.now();
            const delta = (now - this.lastFrameTime) / 1000;
            this.lastFrameTime = now;

            // FPS calculation
            this.frameCount++;
            this.fpsInterval += delta;
            if (this.fpsInterval >= 0.5) {
                this.fps = Math.round(this.frameCount / this.fpsInterval);
                this.frameCount = 0;
                this.fpsInterval = 0;
                const fpsEl = document.getElementById('vr-fps');
                if (fpsEl) fpsEl.textContent = this.fps;
                // Simulated GPU load
                const gpuEl = document.getElementById('vr-gpu');
                if (gpuEl) gpuEl.textContent = Math.min(95, 20 + (this.objects.length + this.spawnedObjects.length) * 3 + (this.showParticles ? 15 : 0)) + '%';
            }

            if (!this.paused) {
                this.time += delta;
                this.sessionTime += delta;
            }

            // Env transition
            if (this.envTransition > 0) this.envTransition = Math.max(0, this.envTransition - delta * 2);

            this.ctx.clearRect(0, 0, this.width, this.height);

            const ec = this.envColors[this.environment];

            // Background gradient
            const bgGrad = this.ctx.createRadialGradient(
                this.width / 2, this.height / 2, 0,
                this.width / 2, this.height / 2, this.width * 0.7
            );
            bgGrad.addColorStop(0, ec.bg1);
            bgGrad.addColorStop(1, ec.bg2);
            this.ctx.fillStyle = bgGrad;
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Environment-specific BG elements
            this.drawEnvironmentBG();

            // Transition flash
            if (this.envTransition > 0) {
                this.ctx.fillStyle = `rgba(255,255,255,${this.envTransition * 0.15})`;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            // Apply camera zoom
            this.ctx.save();
            if (this.camera.zoom !== 1) {
                this.ctx.translate(this.width / 2, this.height / 2);
                this.ctx.scale(this.camera.zoom, this.camera.zoom);
                this.ctx.translate(-this.width / 2, -this.height / 2);
            }
            if (this.camera.autoOrbit) {
                this.camera.orbitAngle += delta * 0.3;
                const ox = Math.sin(this.camera.orbitAngle) * 20;
                this.ctx.translate(ox, 0);
            }

            // Grid
            if (this.showGrid) this.drawPerspectiveGrid();

            // Data streams
            this.drawDataStreams();

            // Floating objects
            this.objects.forEach(obj => {
                if (!this.paused) obj.rotation += obj.rotSpeed;
                const floatY = Math.sin(this.time * obj.floatSpeed + obj.floatOffset) * 10;
                this.drawHoloObject(obj, floatY);
            });

            // Spawned objects
            this.spawnedObjects.forEach(obj => {
                if (!this.paused) obj.rotation += obj.rotSpeed;
                // Spawn scale-in animation
                if (obj.spawnScale < 1) {
                    obj.spawnScale = Math.min(1, obj.spawnScale + delta * 3);
                }
                const floatY = Math.sin(this.time * obj.floatSpeed + obj.floatOffset) * 10;
                this.ctx.save();
                const sc = obj.spawnScale;
                this.ctx.translate(obj.x, obj.y + floatY);
                this.ctx.scale(sc, sc);
                this.ctx.translate(-obj.x, -(obj.y + floatY));
                this.drawHoloObject(obj, floatY);
                this.ctx.restore();
            });

            // Students
            this.drawStudents();

            // Particles
            if (this.showParticles) this.drawParticles();

            this.ctx.restore(); // end camera transform

            // HUD overlay (not affected by camera)
            this.drawHUD();

            // Scanlines
            if (this.showScanlines) this.drawScanlines();

            // Update timeline
            this.updateTimeline();

            // Update recording timer
            if (this.recording) {
                const recTimer = document.getElementById('vr-rec-timer');
                if (recTimer) {
                    const elapsed = Math.floor((Date.now() - this.recordStart) / 1000);
                    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
                    const ss = String(elapsed % 60).padStart(2, '0');
                    recTimer.textContent = `${mm}:${ss}`;
                }
            }

            this.animId = requestAnimationFrame(() => this.animate());
        },

        drawEnvironmentBG() {
            const env = this.environment;
            if (env === 'space') {
                // Stars
                this.ctx.fillStyle = '#fff';
                for (let i = 0; i < 60; i++) {
                    const sx = (Math.sin(i * 127.1 + 311.7) * 0.5 + 0.5) * this.width;
                    const sy = (Math.sin(i * 269.5 + 183.3) * 0.5 + 0.5) * this.height;
                    const twinkle = Math.sin(this.time * 2 + i) * 0.3 + 0.7;
                    this.ctx.globalAlpha = twinkle * 0.6;
                    this.ctx.beginPath();
                    this.ctx.arc(sx, sy, 0.5 + Math.sin(i) * 0.5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                this.ctx.globalAlpha = 1;
                // Nebula clouds
                this.nebulae.forEach(n => {
                    n.x += n.drift;
                    if (n.x > this.width + n.radius) n.x = -n.radius;
                    if (n.x < -n.radius) n.x = this.width + n.radius;
                    const grad = this.ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
                    grad.addColorStop(0, n.color);
                    grad.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = grad;
                    this.ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
                });
            } else if (env === 'ocean') {
                // Caustic light rays
                for (let i = 0; i < 8; i++) {
                    const x = this.width * (0.1 + (i / 8) * 0.8) + Math.sin(this.time * 0.3 + i * 2) * 30;
                    const grad = this.ctx.createLinearGradient(x, 0, x + 20, this.height);
                    grad.addColorStop(0, 'rgba(0, 180, 200, 0.04)');
                    grad.addColorStop(0.5, 'rgba(0, 180, 200, 0.01)');
                    grad.addColorStop(1, 'transparent');
                    this.ctx.fillStyle = grad;
                    this.ctx.fillRect(x - 15, 0, 30, this.height);
                }
                // Bubbles
                for (let i = 0; i < 15; i++) {
                    const bx = (Math.sin(i * 73.1 + 127.7) * 0.5 + 0.5) * this.width;
                    const by = ((this.time * 0.05 * (1 + i * 0.1) + Math.sin(i * 45.3) * 0.5 + 0.5) % 1) * this.height;
                    this.ctx.beginPath();
                    this.ctx.arc(bx, this.height - by, 2 + (i % 4), 0, Math.PI * 2);
                    this.ctx.strokeStyle = 'rgba(0, 200, 220, 0.15)';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            } else if (env === 'molecular') {
                // Molecular bonds background
                const bondCount = 20;
                this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < bondCount; i++) {
                    const ax = (Math.sin(i * 57.3 + 91.1) * 0.5 + 0.5) * this.width;
                    const ay = (Math.cos(i * 43.7 + 127.3) * 0.5 + 0.5) * this.height;
                    const bx = ax + Math.cos(this.time * 0.5 + i) * 60;
                    const by = ay + Math.sin(this.time * 0.5 + i) * 60;
                    this.ctx.beginPath();
                    this.ctx.moveTo(ax, ay);
                    this.ctx.lineTo(bx, by);
                    this.ctx.stroke();
                    // Atom circles
                    this.ctx.beginPath();
                    this.ctx.arc(ax, ay, 4, 0, Math.PI * 2);
                    this.ctx.fillStyle = 'rgba(0, 255, 136, 0.08)';
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.arc(bx, by, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        },

        drawPerspectiveGrid() {
            const cx = this.width / 2;
            const horizon = this.height * 0.35;
            const gridCount = 15;
            const ec = this.envColors[this.environment];

            this.ctx.strokeStyle = ec.grid;
            this.ctx.lineWidth = 0.5;

            // Horizontal lines
            for (let i = 0; i <= gridCount; i++) {
                const t = i / gridCount;
                const y = horizon + (this.height - horizon) * t;
                const spread = (1 - t * 0.3) * this.width * 0.6;
                this.ctx.beginPath();
                this.ctx.moveTo(cx - spread, y);
                this.ctx.lineTo(cx + spread, y);
                this.ctx.stroke();
            }

            // Vertical lines
            for (let i = -8; i <= 8; i++) {
                const bottomX = cx + i * (this.width / 12);
                this.ctx.beginPath();
                this.ctx.moveTo(cx, horizon);
                this.ctx.lineTo(bottomX, this.height);
                this.ctx.stroke();
            }

            // Pulse rings on floor (classroom only)
            if (this.environment === 'classroom') {
                for (let r = 0; r < 3; r++) {
                    const radius = ((this.time * 0.3 + r * 0.33) % 1) * this.width * 0.4;
                    const alpha = (1 - radius / (this.width * 0.4)) * 0.08;
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx, this.height * 0.75, radius, radius * 0.2, 0, 0, Math.PI * 2);
                    this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        },

        drawDataStreams() {
            this.dataStreams.forEach(ds => {
                ds.offset += ds.speed;
                if (ds.offset > this.width + ds.length) ds.offset = -ds.length;

                const grad = this.ctx.createLinearGradient(ds.offset - ds.length, 0, ds.offset, 0);
                grad.addColorStop(0, 'transparent');
                grad.addColorStop(0.5, ds.color);
                grad.addColorStop(1, 'transparent');
                this.ctx.strokeStyle = grad;
                this.ctx.globalAlpha = ds.opacity;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(ds.offset - ds.length, ds.y);
                this.ctx.lineTo(ds.offset, ds.y);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            });
        },

        drawHoloObject(obj, floatY) {
            const x = obj.x;
            const y = obj.y + floatY;
            const s = obj.size;

            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(obj.rotation);

            // Selection glow pulse
            let selGlow = 0;
            if (obj.selected) {
                selGlow = Math.max(0, 1 - (this.time - obj.selectTime) * 1.5);
                if (selGlow <= 0) obj.selected = false;
            }

            this.ctx.shadowBlur = 15 + selGlow * 25;
            this.ctx.shadowColor = obj.color;
            this.ctx.strokeStyle = obj.color;
            this.ctx.lineWidth = 1.5 + selGlow * 2;
            this.ctx.globalAlpha = 0.7 + selGlow * 0.3;

            // Mouse proximity glow
            const mx = this.mouse.rawX, my = this.mouse.rawY;
            const distToMouse = Math.sqrt((mx - x) * (mx - x) + (my - y) * (my - y));
            if (distToMouse < 80) {
                this.ctx.globalAlpha = Math.min(1, 0.7 + (1 - distToMouse / 80) * 0.3);
                this.ctx.lineWidth += (1 - distToMouse / 80) * 1.5;
            }

            switch (obj.type) {
                case 'cube': {
                    const d = s * 0.3;
                    this.ctx.strokeRect(-s / 2, -s / 2, s, s);
                    this.ctx.strokeRect(-s / 2 + d, -s / 2 - d, s, s);
                    this.ctx.beginPath();
                    this.ctx.moveTo(-s / 2, -s / 2); this.ctx.lineTo(-s / 2 + d, -s / 2 - d);
                    this.ctx.moveTo(s / 2, -s / 2); this.ctx.lineTo(s / 2 + d, -s / 2 - d);
                    this.ctx.moveTo(-s / 2, s / 2); this.ctx.lineTo(-s / 2 + d, s / 2 - d);
                    this.ctx.moveTo(s / 2, s / 2); this.ctx.lineTo(s / 2 + d, s / 2 - d);
                    this.ctx.stroke();
                    break;
                }
                case 'sphere': {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, s / 2, s / 5, 0, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, s / 5, s / 2, 0, 0, Math.PI * 2);
                    this.ctx.stroke();
                    break;
                }
                case 'pyramid': {
                    const h = s * 0.8;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -h / 2);
                    this.ctx.lineTo(-s / 2, h / 2);
                    this.ctx.lineTo(s / 2, h / 2);
                    this.ctx.closePath();
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -h / 2);
                    this.ctx.lineTo(0, h / 2);
                    this.ctx.stroke();
                    break;
                }
                case 'ring': {
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, s / 2, s / 4, 0, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, s / 3, s / 6, 0, 0, Math.PI * 2);
                    this.ctx.stroke();
                    break;
                }
                case 'helix': {
                    this.ctx.beginPath();
                    for (let t = 0; t < Math.PI * 4; t += 0.1) {
                        const hx = Math.cos(t) * s / 3;
                        const hy = (t / (Math.PI * 4) - 0.5) * s;
                        if (t === 0) this.ctx.moveTo(hx, hy);
                        else this.ctx.lineTo(hx, hy);
                    }
                    this.ctx.stroke();
                    break;
                }
                case 'torus': {
                    // Double ring torus
                    for (let r = 0; r < 2; r++) {
                        const tilt = r * 0.5;
                        this.ctx.beginPath();
                        this.ctx.ellipse(0, 0, s / 2, s / 3 * (1 - tilt * 0.4), tilt, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                    // Inner ring
                    this.ctx.beginPath();
                    this.ctx.ellipse(0, 0, s / 4, s / 6, 0, 0, Math.PI * 2);
                    this.ctx.stroke();
                    break;
                }
                case 'star': {
                    this.ctx.beginPath();
                    for (let i = 0; i < 10; i++) {
                        const r = i % 2 === 0 ? s / 2 : s / 5;
                        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                        const sx = Math.cos(angle) * r;
                        const sy = Math.sin(angle) * r;
                        if (i === 0) this.ctx.moveTo(sx, sy);
                        else this.ctx.lineTo(sx, sy);
                    }
                    this.ctx.closePath();
                    this.ctx.stroke();
                    break;
                }
                case 'dna': {
                    // DNA double helix
                    this.ctx.beginPath();
                    for (let t = 0; t < Math.PI * 4; t += 0.1) {
                        const dx = Math.cos(t) * s / 3;
                        const dy = (t / (Math.PI * 4) - 0.5) * s * 1.2;
                        if (t === 0) this.ctx.moveTo(dx, dy);
                        else this.ctx.lineTo(dx, dy);
                    }
                    this.ctx.stroke();
                    // Second strand
                    this.ctx.beginPath();
                    for (let t = 0; t < Math.PI * 4; t += 0.1) {
                        const dx = Math.cos(t + Math.PI) * s / 3;
                        const dy = (t / (Math.PI * 4) - 0.5) * s * 1.2;
                        if (t === 0) this.ctx.moveTo(dx, dy);
                        else this.ctx.lineTo(dx, dy);
                    }
                    this.ctx.stroke();
                    // Rungs
                    for (let t = 0; t < Math.PI * 4; t += Math.PI / 2) {
                        const dx1 = Math.cos(t) * s / 3;
                        const dx2 = Math.cos(t + Math.PI) * s / 3;
                        const dy = (t / (Math.PI * 4) - 0.5) * s * 1.2;
                        this.ctx.beginPath();
                        this.ctx.moveTo(dx1, dy);
                        this.ctx.lineTo(dx2, dy);
                        this.ctx.stroke();
                    }
                    break;
                }
            }

            this.ctx.restore();
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1;

            // Object label on hover
            if (distToMouse < 60) {
                this.ctx.fillStyle = obj.color;
                this.ctx.globalAlpha = 0.6;
                this.ctx.font = '9px "JetBrains Mono", monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(obj.label.toUpperCase(), x, y - s / 2 - 12);
                this.ctx.globalAlpha = 1;
                this.ctx.textAlign = 'start';
            }
        },

        drawStudents() {
            this.students.forEach(st => {
                const bobY = Math.sin(this.time * st.bobSpeed + st.headBob) * 3;
                const x = st.x, y = st.y + bobY;

                // Body glow
                this.ctx.beginPath();
                this.ctx.arc(x, y, 8, 0, Math.PI * 2);
                this.ctx.fillStyle = st.color;
                this.ctx.globalAlpha = st.active ? 0.3 : 0.1;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = st.color;
                this.ctx.fill();

                // Head
                this.ctx.beginPath();
                this.ctx.arc(x, y - 10, 5, 0, Math.PI * 2);
                this.ctx.fillStyle = st.color;
                this.ctx.globalAlpha = st.active ? 0.5 : 0.15;
                this.ctx.fill();

                // Name tag
                this.ctx.globalAlpha = st.active ? 0.4 : 0.15;
                this.ctx.font = '7px "JetBrains Mono", monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = st.color;
                this.ctx.fillText(st.name, x, y + 18);

                // Focus line to nearest object
                if (st.focusLine && st.active) {
                    let nearest = this.objects[0];
                    let minDist = Infinity;
                    this.objects.forEach(o => {
                        const d = Math.sqrt((o.x - x) * (o.x - x) + (o.y - y) * (o.y - y));
                        if (d < minDist) { minDist = d; nearest = o; }
                    });
                    if (nearest && minDist < this.width * 0.5) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x, y - 10);
                        this.ctx.lineTo(nearest.x, nearest.y);
                        this.ctx.strokeStyle = st.color;
                        this.ctx.globalAlpha = 0.06;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.setLineDash([4, 4]);
                        this.ctx.stroke();
                        this.ctx.setLineDash([]);
                    }
                }

                this.ctx.globalAlpha = 1;
                this.ctx.shadowBlur = 0;
                this.ctx.textAlign = 'start';
            });
        },

        drawParticles() {
            this.particles.forEach(p => {
                if (!this.paused) {
                    p.y -= p.speed;
                    p.x += p.drift;
                    p.twinkle += 0.05;
                    if (p.y < 0) { p.y = this.height; p.x = Math.random() * this.width; }
                    if (p.x < 0) p.x = this.width;
                    if (p.x > this.width) p.x = 0;
                }

                const twinkleAlpha = (Math.sin(p.twinkle) * 0.3 + 0.7) * p.opacity;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = twinkleAlpha;
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            });
        },

        drawHUD() {
            const ec = this.envColors[this.environment];
            const accent = ec.accent;

            // Top-left corner label
            this.ctx.fillStyle = accent;
            this.ctx.globalAlpha = 0.5;
            this.ctx.font = '10px "JetBrains Mono", monospace';
            this.ctx.fillText('VR CLASSROOM — ZONE A7', 20, 30);
            this.ctx.fillText(`ENV: ${this.environment.toUpperCase()}  |  T: ${this.time.toFixed(1)}s`, 20, 48);
            this.ctx.globalAlpha = 1;

            // Corner brackets
            this.ctx.strokeStyle = accent;
            this.ctx.globalAlpha = 0.3;
            this.ctx.lineWidth = 1;

            // Top-left
            this.ctx.beginPath();
            this.ctx.moveTo(10, 30); this.ctx.lineTo(10, 10); this.ctx.lineTo(30, 10);
            this.ctx.stroke();
            // Top-right
            this.ctx.beginPath();
            this.ctx.moveTo(this.width - 30, 10); this.ctx.lineTo(this.width - 10, 10); this.ctx.lineTo(this.width - 10, 30);
            this.ctx.stroke();
            // Bottom-left
            this.ctx.beginPath();
            this.ctx.moveTo(10, this.height - 30); this.ctx.lineTo(10, this.height - 10); this.ctx.lineTo(30, this.height - 10);
            this.ctx.stroke();
            // Bottom-right
            this.ctx.beginPath();
            this.ctx.moveTo(this.width - 30, this.height - 10); this.ctx.lineTo(this.width - 10, this.height - 10); this.ctx.lineTo(this.width - 10, this.height - 30);
            this.ctx.stroke();

            this.ctx.globalAlpha = 1;

            // Mini radar (bottom-right area, above controls)
            this.drawMiniRadar();

            // Crosshair at mouse
            if (this.mouse.rawX > 0 && this.mouse.rawY > 0) {
                this.ctx.strokeStyle = accent;
                this.ctx.globalAlpha = 0.15;
                this.ctx.lineWidth = 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(this.mouse.rawX - 12, this.mouse.rawY);
                this.ctx.lineTo(this.mouse.rawX + 12, this.mouse.rawY);
                this.ctx.moveTo(this.mouse.rawX, this.mouse.rawY - 12);
                this.ctx.lineTo(this.mouse.rawX, this.mouse.rawY + 12);
                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            }
        },

        drawMiniRadar() {
            const rSize = 40;
            const rx = this.width - 70;
            const ry = this.height - 90;

            // Background circle
            this.ctx.beginPath();
            this.ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fill();
            this.ctx.strokeStyle = this.envColors[this.environment].accent;
            this.ctx.globalAlpha = 0.2;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Cross lines
            this.ctx.beginPath();
            this.ctx.moveTo(rx - rSize, ry); this.ctx.lineTo(rx + rSize, ry);
            this.ctx.moveTo(rx, ry - rSize); this.ctx.lineTo(rx, ry + rSize);
            this.ctx.strokeStyle = this.envColors[this.environment].accent;
            this.ctx.globalAlpha = 0.1;
            this.ctx.stroke();

            // Sweep line
            const sweepAngle = this.time * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(rx, ry);
            this.ctx.lineTo(rx + Math.cos(sweepAngle) * rSize, ry + Math.sin(sweepAngle) * rSize);
            this.ctx.strokeStyle = this.envColors[this.environment].accent;
            this.ctx.globalAlpha = 0.4;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            // Object blips
            [...this.objects, ...this.spawnedObjects].forEach(o => {
                const bx = rx + ((o.x / this.width) - 0.5) * rSize * 2 * 0.8;
                const by = ry + ((o.y / this.height) - 0.5) * rSize * 2 * 0.8;
                this.ctx.beginPath();
                this.ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
                this.ctx.fillStyle = o.color;
                this.ctx.globalAlpha = 0.6;
                this.ctx.fill();
            });

            this.ctx.globalAlpha = 1;
        },

        drawScanlines() {
            this.ctx.fillStyle = 'rgba(0,0,0,0.03)';
            for (let y = 0; y < this.height; y += 3) {
                this.ctx.fillRect(0, y, this.width, 1);
            }
        },

        updateTimeline() {
            const duration = 120; // 2 minute "session"
            const progress = (this.sessionTime % duration) / duration;
            const bar = document.getElementById('vr-timeline-bar');
            if (bar) bar.style.width = (progress * 100) + '%';
            const label = document.getElementById('vr-timeline-label');
            if (label) {
                const sec = Math.floor(this.sessionTime % duration);
                const mm = String(Math.floor(sec / 60)).padStart(1, '0');
                const ss = String(sec % 60).padStart(2, '0');
                label.textContent = `${mm}:${ss}`;
            }
            const elapsed = document.getElementById('vr-elapsed');
            if (elapsed) {
                const totalSec = Math.floor(this.sessionTime);
                const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
                const ss = String(totalSec % 60).padStart(2, '0');
                elapsed.textContent = `${mm}:${ss}`;
            }
        },

        destroy() {
            if (this.animId) cancelAnimationFrame(this.animId);
        }
    };

    // ==================== THREE.JS BACKGROUND SCENE ====================
    const NeuralBackground = {
        init() {
            if (typeof THREE === 'undefined') return;

            const container = document.getElementById('three-container');
            if (!container) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            container.appendChild(renderer.domElement);

            // Create neural network geometry
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const colors = [];
            const count = 300;

            for (let i = 0; i < count; i++) {
                vertices.push(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                );
                const color = new THREE.Color();
                color.setHSL(0.5 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3);
                colors.push(color.r, color.g, color.b);
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 0.05,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
            });

            const points = new THREE.Points(geometry, material);
            scene.add(points);

            // Connection lines
            const lineGeometry = new THREE.BufferGeometry();
            const lineVertices = [];
            const positions = geometry.attributes.position.array;

            for (let i = 0; i < count; i++) {
                for (let j = i + 1; j < count; j++) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 3) {
                        lineVertices.push(
                            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                        );
                    }
                }
            }

            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x00f0ff,
                transparent: true,
                opacity: 0.05,
                blending: THREE.AdditiveBlending,
            });
            const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(lines);

            camera.position.z = 8;

            let mouseX = 0, mouseY = 0;
            document.addEventListener('mousemove', (e) => {
                mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
                mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            });

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });

            function animate() {
                requestAnimationFrame(animate);
                points.rotation.x += 0.0003;
                points.rotation.y += 0.0005;
                lines.rotation.x += 0.0003;
                lines.rotation.y += 0.0005;

                camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
                camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.02;
                camera.lookAt(scene.position);

                renderer.render(scene, camera);
            }

            animate();
        }
    };

    // ==================== INITIALIZATION ====================
    function initThreeScenes() {
        // Hero brain always inits
        HeroBrain.init();

        // VR classroom
        VRClassroom.init();

        // Three.js background (lazy — wait a bit after page load)
        setTimeout(() => NeuralBackground.init(), 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThreeScenes);
    } else {
        initThreeScenes();
    }
})();
