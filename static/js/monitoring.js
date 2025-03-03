
// Monitoring dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // In development mode, this would fetch mock data
    // In production, it would connect to the real Proxmox API
    
    function fetchMonitoringData() {
        // For development, we'll just simulate data updates
        // This would be replaced with a real API call in production
        
        simulateDataUpdates();
        
        // In production:
        /*
        fetch('/api/monitoring/status')
            .then(response => response.json())
            .then(data => {
                updateDashboard(data);
            })
            .catch(error => {
                console.error('Error fetching monitoring data:', error);
                // Show error message on dashboard
                document.getElementById('errorMessage').textContent = 'Failed to fetch monitoring data';
                document.getElementById('errorAlert').classList.remove('d-none');
            });
        */
    }
    
    function simulateDataUpdates() {
        // CPU usage value randomly changes between 20-80%
        const cpuValues = document.querySelectorAll('.cpu-value');
        cpuValues.forEach(element => {
            const newValue = Math.floor(Math.random() * 60) + 20;
            const gauge = element.closest('td').querySelector('.gauge-fill');
            
            element.textContent = `${newValue}%`;
            gauge.style.width = `${newValue}%`;
            
            // Update gauge color based on usage
            gauge.classList.remove('gauge-low', 'gauge-medium', 'gauge-high');
            if (newValue < 50) {
                gauge.classList.add('gauge-low');
            } else if (newValue < 80) {
                gauge.classList.add('gauge-medium');
            } else {
                gauge.classList.add('gauge-high');
            }
        });
        
        // Memory usage value randomly changes
        const memValues = document.querySelectorAll('.mem-value');
        memValues.forEach(element => {
            const newValue = Math.floor(Math.random() * 60) + 20;
            const gauge = element.closest('td').querySelector('.gauge-fill');
            
            element.textContent = `${newValue}%`;
            gauge.style.width = `${newValue}%`;
            
            // Update gauge color based on usage
            gauge.classList.remove('gauge-low', 'gauge-medium', 'gauge-high');
            if (newValue < 50) {
                gauge.classList.add('gauge-low');
            } else if (newValue < 80) {
                gauge.classList.add('gauge-medium');
            } else {
                gauge.classList.add('gauge-high');
            }
        });
    }
    
    // Initial fetch
    if (window.location.href.includes('monitoring')) {
        fetchMonitoringData();
        
        // Refresh data every 30 seconds
        setInterval(fetchMonitoringData, 30000);
    }
});
// Monitoring dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initializeCharts();
    
    // In development mode, this would fetch mock data
    // In production, it would connect to the real Proxmox API
    
    // Initial data load
    fetchMonitoringData();
    
    // Set up periodic refresh every 30 seconds
    setInterval(fetchMonitoringData, 30000);
});

