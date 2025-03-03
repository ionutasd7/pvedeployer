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