
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();
    
    // Create CPU usage chart
    const cpuCtx = document.getElementById('cpuUsageChart').getContext('2d');
    const cpuChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => `${i*10} min ago`).reverse(),
            datasets: [{
                label: 'CPU Usage (%)',
                data: generateRandomData(30, 80, 10),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Create Memory usage chart
    const memoryCtx = document.getElementById('memoryUsageChart').getContext('2d');
    const memoryChart = new Chart(memoryCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => `${i*10} min ago`).reverse(),
            datasets: [{
                label: 'Memory Usage (%)',
                data: generateRandomData(40, 75, 10),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Generate random data for demo purposes
    function generateRandomData(min, max, count) {
        return Array.from({length: count}, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }
    
    // Update charts every 30 seconds with new random data
    setInterval(() => {
        cpuChart.data.datasets[0].data = generateRandomData(30, 80, 10);
        cpuChart.update();
        
        memoryChart.data.datasets[0].data = generateRandomData(40, 75, 10);
        memoryChart.update();
    }, 30000);
});
