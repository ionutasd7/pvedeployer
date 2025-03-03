document.addEventListener('DOMContentLoaded', function() {
    const deployForm = document.getElementById('deployForm');
    const deployBtn = document.getElementById('deployBtn');
    const deploySpinner = document.getElementById('deploySpinner');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    const templateSelect = deployForm.querySelector('[name="template"]');

    // Fetch available resources when page loads
    fetchResources();

    // Handle form submission
    deployForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Reset alerts
        errorAlert.classList.add('d-none');
        successAlert.classList.add('d-none');

        // Show loading state
        deployBtn.disabled = true;
        deploySpinner.classList.remove('d-none');

        try {
            const formData = {
                type: deployForm.type.value,
                template: deployForm.template.value,
                name: deployForm.name.value,
                cpu: parseInt(deployForm.cpu.value),
                memory: parseInt(deployForm.memory.value),
                storage: parseInt(deployForm.storage.value)
            };

            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                successAlert.textContent = 'Deployment started successfully!';
                successAlert.classList.remove('d-none');
                deployForm.reset();
            } else {
                throw new Error(data.details || data.error || 'Deployment failed');
            }
        } catch (error) {
            errorAlert.innerHTML = `<strong>Error:</strong> ${error.message}`;
            if (error.message.includes("Could not connect")) {
                errorAlert.innerHTML += "<br><small>Tip: Make sure you're using the correct local IP address for your Proxmox server.</small>";
            }
            errorAlert.classList.remove('d-none');
        } finally {
            deployBtn.disabled = false;
            deploySpinner.classList.add('d-none');
        }
    });

    async function fetchResources() {
        try {
            const response = await fetch('/api/resources');
            const data = await response.json();

            if (response.ok) {
                // Populate template dropdown
                templateSelect.innerHTML = data.templates
                    .map(template => `<option value="${template.volid}">${template.volid}</option>`)
                    .join('');
            } else {
                throw new Error(data.details || data.error || 'Failed to fetch resources');
            }
        } catch (error) {
            errorAlert.innerHTML = `<strong>Error:</strong> ${error.message}`;
            if (error.message.includes("Could not connect")) {
                errorAlert.innerHTML += "<br><small>Tip: Make sure you're using the correct local IP address for your Proxmox server.</small>";
            }
            errorAlert.classList.remove('d-none');
        }
    }
});