
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
