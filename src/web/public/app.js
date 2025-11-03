/**
 * 🏗️ EXTRAORDINARY CONSTRUCTION SYNDICATE AI - FRONTEND CONTROLLER
 * ================================================================
 * Superintelligence-Level Real-Time Monitoring & Visualization System
 */

class ExtraordinaryConstructionGUI {
    constructor() {
        this.socket = null;
        this.charts = {};
        this.isConnected = false;
        this.metrics = {
            system: {},
            specialists: { active: [] },
            quantum: {},
            autonomous: {},
            transformers: {}
        };
        this.chartColors = {
            primary: '#4ecdc4',
            secondary: '#45b7d1',
            accent: '#96ceb4',
            warning: '#ffc107',
            danger: '#dc3545',
            success: '#28a745'
        };
        this.activityHistory = [];
        this.maxActivityItems = 100;
        
        this.init();
    }

    /**
     * 🚀 INITIALIZE EXTRAORDINARY GUI SYSTEM
     */
    async init() {
        console.log('🏗️ Initializing EXTRAORDINARY Construction Syndicate GUI...');
        
        // Initialize WebSocket connection
        this.initializeWebSocket();
        
        // Initialize all charts
        this.initializeCharts();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start update loops
        this.startUpdateLoops();
        
        console.log('✅ EXTRAORDINARY GUI System initialized!');
    }

