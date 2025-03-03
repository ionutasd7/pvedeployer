/**
 * Network Configuration Manager for ProxDeployer
 */
class NetworkManager {
    constructor() {
        this.dhcpToggle = document.getElementById('dhcpToggle');
        this.staticIpConfig = document.getElementById('staticIpConfig');
        this.ipInput = document.getElementById('deploymentIP');
        this.gatewayInput = document.getElementById('deploymentGateway');
        this.dnsInput = document.getElementById('deploymentDNS');
        this.bridgeSelect = document.getElementById('deploymentBridge');
        this.vlanToggle = document.getElementById('enableVLAN');
        this.vlanConfig = document.getElementById('vlanConfig');
        this.vlanInput = document.getElementById('deploymentVLAN');
        this.firewallToggle = document.getElementById('enableFirewall');
        this.firewallConfig = document.getElementById('firewallConfig');
        this.bandwidthInRange = document.getElementById('bandwidthIn');
        this.bandwidthOutRange = document.getElementById('bandwidthOut');

        this.initEventListeners();
        this.updateNetworkPreview();
    }

    initEventListeners() {
        if (this.dhcpToggle) {
            this.dhcpToggle.addEventListener('change', () => {
                this.toggleStaticIp();
                this.updateNetworkPreview();
            });
        }

        if (this.vlanToggle) {
            this.vlanToggle.addEventListener('change', () => {
                this.toggleVlan();
                this.updateNetworkPreview();
            });
        }

        if (this.firewallToggle) {
            this.firewallToggle.addEventListener('change', () => {
                this.toggleFirewall();
                this.updateNetworkPreview();
            });
        }

        // Add input event listeners
        const networkInputs = [
            this.ipInput, this.gatewayInput, this.dnsInput, 
            this.vlanInput, this.bandwidthInRange, this.bandwidthOutRange
        ];

        networkInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.updateNetworkPreview());
            }
        });

        if (this.bridgeSelect) {
            this.bridgeSelect.addEventListener('change', () => this.updateNetworkPreview());
        }

        // Initialize static IP visibility
        if (this.dhcpToggle && this.staticIpConfig) {
            this.toggleStaticIp();
        }

        // Initialize VLAN visibility
        if (this.vlanToggle && this.vlanConfig) {
            this.toggleVlan();
        }

        // Initialize Firewall visibility
        if (this.firewallToggle && this.firewallConfig) {
            this.toggleFirewall();
        }
    }

    toggleStaticIp() {
        if (this.dhcpToggle && this.staticIpConfig) {
            this.staticIpConfig.style.display = this.dhcpToggle.checked ? 'none' : 'block';
        }
    }

    toggleVlan() {
        if (this.vlanToggle && this.vlanConfig) {
            this.vlanConfig.classList.toggle('d-none', !this.vlanToggle.checked);
        }
    }

    toggleFirewall() {
        if (this.firewallToggle && this.firewallConfig) {
            this.firewallConfig.classList.toggle('d-none', !this.firewallToggle.checked);
        }
    }

    updateNetworkPreview() {
        const previewNetwork = document.getElementById('previewNetwork');
        const ipPreviewRow = document.getElementById('ipPreviewRow');
        const previewIP = document.getElementById('previewIP');
        const previewFeatures = document.getElementById('previewFeatures');

        if (!previewNetwork || !ipPreviewRow || !previewIP || !previewFeatures) {
            return;
        }

        // Update network display
        if (this.dhcpToggle && this.dhcpToggle.checked) {
            previewNetwork.textContent = 'DHCP';
            ipPreviewRow.style.display = 'none';
        } else {
            const bridge = this.bridgeSelect ? this.bridgeSelect.value : 'vmbr0';
            previewNetwork.textContent = `Static (${bridge})`;
            ipPreviewRow.style.display = 'flex';

            if (this.ipInput && this.ipInput.value) {
                previewIP.textContent = this.ipInput.value;
            } else {
                previewIP.textContent = 'Not specified';
            }
        }

        // Update features badges
        this.updateFeatureBadges(previewFeatures);
    }

    updateFeatureBadges(previewFeatures) {
        let features = [];

        // VLAN Badge
        if (this.vlanToggle && this.vlanToggle.checked && this.vlanInput && this.vlanInput.value) {
            features.push(`<span class="badge bg-info mb-1 me-1">VLAN ${this.vlanInput.value}</span>`);
        }

        // Firewall Badge
        if (this.firewallToggle && this.firewallToggle.checked) {
            features.push(`<span class="badge bg-warning mb-1 me-1">Firewall</span>`);
        }

        // Bandwidth Limits Badge
        const inValue = this.bandwidthInRange ? parseInt(this.bandwidthInRange.value) : 0;
        const outValue = this.bandwidthOutRange ? parseInt(this.bandwidthOutRange.value) : 0;

        if (inValue > 0 || outValue > 0) {
            let limitText = '';
            if (inValue > 0 && outValue > 0) {
                limitText = `↓${inValue}Mbps/↑${outValue}Mbps`;
            } else if (inValue > 0) {
                limitText = `↓${inValue}Mbps`;
            } else {
                limitText = `↑${outValue}Mbps`;
            }
            features.push(`<span class="badge bg-danger mb-1 me-1">BW Limit: ${limitText}</span>`);
        }

        // Get existing badges
        const existingBadges = previewFeatures.innerHTML;
        const networkBadgeRegex = /(VLAN|Firewall|BW Limit)/;

        // Filter out network badges, keep others
        const otherBadges = Array.from(previewFeatures.querySelectorAll('.badge'))
            .filter(badge => !networkBadgeRegex.test(badge.textContent))
            .map(badge => badge.outerHTML);

        // Combine badges
        const allBadges = [...features, ...otherBadges];

        if (allBadges.length > 0) {
            previewFeatures.innerHTML = allBadges.join('');
        } else {
            previewFeatures.innerHTML = '<span class="badge bg-secondary mb-1 me-1">Default Settings</span>';
        }
    }

    // Validate IP address format
    validateIp(ip) {
        const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
        return ipPattern.test(ip);
    }

    // Get network configuration as JSON object
    getNetworkConfig() {
        const config = {
            dhcp: this.dhcpToggle ? this.dhcpToggle.checked : true,
            bridge: this.bridgeSelect ? this.bridgeSelect.value : 'vmbr0'
        };

        if (!config.dhcp) {
            config.ip = this.ipInput ? this.ipInput.value : '';
            config.gateway = this.gatewayInput ? this.gatewayInput.value : '';
            config.dns = this.dnsInput ? this.dnsInput.value : '';
        }

        if (this.vlanToggle && this.vlanToggle.checked) {
            config.vlan = this.vlanInput ? this.vlanInput.value : '';
        }

        if (this.firewallToggle && this.firewallToggle.checked) {
            config.firewall = {
                enabled: true,
                ssh: document.getElementById('firewallSSH') ? document.getElementById('firewallSSH').checked : true,
                http: document.getElementById('firewallHTTP') ? document.getElementById('firewallHTTP').checked : true,
                icmp: document.getElementById('firewallICMP') ? document.getElementById('firewallICMP').checked : true
            };
        }

        if (this.bandwidthInRange && parseInt(this.bandwidthInRange.value) > 0) {
            config.bandwidthIn = parseInt(this.bandwidthInRange.value);
        }

        if (this.bandwidthOutRange && parseInt(this.bandwidthOutRange.value) > 0) {
            config.bandwidthOut = parseInt(this.bandwidthOutRange.value);
        }

        return config;
    }
}

// Initialize network manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on pages with network configuration
    if (document.getElementById('network-tab')) {
        window.networkManager = new NetworkManager();
    }
});