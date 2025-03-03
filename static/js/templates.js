
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();
    
    // Handle template deploy button
    window.useTemplate = function(templateId) {
        // Redirect to new deployment page with template ID
        window.location.href = `/deployments/new?template=${encodeURIComponent(templateId)}`;
    };
    
    // Form validation for adding new templates
    const templateForm = document.getElementById('templateForm');
    if (templateForm) {
        templateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would normally submit the form data via AJAX
            // For now, we'll just show a success message
            alert('Template added successfully!');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTemplateModal'));
            modal.hide();
        });
    }
});
