/* ============================================================
   SynaptiQX 2050 — AI Assistant Module (ARIA)
   Handles: Chat interface, AI responses, Voice waveform,
            Avatar animations, Quick actions, Microphone input
   ============================================================ */

(function () {
    'use strict';

    // ==================== AI KNOWLEDGE BASE ====================
    const AIKnowledge = {
        responses: {
            greeting: [
                "Hello! I'm ARIA, your neural learning companion. I'm here to help you excel in your courses, understand complex concepts, and optimize your learning journey. What would you like to explore today?",
                "Welcome back! I've been analyzing your recent neural patterns and I have some exciting recommendations. Shall we dive in?",
                "Great to see you online! Your cognitive scores improved 12% since our last session. Ready to keep that momentum going?"
            ],
            course_recommend: [
                "Based on your cognitive profile and learning velocity, I recommend **Generative AI Studio** — it aligns perfectly with your neural strengths in creativity (78%) and logic (92%). The course combines quantum computing foundations with practical AI model building. You'll master:\n\n• Transformer architectures\n• Quantum-enhanced training\n• Multi-modal generation\n• Ethics & safety frameworks\n\nShall I enroll you in the next cohort starting Monday?",
                "Analyzing your skill matrix... Your strongest growth area is at the intersection of **Quantum Computing** and **Neural Networks**. I'd suggest the **Quantum Machine Learning** track — it will boost both your quantum coding (Lvl 8) and neural design (Lvl 7) simultaneously. The adaptive curriculum adjusts in real-time to your pace.",
            ],
            explain_quantum: [
                "Great question! Here's quantum computing in a nutshell:\n\n**Classical computers** use bits (0 or 1). **Quantum computers** use **qubits** that can be both 0 AND 1 simultaneously — this is called **superposition**.\n\nImagine flipping a coin: a classical bit is the coin landed (heads OR tails). A qubit is the coin while spinning — it's BOTH until you look at it.\n\n**Entanglement** means two qubits can be linked so measuring one instantly determines the other, regardless of distance.\n\nThis allows quantum computers to solve certain problems exponentially faster — like optimizing your learning path across millions of variables in milliseconds.\n\nWant me to dive deeper into any of these concepts?",
            ],
            study_plan: [
                "Here's your optimized study plan for this week, calibrated to your neural performance peaks:\n\n📅 **Monday**: Advanced AI Ethics (2h) — Your focus peaks at 9AM\n📅 **Tuesday**: Quantum Lab Practice (3h) — Hands-on retention is highest\n📅 **Wednesday**: REST DAY — Neural consolidation period\n📅 **Thursday**: Neural Network Design (2.5h) — Creative peak detected\n📅 **Friday**: Cyber Security Workshop (2h) — Analytical peak\n📅 **Weekend**: VR Immersive Review (1.5h) — Holographic memory encoding\n\nTotal: 11 hours of optimized neural learning\nProjected score improvement: +8.3%\n\nShall I set neural sync reminders for each session?",
            ],
            diagnostics: [
                "Running full neural diagnostic... Complete!\n\n📊 **Cognitive Performance Report**:\n\n• **Neural Score**: 947/1000 (Top 3%)\n• **Learning Velocity**: 2.4x standard rate\n• **Memory Retention**: 94.7% at 30-day mark\n• **Focus Duration**: Avg 47 min (Elite tier)\n• **Pattern Recognition**: 96th percentile\n\n⚡ **Strengths**: Logic, Speed, Analysis\n🔄 **Growth Areas**: Creativity (+3% this month)\n\n✅ **Recommendation**: Your neural pathways show optimal conditions for advanced quantum coursework. Consider unlocking the Expert-tier Quantum Cryptography module.\n\nWould you like a detailed breakdown of any metric?",
            ],
            default: [
                "That's an interesting question! Let me process that through my neural networks... Based on my analysis, I can help you explore this topic further. Would you like me to find relevant course materials, create a study module, or explain the concept interactively?",
                "I'm cross-referencing my knowledge base of 12.8 billion neural pathways to find the best answer for you. In the meantime, could you tell me more about what aspect interests you most? This helps me calibrate my response to your learning style.",
                "Excellent inquiry! My quantum processors are analyzing multiple knowledge domains to craft the most comprehensive response. I'll incorporate your cognitive profile to ensure the explanation matches your optimal learning modality.",
            ]
        },

        getResponse(intent) {
            const responses = this.responses[intent] || this.responses.default;
            return responses[Math.floor(Math.random() * responses.length)];
        },

        detectIntent(message) {
            const lower = message.toLowerCase();
            if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('course for me')) return 'course_recommend';
            if (lower.includes('quantum') && lower.includes('explain') || lower.includes('quantum computing simply')) return 'explain_quantum';
            if (lower.includes('study plan') || lower.includes('schedule') || lower.includes('this week')) return 'study_plan';
            if (lower.includes('diagnostic') || lower.includes('progress') || lower.includes('performance')) return 'diagnostics';
            if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return 'greeting';
            return 'default';
        }
    };

    // ==================== CHAT SYSTEM ====================
    const ChatSystem = {
        messagesEl: null,
        inputEl: null,
        sendBtn: null,
        isTyping: false,

        init() {
            this.messagesEl = document.getElementById('chat-messages');
            this.inputEl = document.getElementById('chat-input');
            this.sendBtn = document.getElementById('btn-send-chat');

            if (!this.messagesEl || !this.inputEl || !this.sendBtn) return;

            // Send on click
            this.sendBtn.addEventListener('click', () => this.sendMessage());

            // Send on Enter
            this.inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Quick actions
            document.querySelectorAll('.quick-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const msg = btn.dataset.message;
                    this.inputEl.value = msg;
                    this.sendMessage();
                });
            });

            // Focus glow on input
            this.inputEl.addEventListener('focus', () => {
                this.inputEl.parentElement.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.1)';
            });
            this.inputEl.addEventListener('blur', () => {
                this.inputEl.parentElement.style.boxShadow = '';
            });
        },

        sendMessage() {
            const text = this.inputEl.value.trim();
            if (!text || this.isTyping) return;

            // Add user message
            this.addMessage(text, 'user');
            this.inputEl.value = '';

            // Show typing indicator
            this.showTyping();

            // Simulate AI thinking
            const intent = AIKnowledge.detectIntent(text);
            const responseText = AIKnowledge.getResponse(intent);

            // Variable delay based on response length
            const delay = 800 + Math.min(responseText.length * 2, 2000);

            // Update avatar state
            AvatarController.setState('speaking');

            setTimeout(() => {
                this.hideTyping();
                this.addMessage(responseText, 'ai');
                AvatarController.setState('idle');
            }, delay);
        },

        addMessage(text, sender) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Format markdown-like bold text
            const formatted = text
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/\n/g, '<br>');

            let html = '';
            if (sender === 'user') {
                html = `
                    <div class="chat-msg-user animate-fade-up">
                        <div class="msg-bubble">
                            <p class="text-sm text-white/90">${formatted}</p>
                            <span class="text-[10px] text-white/30 mt-2 block font-mono text-right">${time}</span>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-neural-400 to-neural-600 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-user text-white text-xs"></i>
                        </div>
                    </div>`;
            } else {
                html = `
                    <div class="chat-msg-ai animate-fade-up">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-green to-cyber-blue flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, #00ff88, #00f0ff);">
                            <i class="fas fa-robot text-white text-xs"></i>
                        </div>
                        <div class="msg-bubble">
                            <p class="text-sm text-white/80 leading-relaxed">${formatted}</p>
                            <span class="text-[10px] text-white/30 mt-2 block font-mono">${time}</span>
                        </div>
                    </div>`;
            }

            this.messagesEl.insertAdjacentHTML('beforeend', html);
            this.scrollToBottom();
        },

        showTyping() {
            this.isTyping = true;
            const html = `
                <div class="chat-msg-ai" id="typing-indicator">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, #00ff88, #00f0ff);">
                        <i class="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div class="msg-bubble">
                        <div class="typing-indicator">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                </div>`;
            this.messagesEl.insertAdjacentHTML('beforeend', html);
            this.scrollToBottom();
        },

        hideTyping() {
            this.isTyping = false;
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.remove();
        },

        scrollToBottom() {
            this.messagesEl.scrollTo({
                top: this.messagesEl.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // ==================== AVATAR CONTROLLER ====================
    const AvatarController = {
        avatar: null,
        mouth: null,
        state: 'idle', // idle, listening, speaking
        mouthAnimation: null,

        init() {
            this.avatar = document.getElementById('ai-avatar');
            this.mouth = document.getElementById('ai-mouth');
            if (!this.avatar) return;

            // Idle eye movement
            this.startIdleAnimation();
        },

        setState(state) {
            if (this.state === state) return;
            this.state = state;

            this.avatar.className = 'relative w-full h-full flex items-center justify-center';

            const statusDot = document.getElementById('ai-status-dot');
            const statusText = document.getElementById('ai-status-text');

            switch (state) {
                case 'idle':
                    statusDot.style.background = '#00ff88';
                    statusText.textContent = 'Idle';
                    this.stopMouthAnimation();
                    break;
                case 'listening':
                    this.avatar.classList.add('listening');
                    statusDot.style.background = '#b000ff';
                    statusText.textContent = 'Listening...';
                    this.stopMouthAnimation();
                    break;
                case 'speaking':
                    this.avatar.classList.add('speaking');
                    statusDot.style.background = '#00f0ff';
                    statusText.textContent = 'Speaking...';
                    this.startMouthAnimation();
                    break;
            }
        },

        startIdleAnimation() {
            // Subtle eye tracking animation
            const leftPupil = document.querySelector('.ai-pupil-left');
            const rightPupil = document.querySelector('.ai-pupil-right');
            if (!leftPupil) return;

            document.addEventListener('mousemove', (e) => {
                if (this.state !== 'idle') return;

                const container = this.avatar.closest('.relative');
                if (!container) return;

                const rect = container.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;

                const dx = (e.clientX - cx) / window.innerWidth * 4;
                const dy = (e.clientY - cy) / window.innerHeight * 4;

                leftPupil.setAttribute('cx', 72 + dx);
                leftPupil.setAttribute('cy', 90 + dy);
                rightPupil.setAttribute('cx', 128 + dx);
                rightPupil.setAttribute('cy', 90 + dy);
            });

            // Blink animation
            setInterval(() => {
                const leftEye = document.querySelector('.ai-eye-left');
                const rightEye = document.querySelector('.ai-eye-right');
                if (!leftEye) return;

                leftEye.setAttribute('ry', '1');
                rightEye.setAttribute('ry', '1');
                setTimeout(() => {
                    leftEye.setAttribute('ry', '12');
                    rightEye.setAttribute('ry', '12');
                }, 150);
            }, 4000);
        },

        startMouthAnimation() {
            if (!this.mouth) return;
            let frame = 0;
            this.mouthAnimation = setInterval(() => {
                frame++;
                const openness = 130 + Math.sin(frame * 0.5) * 8 + Math.random() * 5;
                this.mouth.setAttribute('d', `M 75 130 Q 100 ${openness} 125 130`);
            }, 80);
        },

        stopMouthAnimation() {
            if (this.mouthAnimation) {
                clearInterval(this.mouthAnimation);
                this.mouthAnimation = null;
            }
            if (this.mouth) {
                this.mouth.setAttribute('d', 'M 75 130 Q 100 145 125 130');
            }
        }
    };

    // ==================== VOICE WAVEFORM ====================
    const VoiceWaveform = {
        container: null,
        bars: [],
        audioContext: null,
        analyser: null,
        stream: null,
        isActive: false,
        animId: null,

        init() {
            this.container = document.getElementById('voice-waveform');
            if (!this.container) return;

            // Create waveform bars
            for (let i = 0; i < 20; i++) {
                const bar = document.createElement('div');
                bar.classList.add('waveform-bar');
                bar.style.height = '4px';
                bar.style.setProperty('--max-height', (8 + Math.random() * 16) + 'px');
                this.container.appendChild(bar);
                this.bars.push(bar);
            }

            // Mic button
            const micBtn = document.getElementById('btn-mic');
            if (micBtn) {
                micBtn.addEventListener('click', () => this.toggle());
            }
        },

        async toggle() {
            if (this.isActive) {
                this.stop();
            } else {
                await this.start();
            }
        },

        async start() {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 64;

                const source = this.audioContext.createMediaStreamSource(this.stream);
                source.connect(this.analyser);

                this.isActive = true;
                AvatarController.setState('listening');

                const micBtn = document.getElementById('btn-mic');
                if (micBtn) {
                    micBtn.classList.add('border-cyber-green');
                    micBtn.querySelector('i').classList.remove('text-white/60');
                    micBtn.querySelector('i').classList.add('text-cyber-green');
                }

                this.visualize();
            } catch (err) {
                // Fallback: simulate waveform if mic not available
                console.info('Microphone not available, using simulation');
                this.isActive = true;
                AvatarController.setState('listening');

                const micBtn = document.getElementById('btn-mic');
                if (micBtn) {
                    micBtn.classList.add('border-cyber-green');
                    micBtn.querySelector('i').classList.remove('text-white/60');
                    micBtn.querySelector('i').classList.add('text-cyber-green');
                }

                this.simulateWaveform();
            }
        },

        stop() {
            this.isActive = false;

            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }
            if (this.animId) {
                cancelAnimationFrame(this.animId);
                this.animId = null;
            }

            this.bars.forEach(bar => bar.style.height = '4px');
            AvatarController.setState('idle');

            const micBtn = document.getElementById('btn-mic');
            if (micBtn) {
                micBtn.classList.remove('border-cyber-green');
                micBtn.querySelector('i').classList.add('text-white/60');
                micBtn.querySelector('i').classList.remove('text-cyber-green');
            }
        },

        visualize() {
            if (!this.isActive || !this.analyser) return;

            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(dataArray);

            this.bars.forEach((bar, i) => {
                const value = dataArray[i] || 0;
                const height = Math.max(4, (value / 255) * 32);
                bar.style.height = height + 'px';
            });

            this.animId = requestAnimationFrame(() => this.visualize());
        },

        simulateWaveform() {
            if (!this.isActive) return;

            this.bars.forEach((bar, i) => {
                const height = 4 + Math.random() * 20 * Math.sin(Date.now() * 0.003 + i * 0.5);
                bar.style.height = Math.max(4, height) + 'px';
            });

            this.animId = requestAnimationFrame(() => this.simulateWaveform());
        }
    };

    // ==================== INITIALIZATION ====================
    function initAIAssistant() {
        ChatSystem.init();
        AvatarController.init();
        VoiceWaveform.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAIAssistant);
    } else {
        initAIAssistant();
    }

})();