    /**
     * 🔌 INITIALIZE WEBSOCKET CONNECTION
     */
    initializeWebSocket() {
        // Try to connect to the local server first, then fallback to production
        const wsUrl = window.location.hostname === 'localhost' 
            ? `ws://localhost:3006`
            : `ws://162.55.83.33:3006`;
            
        console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
        
        this.socket = io(wsUrl, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected!');
            this.isConnected = true;
            this.updateConnectionStatus(true);
            this.addActivity('🔌 Connected to Construction Syndicate AI', 'success');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected!');
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.addActivity('🔌 Disconnected from server', 'warning');
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error);
            this.updateConnectionStatus(false);
        });

        // Listen for extraordinary updates
        this.socket.on('extraordinaryUpdate', (data) => {
            this.handleExtraordinaryUpdate(data);
        });

        // Listen for system alerts
        this.socket.on('systemAlert', (alert) => {
            this.handleSystemAlert(alert);
        });

        // Listen for health status
        this.socket.on('healthStatus', (status) => {
            this.handleHealthStatus(status);
        });
    }

    /**
     * 📊 INITIALIZE ALL CHARTS
     */
    initializeCharts() {
        // CPU Chart
        this.charts.cpu = new Chart(document.getElementById('cpuChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU Usage %',
                    data: [],
                    borderColor: this.chartColors.primary,
                    backgroundColor: `${this.chartColors.primary}20`,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: this.getChartOptions('CPU Usage (%)')
        });

        // Memory Chart
        this.charts.memory = new Chart(document.getElementById('memoryChart'), {
            type: 'doughnut',
            data: {
                labels: ['Used', 'Free'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: [this.chartColors.warning, this.chartColors.success],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#ffffff' }
                    }
                }
            }
        });

        // Load Chart
        this.charts.load = new Chart(document.getElementById('loadChart'), {
            type: 'bar',
            data: {
                labels: ['User', 'System'],
                datasets: [{
                    label: 'Load',
                    data: [0, 0],
                    backgroundColor: [this.chartColors.primary, this.chartColors.secondary],
                    borderRadius: 5
                }]
            },
            options: this.getChartOptions('System Load')
        });

        // Specialist Performance Chart
        this.charts.specialist = new Chart(document.getElementById('specialistChart'), {
            type: 'radar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Performance',
                    data: [],
                    borderColor: this.chartColors.accent,
                    backgroundColor: `${this.chartColors.accent}30`,
                    pointBackgroundColor: this.chartColors.accent,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.chartColors.accent
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                        pointLabels: { color: '#ffffff' },
                        ticks: { color: '#ffffff', backdrop: { color: 'transparent' } }
                    }
                }
            }
        });

        // Quantum Systems Chart
        this.charts.quantum = new Chart(document.getElementById('quantumChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Coherence',
                    data: [],
                    borderColor: this.chartColors.primary,
                    backgroundColor: `${this.chartColors.primary}20`,
                    fill: false
                }, {
                    label: 'Entanglement',
                    data: [],
                    borderColor: this.chartColors.secondary,
                    backgroundColor: `${this.chartColors.secondary}20`,
                    fill: false
                }, {
                    label: 'Superposition',
                    data: [],
                    borderColor: this.chartColors.accent,
                    backgroundColor: `${this.chartColors.accent}20`,
                    fill: false
                }]
            },
            options: this.getChartOptions('Quantum Metrics')
        });

        // Autonomous Intelligence Chart
        this.charts.autonomous = new Chart(document.getElementById('autonomousChart'), {
            type: 'bar',
            data: {
                labels: ['Tasks', 'Learning', 'Collaborations', 'Improvements'],
                datasets: [{
                    label: 'Count',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        this.chartColors.primary,
                        this.chartColors.secondary,
                        this.chartColors.accent,
                        this.chartColors.success
                    ],
                    borderRadius: 5
                }]
            },
            options: this.getChartOptions('Autonomous Activities')
        });

        // Transformer Ecosystem Chart
        this.charts.transformer = new Chart(document.getElementById('transformerChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Cache Hit Rate',
                    data: [],
                    borderColor: this.chartColors.success,
                    backgroundColor: `${this.chartColors.success}20`,
                    fill: false,
                    yAxisID: 'y'
                }, {
                    label: 'Inference Rate',
                    data: [],
                    borderColor: this.chartColors.primary,
                    backgroundColor: `${this.chartColors.primary}20`,
                    fill: false,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { color: '#ffffff' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });

        console.log('📊 All charts initialized successfully!');
    }

    /**
     * ⚙️ GET STANDARD CHART OPTIONS
     */
    getChartOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        };
    }

    /**
     * 🎧 SETUP EVENT LISTENERS
     */
    setupEventListeners() {
        // Refresh button (if exists)
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.requestDataRefresh());
        }

        // Window resize handler
        window.addEventListener('resize', () => {
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        });

        // Visibility change handler (pause updates when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('👁️ Tab hidden - pausing intensive updates');
            } else {
                console.log('👁️ Tab visible - resuming updates');
                this.requestDataRefresh();
            }
        });
    }

    /**
     * ⏰ START UPDATE LOOPS
     */
    startUpdateLoops() {
        // Update timestamps every second
        setInterval(() => {
            this.updateTimestamps();
        }, 1000);

        // Request health status every 30 seconds
        setInterval(() => {
            if (this.isConnected && this.socket) {
                this.socket.emit('requestHealth');
            }
        }, 30000);

        // Clean old activity items every 5 minutes
        setInterval(() => {
            this.cleanupActivityHistory();
        }, 300000);

        console.log('⏰ Update loops started!');
    }

    /**
     * 📊 HANDLE EXTRAORDINARY UPDATE FROM BACKEND
     */
    handleExtraordinaryUpdate(updateData) {
        try {
            console.log('📊 Received extraordinary update:', updateData);
            
            const { data, visualization, alerts } = updateData;
            
            // Update metrics
            this.metrics = { ...this.metrics, ...data };
            
            // Update status bar
            this.updateStatusBar(data);
            
            // Update charts with visualization data
            if (visualization) {
                this.updateChartsWithVisualization(visualization);
            }
            
            // Update network topology
            if (visualization && visualization.networkTopology) {
                this.updateNetworkTopology(visualization.networkTopology);
            }
            
            // Update activity feed
            if (visualization && visualization.activityFeed) {
                this.updateActivityFeed(visualization.activityFeed);
            }
            
            // Handle alerts
            if (alerts && alerts.length > 0) {
                this.updateSmartAlerts(alerts);
            }
            
            // Update specialist metrics
            this.updateSpecialistMetrics(data.specialists);
            
            // Update quantum metrics
            this.updateQuantumMetrics(data.quantum);
            
            // Update autonomous metrics
            this.updateAutonomousMetrics(data.autonomous);
            
            // Update transformer metrics
            this.updateTransformerMetrics(data.transformers);

        } catch (error) {
            console.error('❌ Error handling extraordinary update:', error);
            this.addActivity(`❌ Update processing error: ${error.message}`, 'error');
        }
    }

    /**
     * 📊 UPDATE STATUS BAR
     */
    updateStatusBar(data) {
        // System uptime
        if (data.system && data.system.uptime) {
            document.getElementById('uptime').textContent = this.formatUptime(data.system.uptime);
        }

        // Active agents
        if (data.specialists && data.specialists.active) {
            document.getElementById('activeAgents').textContent = data.specialists.active.length;
        }

        // Quantum coherence
        if (data.quantum && data.quantum.coherence) {
            document.getElementById('quantumCoherence').textContent = `${(data.quantum.coherence * 100).toFixed(1)}%`;
        }

        // Autonomous tasks
        if (data.autonomous && data.autonomous.tasksExecuted) {
            document.getElementById('autonomousTasks').textContent = data.autonomous.tasksExecuted;
        }

        // Memory usage
        if (data.system && data.system.memory) {
            const usage = (data.system.memory.heapUsed / 1024 / 1024).toFixed(0);
            document.getElementById('memoryUsage').textContent = `${usage}MB`;
        }
    }

    /**
     * 📈 UPDATE CHARTS WITH VISUALIZATION DATA
     */
    updateChartsWithVisualization(visualization) {
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        // Update CPU chart
        if (visualization.performanceCharts && visualization.performanceCharts.systemLoad) {
            const chart = this.charts.cpu;
            const data = visualization.performanceCharts.systemLoad.data[0] || 0;
            
            chart.data.labels.push(timeLabel);
            chart.data.datasets[0].data.push(data);
            
            // Keep only last 20 data points
            if (chart.data.labels.length > 20) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            
            chart.update('none');
        }

        // Update memory chart
        if (visualization.performanceCharts && visualization.performanceCharts.memoryUsage) {
            const chart = this.charts.memory;
            const memData = visualization.performanceCharts.memoryUsage.data;
            if (memData && memData.length >= 2) {
                chart.data.datasets[0].data = memData;
                chart.update('none');
            }
        }

        // Update quantum chart
        if (visualization.performanceCharts && visualization.performanceCharts.quantumCoherence) {
            const chart = this.charts.quantum;
            const qData = visualization.performanceCharts.quantumCoherence.data;
            
            chart.data.labels.push(timeLabel);
            chart.data.datasets[0].data.push(qData[0] || 0);
            chart.data.datasets[1].data.push(qData[1] || 0);
            chart.data.datasets[2].data.push(qData[2] || 0);
            
            // Keep only last 20 data points
            if (chart.data.labels.length > 20) {
                chart.data.labels.shift();
                chart.data.datasets.forEach(dataset => dataset.data.shift());
            }
            
            chart.update('none');
        }

        // Update specialist radar chart
        if (visualization.performanceCharts && visualization.performanceCharts.specialistActivity) {
            const chart = this.charts.specialist;
            const specData = visualization.performanceCharts.specialistActivity;
            
            if (specData.labels && specData.data) {
                chart.data.labels = specData.labels;
                chart.data.datasets[0].data = specData.data;
                chart.update('none');
            }
        }
    }

    /**
     * 👥 UPDATE SPECIALIST METRICS
     */
    updateSpecialistMetrics(specialists) {
        if (!specialists) return;

        // Update specialist count
        document.getElementById('specialistCount').textContent = specialists.active ? specialists.active.length : 0;
        
        // Update average performance
        if (specialists.active && specialists.active.length > 0) {
            const avgPerf = specialists.active.reduce((sum, s) => sum + (s.performance?.successRate || 0.8), 0) / specialists.active.length;
            document.getElementById('specialistPerformance').textContent = `${(avgPerf * 100).toFixed(1)}%`;
        }
        
        // Update collaborations
        document.getElementById('specialistCollaborations').textContent = specialists.collaboration ? Object.keys(specialists.collaboration).length : 0;
    }

    /**
     * ⚛️ UPDATE QUANTUM METRICS
     */
    updateQuantumMetrics(quantum) {
        if (!quantum) return;

        document.getElementById('quantumCoherenceMetric').textContent = quantum.coherence ? `${(quantum.coherence * 100).toFixed(1)}%` : '--';
        document.getElementById('quantumEntanglement').textContent = quantum.entanglement ? `${(quantum.entanglement * 100).toFixed(1)}%` : '--';
        document.getElementById('quantumSuperposition').textContent = quantum.superposition ? `${(quantum.superposition * 100).toFixed(1)}%` : '--';
        document.getElementById('quantumNodes').textContent = quantum.nodes ? Object.keys(quantum.nodes).length : 0;
    }

    /**
     * 🤖 UPDATE AUTONOMOUS METRICS
     */
    updateAutonomousMetrics(autonomous) {
        if (!autonomous) return;

        document.getElementById('tasksExecutedMetric').textContent = autonomous.tasksExecuted || 0;
        document.getElementById('learningProgress').textContent = autonomous.learningProgress || 0;
        document.getElementById('collaborationsMetric').textContent = autonomous.collaborations || 0;
        document.getElementById('improvements').textContent = autonomous.improvements || 0;

        // Update autonomous chart
        const chart = this.charts.autonomous;
        chart.data.datasets[0].data = [
            autonomous.tasksExecuted || 0,
            autonomous.learningProgress || 0,
            autonomous.collaborations || 0,
            autonomous.improvements || 0
        ];
        chart.update('none');
    }

    /**
     * 🧮 UPDATE TRANSFORMER METRICS
     */
    updateTransformerMetrics(transformers) {
        if (!transformers) return;

        document.getElementById('activeModels').textContent = transformers.activeModels || 0;
        document.getElementById('cacheHitRate').textContent = transformers.cacheHitRate ? `${(transformers.cacheHitRate * 100).toFixed(1)}%` : '--';
        document.getElementById('inferenceRate').textContent = transformers.inferenceRate ? `${transformers.inferenceRate}/s` : '--';
        document.getElementById('transformerMemory').textContent = transformers.memoryUsage ? `${(transformers.memoryUsage / 1024 / 1024).toFixed(0)}MB` : '--';

        // Update transformer chart
        const chart = this.charts.transformer;
        const timeLabel = new Date().toLocaleTimeString();
        
        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(transformers.cacheHitRate || 0);
        chart.data.datasets[1].data.push(transformers.inferenceRate || 0);
        
        // Keep only last 20 data points
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        chart.update('none');
    }

    /**
     * 🌐 UPDATE NETWORK TOPOLOGY
     */
    updateNetworkTopology(networkData) {
        // This is a placeholder for D3.js network visualization
        // In a production environment, you would implement sophisticated network graphs here
        console.log('🌐 Network topology update:', networkData);
    }

    /**
     * 📋 UPDATE ACTIVITY FEED
     */
    updateActivityFeed(activityData) {
        if (!activityData || !Array.isArray(activityData)) return;

        activityData.forEach(activity => {
            this.addActivity(activity.message, activity.type || 'info');
        });
    }

    /**
     * ➕ ADD ACTIVITY TO FEED
     */
    addActivity(message, type = 'info') {
        const timestamp = new Date();
        const activity = { message, type, timestamp };
        
        this.activityHistory.unshift(activity);
        
        // Limit history size
        if (this.activityHistory.length > this.maxActivityItems) {
            this.activityHistory = this.activityHistory.slice(0, this.maxActivityItems);
        }
        
        this.renderActivityFeed();
    }

    /**
     * 🎨 RENDER ACTIVITY FEED
     */
    renderActivityFeed() {
        const container = document.getElementById('activityFeed');
        container.innerHTML = '';
        
        this.activityHistory.slice(0, 20).forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const typeIcon = this.getActivityIcon(activity.type);
            const timeStr = activity.timestamp.toLocaleTimeString();
            
            item.innerHTML = `
                <div class="activity-time">${timeStr}</div>
                <div>${typeIcon} ${activity.message}</div>
            `;
            
            container.appendChild(item);
        });
    }

    /**
     * 🚨 UPDATE SMART ALERTS
     */
    updateSmartAlerts(alerts) {
        const container = document.getElementById('alertsContainer');
        container.innerHTML = '';
        
        alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert ${alert.type}`;
            
            const icon = this.getAlertIcon(alert.type);
            
            alertDiv.innerHTML = `
                ${icon}
                <div>
                    <strong>${alert.message}</strong><br>
                    ${alert.value ? `Value: ${alert.value}<br>` : ''}
                    ${alert.recommendation ? `💡 ${alert.recommendation}` : ''}
                </div>
            `;
            
            container.appendChild(alertDiv);
        });
    }

    /**
     * 🔄 UPDATE CONNECTION STATUS
     */
    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        const dotElement = document.getElementById('statusDot');
        const textElement = document.getElementById('connectionText');
        
        if (connected) {
            statusElement.className = 'connection-status connected';
            dotElement.className = 'status-dot connected';
            textElement.textContent = 'Connected';
        } else {
            statusElement.className = 'connection-status disconnected';
            dotElement.className = 'status-dot disconnected';
            textElement.textContent = 'Disconnected';
        }
    }

    /**
     * 🏥 HANDLE HEALTH STATUS
     */
    handleHealthStatus(status) {
        console.log('🏥 Health status:', status);
        this.addActivity(`🏥 System health: ${status.status}`, 'info');
    }

    /**
     * 🚨 HANDLE SYSTEM ALERT
     */
    handleSystemAlert(alert) {
        console.log('🚨 System alert:', alert);
        this.addActivity(`🚨 ${alert.message}`, alert.type || 'warning');
    }

    /**
     * 🔄 REQUEST DATA REFRESH
     */
    requestDataRefresh() {
        if (this.isConnected && this.socket) {
            this.socket.emit('requestUpdate');
            this.addActivity('🔄 Requested data refresh', 'info');
        }
    }

    /**
     * ⏰ UPDATE TIMESTAMPS
     */
    updateTimestamps() {
        // Update any relative timestamps in the UI
        const timestampElements = document.querySelectorAll('[data-timestamp]');
        timestampElements.forEach(element => {
            const timestamp = parseInt(element.dataset.timestamp);
            if (timestamp) {
                element.textContent = this.formatRelativeTime(timestamp);
            }
        });
    }

    /**
     * 🧹 CLEANUP ACTIVITY HISTORY
     */
    cleanupActivityHistory() {
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        this.activityHistory = this.activityHistory.filter(
            activity => activity.timestamp.getTime() > cutoff
        );
        console.log(`🧹 Cleaned activity history: ${this.activityHistory.length} items remaining`);
    }

    /**
     * 🎨 UTILITY FUNCTIONS
     */
    formatUptime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    formatRelativeTime(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    getActivityIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    getAlertIcon(type) {
        const icons = {
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>',
            success: '<i class="fas fa-check-circle"></i>',
            danger: '<i class="fas fa-times-circle"></i>'
        };
        return icons[type] || '<i class="fas fa-info-circle"></i>';
    }
}

/**
 * 🗂️ TAB SWITCHING FUNCTIONALITY
 */
function switchTab(category, tab) {
    // Hide all tab contents for this category
    const contents = document.querySelectorAll(`[id^="${category}-"]`);
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll(`[onclick*="${category}"]`);
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${category}-${tab}`).classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

/**
 * 🚀 INITIALIZE APPLICATION
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏗️ EXTRAORDINARY Construction Syndicate GUI Loading...');
    window.gui = new ExtraordinaryConstructionGUI();
});

/**
 * 🌍 GLOBAL ERROR HANDLER
 */
window.addEventListener('error', (event) => {
    console.error('💥 Global error:', event.error);
    if (window.gui) {
        window.gui.addActivity(`💥 Frontend error: ${event.error.message}`, 'error');
    }
});

console.log('📋 EXTRAORDINARY Construction Syndicate GUI script loaded!');
