
/**
 * Dashboard JavaScript
 * Handles dashboard functionality, charts, stats and data loading
 */

// Dashboard class
class Dashboard {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
        this.autoRefreshEnabled = true;
        
        this.initializeUI();
        this.loadData();
        this.setupAutoRefresh();
    }
    
    // Initialize UI elements
    initializeUI() {
        // Set up refresh button
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }
        
        // Set up chart period buttons
        const periodButtons = document.querySelectorAll('[data-period]');
        periodButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                periodButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Load chart data for selected period
                this.loadChartData(e.target.dataset.period);
            });
        });
        
        // Initialize chart
        this.initializeCharts();
    }
    
    // Initialize charts
    initializeCharts() {
        const resourceChartCanvas = document.getElementById('resourceChart');
        if (resourceChartCanvas) {
            this.charts.resourceChart = new Chart(resourceChartCanvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'CPU Usage (%)',
                            data: [],
                            borderColor: 'rgba(94, 114, 228, 1)',
                            backgroundColor: 'rgba(94, 114, 228, 0.1)',
                            borderWidth: 2,
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Memory Usage (%)',
                            data: [],
                            borderColor: 'rgba(45, 206, 137, 1)',
                            backgroundColor: 'rgba(45, 206, 137, 0.1)',
                            borderWidth: 2,
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }
    }
    
    // Load all dashboard data
    loadData() {
        this.loadStats();
        this.loadNodeStatus();
        this.loadRecentDeployments();
        this.loadChartData('day'); // Default to daily chart
    }
    
    // Load dashboard statistics
    loadStats() {
        // In a real app, this would be an API call
        // For demo purposes, using mocked data
        setTimeout(() => {
            const stats = {
                deployments: {
                    total: 12,
                    active: 8
                },
                nodes: {
                    total: 3,
                    cores: 48
                },
                templates: {
                    total: 9,
                    vm: 5,
                    lxc: 4
                },
                scripts: {
                    total: 6,
                    runs: 42
                }
            };
            
            this.updateStatsUI(stats);
        }, 500);
    }
    
    // Update stats UI elements
    updateStatsUI(stats) {
        // Update deployment stats
        document.getElementById('totalDeployments').textContent = stats.deployments.total;
        document.getElementById('activeDeployments').innerHTML = `<i class="bi bi-check-circle me-1"></i> ${stats.deployments.active} Active`;
        
        // Update node stats
        document.getElementById('totalNodes').textContent = stats.nodes.total;
        document.getElementById('totalCores').innerHTML = `<i class="bi bi-cpu me-1"></i> ${stats.nodes.cores} Cores`;
        
        // Update template stats
        document.getElementById('totalTemplates').textContent = stats.templates.total;
        document.getElementById('vmTemplates').innerHTML = `<i class="bi bi-pc-display me-1"></i> ${stats.templates.vm} VM`;
        document.getElementById('lxcTemplates').innerHTML = `<i class="bi bi-box me-1"></i> ${stats.templates.lxc} LXC`;
        
        // Update script stats
        document.getElementById('totalScripts').textContent = stats.scripts.total;
        document.getElementById('scriptRuns').innerHTML = `<i class="bi bi-play me-1"></i> ${stats.scripts.runs} Executions`;
    }
    
    // Load node status data
    loadNodeStatus() {
        // In a real app, this would be an API call
        // For demo purposes, using mocked data
        setTimeout(() => {
            const nodes = [
                { id: 1, name: 'cpu-01', address: '192.168.1.101', status: 'online', load: 32, memory: 45 },
                { id: 2, name: 'cpu-02', address: '192.168.1.102', status: 'online', load: 18, memory: 56 },
                { id: 3, name: 'storage-01', address: '192.168.1.103', status: 'online', load: 8, memory: 24 }
            ];
            
            this.updateNodeStatusUI(nodes);
        }, 700);
    }
    
    // Update node status UI
    updateNodeStatusUI(nodes) {
        const nodeStatusList = document.getElementById('nodeStatusList');
        if (!nodeStatusList) return;
        
        // Clear loading placeholders
        nodeStatusList.innerHTML = '';
        
        // Add node items
        nodes.forEach(node => {
            let statusClass, statusIcon;
            
            switch (node.status) {
                case 'online':
                    statusClass = 'success';
                    statusIcon = 'check-circle-fill';
                    break;
                case 'offline':
                    statusClass = 'danger';
                    statusIcon = 'x-circle-fill';
                    break;
                case 'warning':
                    statusClass = 'warning';
                    statusIcon = 'exclamation-triangle-fill';
                    break;
                default:
                    statusClass = 'secondary';
                    statusIcon = 'question-circle-fill';
            }
            
            const nodeItem = document.createElement('div');
            nodeItem.className = 'list-group-item';
            nodeItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-${statusIcon} text-${statusClass} me-2"></i>
                            <strong>${node.name}</strong>
                        </div>
                        <small class="text-muted">${node.address}</small>
                    </div>
                    <div class="text-end">
                        <div class="small text-muted">CPU: ${node.load}%</div>
                        <div class="small text-muted">RAM: ${node.memory}%</div>
                    </div>
                </div>
            `;
            
            nodeStatusList.appendChild(nodeItem);
        });
    }
    
    // Load recent deployments
    loadRecentDeployments() {
        // In a real app, this would be an API call
        // For demo purposes, using mocked data
        setTimeout(() => {
            const deployments = [
                { id: 1, name: 'web-server-01', type: 'vm', status: 'running', created: '2025-03-02T14:23:12Z' },
                { id: 2, name: 'db-server-01', type: 'vm', status: 'running', created: '2025-03-01T10:15:22Z' },
                { id: 3, name: 'cache-01', type: 'lxc', status: 'stopped', created: '2025-02-28T16:42:30Z' },
                { id: 4, name: 'monitoring', type: 'lxc', status: 'running', created: '2025-02-27T09:12:45Z' }
            ];
            
            this.updateRecentDeploymentsUI(deployments);
        }, 900);
    }
    
    // Update recent deployments UI
    updateRecentDeploymentsUI(deployments) {
        const deploymentsList = document.getElementById('recentDeploymentsList');
        if (!deploymentsList) return;
        
        // Clear loading placeholders
        deploymentsList.innerHTML = '';
        
        // Format date function
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        
        // Add deployment items
        deployments.forEach(deployment => {
            let statusClass, typeIcon;
            
            switch (deployment.status) {
                case 'running':
                    statusClass = 'success';
                    break;
                case 'stopped':
                    statusClass = 'danger';
                    break;
                case 'creating':
                    statusClass = 'warning';
                    break;
                default:
                    statusClass = 'secondary';
            }
            
            typeIcon = deployment.type === 'vm' ? 'pc-display' : 'box';
            
            const deploymentItem = document.createElement('div');
            deploymentItem.className = 'list-group-item';
            deploymentItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-${typeIcon} me-2"></i>
                            <a href="/deployments/${deployment.id}" class="text-decoration-none">${deployment.name}</a>
                        </div>
                        <small class="text-muted">Created: ${formatDate(deployment.created)}</small>
                    </div>
                    <span class="badge bg-${statusClass}">${deployment.status}</span>
                </div>
            `;
            
            deploymentsList.appendChild(deploymentItem);
        });
    }
    
    // Load chart data for specified period
    loadChartData(period) {
        // In a real app, this would be an API call with the period parameter
        // For demo purposes, using mocked data
        
        let labels, cpuData, memoryData;
        
        switch (period) {
            case 'day':
                labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
                cpuData = [15, 12, 14, 32, 45, 38, 25, 18];
                memoryData = [25, 28, 28, 42, 50, 48, 35, 30];
                break;
                
            case 'week':
                labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                cpuData = [22, 35, 28, 15, 42, 38, 25];
                memoryData = [35, 45, 38, 30, 55, 48, 40];
                break;
                
            case 'month':
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                cpuData = [28, 35, 32, 25];
                memoryData = [40, 48, 45, 38];
                break;
                
            default:
                labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
                cpuData = [15, 12, 14, 32, 45, 38, 25, 18];
                memoryData = [25, 28, 28, 42, 50, 48, 35, 30];
        }
        
        // Update chart data
        this.updateChartData(labels, cpuData, memoryData);
    }
    
    // Update chart with new data
    updateChartData(labels, cpuData, memoryData) {
        if (!this.charts.resourceChart) return;
        
        const chart = this.charts.resourceChart;
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = cpuData;
        chart.data.datasets[1].data = memoryData;
        
        chart.update();
    }
    
    // Set up auto refresh
    setupAutoRefresh() {
        // Check if auto refresh is enabled in local storage
        const savedAutoRefresh = localStorage.getItem('dashboardAutoRefresh');
        if (savedAutoRefresh !== null) {
            this.autoRefreshEnabled = savedAutoRefresh === 'true';
        }
        
        // Update UI toggle if exists
        const autoRefreshToggle = document.getElementById('autoRefreshToggle');
        if (autoRefreshToggle) {
            autoRefreshToggle.checked = this.autoRefreshEnabled;
            
            // Add event listener
            autoRefreshToggle.addEventListener('change', (e) => {
                this.autoRefreshEnabled = e.target.checked;
                localStorage.setItem('dashboardAutoRefresh', this.autoRefreshEnabled);
                
                if (this.autoRefreshEnabled) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }
        
        // Start auto refresh if enabled
        if (this.autoRefreshEnabled) {
            this.startAutoRefresh();
        }
    }
    
    // Start auto refresh
    startAutoRefresh() {
        // Clear any existing interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Set up new interval - refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 30000);
    }
    
    // Stop auto refresh
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new Dashboard();
});