function initializeCharts() {
    // CPU Usage Chart
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    window.cpuChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
            datasets: [{
                label: 'Cluster CPU Usage (%)',
                data: [28, 32, 45, 76, 56, 48, 52],
                borderColor: '#0dcaf0',
                backgroundColor: 'rgba(13, 202, 240, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
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

    // Memory Usage Chart
    const memoryCtx = document.getElementById('memoryChart').getContext('2d');
    window.memoryChart = new Chart(memoryCtx, {
        type: 'line',
        data: {
            labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
            datasets: [{
                label: 'Cluster Memory Usage (%)',
                data: [42, 45, 50, 62, 68, 71, 65],
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
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
}

function fetchMonitoringData() {
    // For development, we'll simulate data updates
    simulateDataUpdates();
    
    // In production, this would be a real API call:
    /*
    fetch('/api/monitoring/status')
        .then(response => response.json())
        .then(data => {
            updateDashboard(data);
        })
        .catch(error => {
            console.error('Error fetching monitoring data:', error);
        });
    */
}

function simulateDataUpdates() {
    // Update summary statistics with random variations
    updateSummaryStats();
    
    // Update chart data
    updateCharts();
    
    // Update VMs table with random data
    updateVMsTable();
    
    // Refresh the feather icons
    feather.replace();
}

function updateSummaryStats() {
    // Simulate some fluctuations in the summary data
    document.getElementById('healthyNodes').textContent = Math.random() > 0.9 ? '2/3' : '3/3';
    document.getElementById('healthyVMs').textContent = Math.random() > 0.7 ? '12/14' : '14/14';
    document.getElementById('healthyContainers').textContent = Math.random() > 0.95 ? '7/8' : '8/8';
    document.getElementById('healthyStorage').textContent = '5/5';
}

function updateCharts() {
    // Generate new random data points for CPU chart
    const newCpuData = [];
    for (let i = 0; i < 7; i++) {
        newCpuData.push(Math.floor(Math.random() * 35) + 30); // 30-65% CPU usage
    }
    window.cpuChart.data.datasets[0].data = newCpuData;
    window.cpuChart.update();
    
    // Generate new random data points for memory chart
    const newMemoryData = [];
    for (let i = 0; i < 7; i++) {
        newMemoryData.push(Math.floor(Math.random() * 25) + 45); // 45-70% memory usage
    }
    window.memoryChart.data.datasets[0].data = newMemoryData;
    window.memoryChart.update();
}

function updateVMsTable() {
    // Get all CPU value elements in the table
    const rows = document.querySelectorAll('#vmsTable tr');
    
    rows.forEach(row => {
        // Update CPU usage
        const cpuCell = row.querySelector('td:nth-child(6)');
        if (cpuCell) {
            const cpuSpan = cpuCell.querySelector('span');
            const cpuGauge = cpuCell.querySelector('.gauge-fill');
            
            const newCpuValue = Math.floor(Math.random() * 75) + 15; // 15-90%
            cpuSpan.textContent = `${newCpuValue}%`;
            
            // Update gauge
            cpuGauge.style.width = `${newCpuValue}%`;
            cpuGauge.classList.remove('gauge-low', 'gauge-medium', 'gauge-high');
            
            if (newCpuValue < 50) {
                cpuGauge.classList.add('gauge-low');
            } else if (newCpuValue < 80) {
                cpuGauge.classList.add('gauge-medium');
            } else {
                cpuGauge.classList.add('gauge-high');
            }
        }
        
        // Update Memory usage
        const memoryCell = row.querySelector('td:nth-child(7)');
        if (memoryCell) {
            const memorySpan = memoryCell.querySelector('span');
            const memoryGauge = memoryCell.querySelector('.gauge-fill');
            
            const newMemoryValue = Math.floor(Math.random() * 70) + 25; // 25-95%
            memorySpan.textContent = `${newMemoryValue}%`;
            
            // Update gauge
            memoryGauge.style.width = `${newMemoryValue}%`;
            memoryGauge.classList.remove('gauge-low', 'gauge-medium', 'gauge-high');
            
            if (newMemoryValue < 50) {
                memoryGauge.classList.add('gauge-low');
            } else if (newMemoryValue < 80) {
                memoryGauge.classList.add('gauge-medium');
            } else {
                memoryGauge.classList.add('gauge-high');
            }
        }
        
        // Randomly update status
        const statusCell = row.querySelector('td:nth-child(5)');
        if (statusCell && Math.random() > 0.9) {
            const statusBadge = statusCell.querySelector('.badge');
            const isDown = statusBadge.textContent === 'Error';
            
            if (isDown && Math.random() > 0.5) {
                statusBadge.textContent = 'Running';
                statusBadge.classList.remove('bg-danger');
                statusBadge.classList.add('bg-success');
            } else if (!isDown && Math.random() > 0.95) {
                statusBadge.textContent = 'Warning';
                statusBadge.classList.remove('bg-success');
                statusBadge.classList.add('bg-warning');
            }
        }
    });
}
