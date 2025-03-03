
// Network configuration for deployment
document.addEventListener('DOMContentLoaded', function() {
    // References to form inputs
    const ipInput = document.getElementById('deploymentIP');
    const gatewayInput = document.getElementById('deploymentGateway');
    const dnsInput = document.getElementById('deploymentDNS');
    const bridgeSelect = document.getElementById('deploymentBridge');
    const vlanInput = document.getElementById('deploymentVLAN');
    const firewallCheckbox = document.getElementById('enableFirewall');
    
    // References to preview elements
    const previewIP = document.getElementById('previewIP');
    const previewGateway = document.getElementById('previewGateway');
    const previewDNS = document.getElementById('previewDNS');
    const previewBridge = document.getElementById('previewBridge');
    const previewVLAN = document.getElementById('previewVLAN');
    const previewFirewall = document.getElementById('previewFirewall');
    
    // Update preview when form values change
    function updateNetworkPreview() {
        // IP Address
        previewIP.textContent = ipInput.value || 'DHCP';
        
        // Gateway
        previewGateway.textContent = gatewayInput.value || '---';
        
        // DNS Servers
        previewDNS.textContent = dnsInput.value || '---';
        
        // Network Bridge
        previewBridge.textContent = bridgeSelect.value;
        
        // VLAN Tag
        previewVLAN.textContent = vlanInput.value || 'None';
        
        // Firewall Status
        previewFirewall.textContent = firewallCheckbox.checked ? 'Enabled' : 'Disabled';
    }
    
    // Add event listeners to form elements
    if (ipInput) ipInput.addEventListener('input', updateNetworkPreview);
    if (gatewayInput) gatewayInput.addEventListener('input', updateNetworkPreview);
    if (dnsInput) dnsInput.addEventListener('input', updateNetworkPreview);
    if (bridgeSelect) bridgeSelect.addEventListener('change', updateNetworkPreview);
    if (vlanInput) vlanInput.addEventListener('input', updateNetworkPreview);
    if (firewallCheckbox) firewallCheckbox.addEventListener('change', updateNetworkPreview);
    
    // Initialize preview
    updateNetworkPreview();
});
