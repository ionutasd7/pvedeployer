document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();

    // Get canvas elements
    const cpuChartCanvas = document.getElementById('cpuChart');
    const memoryChartCanvas = document.getElementById('memoryChart');
    const networkChartCanvas = document.getElementById('networkChart');
    const storageChartCanvas = document.getElementById('storageChart');

    // Sample data
    const timeLabels = Array.from({length: 12}, (_, i) => {
        const time = new Date();
        time.setMinutes(time.getMinutes() - (11-i)*5);
        return time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
    });

    // CPU Chart
    new Chart(cpuChartCanvas, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'CPU Usage (%)',
                data: [15, 18, 22, 25, 30, 35, 28, 25, 22, 20, 18, 15],
                borderColor: '#0dcaf0',
                backgroundColor: 'rgba(13, 202, 240, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });

    // Memory Chart
    new Chart(memoryChartCanvas, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Memory Usage (GB)',
                data: [24, 26, 28, 32, 36, 42, 40, 38, 34, 32, 30, 28],
                borderColor: '#6f42c1',
                backgroundColor: 'rgba(111, 66, 193, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' GB';
                        }
                    }
                }
            }
        }
    });

    // Network Chart
    new Chart(networkChartCanvas, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Incoming (MB/s)',
                    data: [5, 8, 12, 15, 18, 22, 25, 20, 15, 10, 8, 6],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Outgoing (MB/s)',
                    data: [3, 5, 7, 10, 12, 15, 18, 14, 10, 7, 5, 3],
                    borderColor: '#20c997',
                    backgroundColor: 'rgba(32, 201, 151, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' MB/s';
                        }
                    }
                }
            }
        }
    });

    // Storage Chart
    new Chart(storageChartCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Used', 'Free'],
            datasets: [{
                data: [3.0, 7.0],
                backgroundColor: ['#dc3545', '#20c997'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value} TB`;
                        }
                    }
                }
            }
        }
    });

    // Fetch node statuses
    function fetchNodeStatus() {
        // This would normally fetch from an API
        // For now, we'll just update the status indicators randomly

        const nodes = document.querySelectorAll('.node-status');
        nodes.forEach(node => {
            // Get a random number between 0 and 1
            const random = Math.random();

            // Update status based on random number
            if (random > 0.9) {
                node.className = 'node-status badge bg-warning';
                node.textContent = 'Warning';
            } else if (random > 0.8) {
                node.className = 'node-status badge bg-danger';
                node.textContent = 'Error';
            } else {
                node.className = 'node-status badge bg-success';
                node.textContent = 'Healthy';
            }
        });
    }

    // Initial fetch
    fetchNodeStatus();

    // Update every 30 seconds
    setInterval(fetchNodeStatus, 30000);
});
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();
    
    // Setup refresh button
    const refreshBtn = document.getElementById('refreshMetricsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const originalContent = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';
            refreshBtn.disabled = true;
            
            // Simulate refresh with new random data
            setTimeout(() => {
                refreshCharts();
                refreshBtn.innerHTML = originalContent;
                refreshBtn.disabled = false;
                
                // Show toast notification
                showToast('Metrics refreshed successfully!');
            }, 1000);
        });
    }
    
    // Initialize charts
    initializeCharts();
    
    // Toast notification function
    function showToast(message) {
        const toastContainer = document.createElement('div');
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">Monitoring</strong>
                <small>Just now</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        toastContainer.appendChild(toast);
        document.body.appendChild(toastContainer);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            document.body.removeChild(toastContainer);
        }, 3000);
    }
});

// Chart initialization
function initializeCharts() {
    // Generate time labels for the past 24 hours
    const timeLabels = [];
    for (let i = 24; i >= 0; i--) {
        const hour = i === 0 ? 'Now' : `${i}h ago`;
        timeLabels.push(hour);
    }
    
    // CPU Chart
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    window.cpuChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Production Node',
                    data: generateRandomData(5, 40, 25),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Development Node',
                    data: generateRandomData(5, 25, 25),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'CPU Usage (%)'
                    }
                }
            }
        }
    });
    
    // Memory Chart
    const memoryCtx = document.getElementById('memoryChart').getContext('2d');
    window.memoryChart = new Chart(memoryCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: 'Production Node',
                    data: generateRandomData(15, 50, 25),
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Development Node',
                    data: generateRandomData(10, 40, 25),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Memory Usage (%)'
                    }
                }
            }
        }
    });
    
    // Storage Chart
    const storageCtx = document.getElementById('storageChart').getContext('2d');
    window.storageChart = new Chart(storageCtx, {
        type: 'doughnut',
        data: {
            labels: ['Used', 'Free'],
            datasets: [
                {
                    data: [35, 65],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Storage Allocation (3.5TB / 10TB)'
                }
            },
            cutout: '70%'
        }
    });
    
    // Network Chart
    const networkCtx = document.getElementById('networkChart').getContext('2d');
    window.networkChart = new Chart(networkCtx, {
        type: 'bar',
        data: {
            labels: timeLabels.filter((_, i) => i % 2 === 0),
            datasets: [
                {
                    label: 'Network In (MB/s)',
                    data: generateRandomData(5, 45, 13),
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderWidth: 1
                },
                {
                    label: 'Network Out (MB/s)',
                    data: generateRandomData(10, 60, 13),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Data Transfer (MB/s)'
                    }
                }
            }
        }
    });
}

// Generate random data for charts
function generateRandomData(min, max, count) {
    return Array.from({length: count}, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// Refresh charts with new random data
function refreshCharts() {
    // Update CPU chart
    window.cpuChart.data.datasets[0].data = generateRandomData(5, 40, 25);
    window.cpuChart.data.datasets[1].data = generateRandomData(5, 25, 25);
    window.cpuChart.update();
    
    // Update Memory chart
    window.memoryChart.data.datasets[0].data = generateRandomData(15, 50, 25);
    window.memoryChart.data.datasets[1].data = generateRandomData(10, 40, 25);
    window.memoryChart.update();
    
    // Update Storage chart
    const storageUsed = Math.floor(Math.random() * 20) + 25; // 25-45%
    window.storageChart.data.datasets[0].data = [storageUsed, 100 - storageUsed];
    window.storageChart.options.plugins.title.text = `Storage Allocation (${(storageUsed/10).toFixed(1)}TB / 10TB)`;
    window.storageChart.update();
    
    // Update Network chart
    window.networkChart.data.datasets[0].data = generateRandomData(5, 45, 13);
    window.networkChart.data.datasets[1].data = generateRandomData(10, 60, 13);
    window.networkChart.update();
}
