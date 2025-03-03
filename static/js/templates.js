
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
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();
    
    // Refresh templates button
    const refreshBtn = document.getElementById('refreshTemplatesBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const originalContent = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';
            refreshBtn.disabled = true;
            
            // Simulate refresh delay in dev mode
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });
    }
    
    // Add hover effect to template cards
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow');
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow');
            this.style.transform = 'translateY(0)';
        });
    });
});
