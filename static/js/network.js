
// Network configuration for deployment
document.addEventListener('DOMContentLoaded', function() {
    // References to form inputs
    const networkSection = document.getElementById('networkSection');
    if (!networkSection) return; // Only run on pages with network section
    
    const ipInput = document.getElementById('deploymentIP');
    const gatewayInput = document.getElementById('deploymentGateway');
    const dnsInput = document.getElementById('deploymentDNS');
    const bridgeSelect = document.getElementById('deploymentBridge');
    const vlanToggle = document.getElementById('enableVLAN');
    const vlanInput = document.getElementById('deploymentVLAN');
    const firewallCheckbox = document.getElementById('enableFirewall');
    
    // References to preview elements
    const previewIP = document.getElementById('previewIP');
    const previewGateway = document.getElementById('previewGateway');
    const previewDNS = document.getElementById('previewDNS');
    const previewBridge = document.getElementById('previewBridge');
    const previewVLAN = document.getElementById('previewVLAN');
    const previewFirewall = document.getElementById('previewFirewall');
    
    // VLAN toggle functionality
    if (vlanToggle && vlanInput) {
        // Initially hide VLAN input if toggle is off
        vlanInput.parentElement.style.display = vlanToggle.checked ? 'block' : 'none';
        
        vlanToggle.addEventListener('change', function() {
            vlanInput.parentElement.style.display = this.checked ? 'block' : 'none';
            if (!this.checked) {
                vlanInput.value = '';
                updateNetworkPreview();
            }
        });
    }
    
    // Update preview when form values change
    function updateNetworkPreview() {
        if (!previewIP) return; // Skip if preview elements aren't on the page
        
        // IP Address
        previewIP.textContent = ipInput?.value || 'DHCP';
        
        // Gateway
        previewGateway.textContent = gatewayInput?.value || '---';
        
        // DNS Servers
        previewDNS.textContent = dnsInput?.value || '---';
        
        // Network Bridge
        previewBridge.textContent = bridgeSelect?.value || 'vmbr0';
        
        // VLAN Tag
        if (vlanToggle?.checked && vlanInput?.value) {
            previewVLAN.textContent = vlanInput.value;
        } else {
            previewVLAN.textContent = 'None';
        }
        
        // Firewall
        if (previewFirewall) {
            previewFirewall.textContent = firewallCheckbox?.checked ? 'Enabled' : 'Disabled';
        }
    }
    
    // Attach event listeners to form elements
    const formElements = [ipInput, gatewayInput, dnsInput, bridgeSelect, vlanInput, firewallCheckbox, vlanToggle];
    
    formElements.forEach(element => {
        if (element) {
            element.addEventListener('change', updateNetworkPreview);
            element.addEventListener('input', updateNetworkPreview);
        }
    });
    
    // Initialize preview on page load
    updateNetworkPreview();
});
