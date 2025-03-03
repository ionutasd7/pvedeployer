document.addEventListener('DOMContentLoaded', function() {
    const deployForm = document.getElementById('deployForm');
    const deployBtn = document.getElementById('deployBtn');
    const deploySpinner = document.getElementById('deploySpinner');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    const templateSelect = deployForm.querySelector('[name="template"]');
    const storageSelect = deployForm.querySelector('[name="storage_location"]');
    const recommendedNodePanel = document.querySelector('.recommended-node-panel');
    const nodeRecommendation = document.getElementById('nodeRecommendation');

    // Fetch initial data when page loads
    Promise.all([
        fetchResources(),
        fetchNodeRecommendation()
    ]).catch(error => {
        showError(error);
    });

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
                ip_address: deployForm.ip_address.value,
                cpu: parseInt(deployForm.cpu.value),
                memory: parseInt(deployForm.memory.value),
                storage: parseInt(deployForm.storage.value),
                storage_location: deployForm.storage_location.value,
                tags: deployForm.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag)
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
                showSuccess('Deployment started successfully!');
                deployForm.reset();
                // Refresh recommendations after deployment
                await fetchNodeRecommendation();
            } else {
                throw new Error(data.details || data.error || 'Deployment failed');
            }
        } catch (error) {
            showError(error);
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

                // Populate storage dropdown
                if (data.storages) {
                    storageSelect.innerHTML = data.storages
                        .map(storage => `<option value="${storage.storage}">${storage.storage} (${storage.type})</option>`)
                        .join('');
                }
            } else {
                throw new Error(data.details || data.error || 'Failed to fetch resources');
            }
        } catch (error) {
            showError(error);
        }
    }

    async function fetchNodeRecommendation() {
        try {
            const response = await fetch('/nodes/recommend');
            const data = await response.json();

            if (response.ok && data.recommended_node) {
                recommendedNodePanel.classList.remove('d-none');
                nodeRecommendation.innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <strong>${data.name}</strong>
                            <div class="small text-muted">
                                Available Resources: ${Math.round(data.available_resources * 100)}%
                            </div>
                        </div>
                        <div class="ms-3">
                            <div class="badge bg-success">Recommended</div>
                        </div>
                    </div>
                `;
            } else {
                recommendedNodePanel.classList.add('d-none');
            }
        } catch (error) {
            console.error('Failed to fetch node recommendation:', error);
            recommendedNodePanel.classList.add('d-none');
        }
    }

    function showError(error) {
        errorAlert.innerHTML = `<strong>Error:</strong> ${error.message}`;
        if (error.message.includes("Could not connect")) {
            errorAlert.innerHTML += "<br><small>Tip: Make sure you're using the correct local IP address for your Proxmox server.</small>";
        }
        errorAlert.classList.remove('d-none');
    }

    function showSuccess(message) {
        successAlert.textContent = message;
        successAlert.classList.remove('d-none');
    }
});