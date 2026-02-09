/* ============================================================
   SynaptiQX 2050 — Charts & Dashboard Module
   Handles: Learning progress chart, Cognitive radar chart,
            Global activity chart, Course distribution chart
   Uses: Chart.js with custom holographic styling
   ============================================================ */

(function () {
    'use strict';

    // Shared holographic chart defaults
    const holoDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 30, 0.9)',
                borderColor: 'rgba(0, 240, 255, 0.2)',
                borderWidth: 1,
                titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
                bodyFont: { family: "'Inter', sans-serif", size: 12 },
                titleColor: '#00f0ff',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4,
            }
        }
    };

    // ==================== LEARNING PROGRESS CHART ====================
    const LearningProgressChart = {
        chart: null,
        data: {
            week: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                neural: [72, 85, 78, 92, 88, 95, 91],
                traditional: [45, 52, 48, 58, 55, 60, 57],
                ai: [60, 68, 72, 80, 76, 85, 82],
            },
            month: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                neural: [75, 82, 89, 94],
                traditional: [48, 52, 55, 58],
                ai: [62, 70, 78, 84],
            },
            year: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                neural: [60, 65, 70, 74, 78, 82, 85, 88, 90, 92, 94, 96],
                traditional: [40, 42, 44, 45, 47, 48, 50, 51, 52, 53, 54, 55],
                ai: [50, 55, 60, 64, 68, 72, 75, 78, 80, 82, 84, 86],
            }
        },

        init() {
            const canvas = document.getElementById('learning-progress-chart');
            if (!canvas || typeof Chart === 'undefined') return;

            this.createChart(canvas, 'week');
            this.bindPeriodButtons();
        },

        createChart(canvas, period) {
            const ctx = canvas.getContext('2d');
            const d = this.data[period];

            // Gradient fills
            const neuralGradient = ctx.createLinearGradient(0, 0, 0, 250);
            neuralGradient.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
            neuralGradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

            const aiGradient = ctx.createLinearGradient(0, 0, 0, 250);
            aiGradient.addColorStop(0, 'rgba(176, 0, 255, 0.1)');
            aiGradient.addColorStop(1, 'rgba(176, 0, 255, 0)');

            if (this.chart) this.chart.destroy();

            this.chart = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: d.labels,
                    datasets: [
                        {
                            label: 'Neural Learning',
                            data: d.neural,
                            borderColor: '#00f0ff',
                            backgroundColor: neuralGradient,
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#00f0ff',
                            pointBorderColor: '#0a0a1a',
                            pointBorderWidth: 2,
                        },
                        {
                            label: 'AI-Assisted',
                            data: d.ai,
                            borderColor: '#b000ff',
                            backgroundColor: aiGradient,
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            pointBackgroundColor: '#b000ff',
                            pointBorderColor: '#0a0a1a',
                            pointBorderWidth: 2,
                        },
                        {
                            label: 'Traditional',
                            data: d.traditional,
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'transparent',
                            borderWidth: 1.5,
                            borderDash: [5, 5],
                            fill: false,
                            tension: 0.4,
                            pointRadius: 2,
                            pointHoverRadius: 4,
                            pointBackgroundColor: 'rgba(255,255,255,0.3)',
                        }
                    ]
                },
                options: {
                    ...holoDefaults,
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.03)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.3)',
                                font: { family: "'JetBrains Mono', monospace", size: 10 }
                            }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.03)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.3)',
                                font: { family: "'JetBrains Mono', monospace", size: 10 },
                                callback: (value) => value + '%'
                            }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        ...holoDefaults.plugins,
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255,255,255,0.5)',
                                font: { size: 10, family: "'Inter', sans-serif" },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle',
                            }
                        }
                    }
                }
            });
        },

        bindPeriodButtons() {
            document.querySelectorAll('.chart-period-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const canvas = document.getElementById('learning-progress-chart');
                    this.createChart(canvas, btn.dataset.period);
                });
            });
        }
    };

    // ==================== COGNITIVE RADAR CHART ====================
    const CognitiveRadarChart = {
        init() {
            const canvas = document.getElementById('cognitive-radar-chart');
            if (!canvas || typeof Chart === 'undefined') return;

            new Chart(canvas, {
                type: 'radar',
                data: {
                    labels: ['Logic', 'Memory', 'Creativity', 'Focus', 'Speed', 'Analysis'],
                    datasets: [
                        {
                            label: 'Current',
                            data: [92, 85, 78, 88, 95, 82],
                            borderColor: '#00f0ff',
                            backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            borderWidth: 2,
                            pointBackgroundColor: '#00f0ff',
                            pointBorderColor: '#0a0a1a',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                        },
                        {
                            label: 'Last Month',
                            data: [80, 75, 70, 78, 85, 72],
                            borderColor: 'rgba(176, 0, 255, 0.6)',
                            backgroundColor: 'rgba(176, 0, 255, 0.05)',
                            borderWidth: 1.5,
                            borderDash: [4, 4],
                            pointBackgroundColor: 'rgba(176, 0, 255, 0.6)',
                            pointBorderColor: '#0a0a1a',
                            pointBorderWidth: 1,
                            pointRadius: 3,
                        }
                    ]
                },
                options: {
                    ...holoDefaults,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                display: false,
                                stepSize: 20,
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                            },
                            angleLines: {
                                color: 'rgba(255, 255, 255, 0.05)',
                            },
                            pointLabels: {
                                color: 'rgba(255, 255, 255, 0.5)',
                                font: { family: "'JetBrains Mono', monospace", size: 10 }
                            }
                        }
                    },
                    plugins: {
                        ...holoDefaults.plugins,
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255,255,255,0.5)',
                                font: { size: 10, family: "'Inter', sans-serif" },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle',
                            }
                        }
                    }
                }
            });
        }
    };

    // ==================== GLOBAL ACTIVITY CHART ====================
    const GlobalActivityChart = {
        chart: null,

        init() {
            const canvas = document.getElementById('global-activity-chart');
            if (!canvas || typeof Chart === 'undefined') return;

            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 250);
            gradient.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

            this.chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania', 'Orbital'],
                    datasets: [{
                        label: 'Active Users (K)',
                        data: [480, 390, 620, 180, 120, 45],
                        backgroundColor: [
                            'rgba(0, 240, 255, 0.5)',
                            'rgba(176, 0, 255, 0.5)',
                            'rgba(0, 255, 136, 0.5)',
                            'rgba(255, 136, 0, 0.5)',
                            'rgba(255, 0, 110, 0.5)',
                            'rgba(255, 215, 0, 0.5)',
                        ],
                        borderColor: [
                            'rgba(0, 240, 255, 0.8)',
                            'rgba(176, 0, 255, 0.8)',
                            'rgba(0, 255, 136, 0.8)',
                            'rgba(255, 136, 0, 0.8)',
                            'rgba(255, 0, 110, 0.8)',
                            'rgba(255, 215, 0, 0.8)',
                        ],
                        borderWidth: 1,
                        borderRadius: 6,
                    }]
                },
                options: {
                    ...holoDefaults,
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.03)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.4)',
                                font: { family: "'JetBrains Mono', monospace", size: 9 }
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.03)',
                                drawBorder: false,
                            },
                            ticks: {
                                color: 'rgba(255, 255, 255, 0.3)',
                                font: { family: "'JetBrains Mono', monospace", size: 10 },
                                callback: (value) => value + 'K'
                            }
                        }
                    }
                }
            });

            // Live data simulation
            this.startLiveUpdates();
        },

        startLiveUpdates() {
            setInterval(() => {
                if (!this.chart) return;
                const data = this.chart.data.datasets[0].data;
                for (let i = 0; i < data.length; i++) {
                    data[i] = Math.max(50, data[i] + Math.floor(Math.random() * 20 - 10));
                }
                this.chart.update('none');
            }, 4000);
        }
    };

    // ==================== COURSE DISTRIBUTION CHART ====================
    const CourseDistributionChart = {
        init() {
            const canvas = document.getElementById('course-distribution-chart');
            if (!canvas || typeof Chart === 'undefined') return;

            new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['AI & ML', 'Quantum', 'Neuroscience', 'Cyber Security', 'Holo Design', 'Other'],
                    datasets: [{
                        data: [32, 22, 18, 14, 10, 4],
                        backgroundColor: [
                            'rgba(0, 240, 255, 0.7)',
                            'rgba(176, 0, 255, 0.7)',
                            'rgba(255, 0, 110, 0.7)',
                            'rgba(0, 255, 136, 0.7)',
                            'rgba(255, 136, 0, 0.7)',
                            'rgba(255, 215, 0, 0.7)',
                        ],
                        borderColor: 'rgba(10, 10, 26, 0.8)',
                        borderWidth: 2,
                        hoverOffset: 8,
                    }]
                },
                options: {
                    ...holoDefaults,
                    cutout: '65%',
                    plugins: {
                        ...holoDefaults.plugins,
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255,255,255,0.5)',
                                font: { size: 10, family: "'Inter', sans-serif" },
                                padding: 12,
                                usePointStyle: true,
                                pointStyle: 'rectRounded',
                            }
                        }
                    }
                }
            });
        }
    };

    // ==================== INITIALIZATION ====================
    function initCharts() {
        // Use intersection observer for lazy chart init
        const chartSections = [
            { el: document.getElementById('dashboard'), init: () => { LearningProgressChart.init(); CognitiveRadarChart.init(); } },
            { el: document.getElementById('analytics'), init: () => { GlobalActivityChart.init(); CourseDistributionChart.init(); } },
        ];

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = chartSections.find(s => s.el === entry.target);
                    if (section && !section.initialized) {
                        section.initialized = true;
                        section.init();
                    }
                }
            });
        }, { threshold: 0.1 });

        chartSections.forEach(section => {
            if (section.el) observer.observe(section.el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCharts);
    } else {
        // Chart.js might load async, wait for it
        const waitForChart = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                clearInterval(waitForChart);
                initCharts();
            }
        }, 100);

        // Timeout fallback
        setTimeout(() => clearInterval(waitForChart), 10000);
    }
})();
