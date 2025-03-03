import requests
import urllib3
import logging
from urllib3.exceptions import InsecureRequestWarning

# Disable SSL warning but log a warning message instead
urllib3.disable_warnings(InsecureRequestWarning)
logger = logging.getLogger(__name__)

class ProxmoxAPI:
    def __init__(self, host, user, password, verify_ssl=False, timeout=10):
        self.host = host
        self.user = user
        self.password = password
        self.verify_ssl = verify_ssl
        self.timeout = timeout
        self.token = None
        self.base_url = f"https://{host}:8006/api2/json"

        if not verify_ssl:
            logger.warning("SSL verification is disabled. This is acceptable for LAN connections but not recommended for WAN.")

    def _authenticate(self):
        """Authenticate with Proxmox API"""
        auth_url = f"{self.base_url}/access/ticket"
        try:
            response = requests.post(
                auth_url,
                data={
                    "username": self.user,
                    "password": self.password
                },
                verify=self.verify_ssl,
                timeout=self.timeout
            )
            if response.ok:
                data = response.json()['data']
                self.token = {
                    'CSRFPreventionToken': data['CSRFPreventionToken'],
                    'ticket': data['ticket']
                }
            else:
                error_msg = response.json().get('errors', {}).get('message', 'Unknown error')
                raise Exception(f"Authentication failed: {error_msg}")
        except requests.exceptions.ConnectTimeout:
            raise Exception(f"Connection timed out. Please check if {self.host} is accessible on your network.")
        except requests.exceptions.ConnectionError:
            raise Exception(f"Could not connect to {self.host}. Please verify the hostname/IP and ensure the Proxmox server is running and accessible.")
        except Exception as e:
            raise Exception(f"Authentication error: {str(e)}")

    def _make_request(self, method, endpoint, data=None):
        """Make authenticated request to Proxmox API"""
        if not self.token:
            self._authenticate()

        headers = {
            'CSRFPreventionToken': self.token['CSRFPreventionToken'],
            'Cookie': f'PVEAuthCookie={self.token["ticket"]}'
        }

        url = f"{self.base_url}/{endpoint}"
        try:
            response = requests.request(
                method,
                url,
                headers=headers,
                json=data if method in ['POST', 'PUT'] else None,
                verify=self.verify_ssl,
                timeout=self.timeout
            )

            if response.ok:
                return response.json().get('data', {})
            error_msg = response.json().get('errors', {}).get('message', 'Unknown error')
            raise Exception(f"API request failed: {error_msg}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error while accessing {endpoint}: {str(e)}")

    def get_node_status(self, node):
        """Get detailed node status including CPU, memory, and storage metrics"""
        return self._make_request('GET', f'nodes/{node}/status')

    def get_node_storage_status(self, node):
        """Get detailed storage information for a node"""
        storages = self._make_request('GET', f'nodes/{node}/storage')
        detailed_storage = []

        for storage in storages:
            storage_details = self._make_request('GET', f'nodes/{node}/storage/{storage["storage"]}/status')
            detailed_storage.append({
                **storage,
                'status': storage_details
            })

        return detailed_storage

    def get_node_rrd_data(self, node, timeframe='hour'):
        """Get RRD metrics for CPU, memory, and network"""
        return self._make_request('GET', f'nodes/{node}/rrddata', {
            'timeframe': timeframe
        })

    def get_resources(self):
        """Get available resources from Proxmox with detailed metrics"""
        try:
            # First get the node list
            nodes = self._make_request('GET', 'nodes')
            if not nodes:
                raise Exception("No Proxmox nodes found")

            detailed_resources = {
                'nodes': [],
                'templates': [],
                'storages': [],
                'networks': []
            }

            # Collect detailed metrics for each node
            for node in nodes:
                node_name = node['node']

                # Get detailed node status
                status = self.get_node_status(node_name)

                # Get storage information
                storage_info = self.get_node_storage_status(node_name)

                # Get performance metrics
                metrics = self.get_node_rrd_data(node_name)

                detailed_resources['nodes'].append({
                    **node,
                    'status': status,
                    'storage_info': storage_info,
                    'metrics': metrics
                })

                # Collect templates
                templates = self._make_request('GET', f'nodes/{node_name}/storage/local/content')
                detailed_resources['templates'].extend(templates)

                # Get network information
                networks = self._make_request('GET', f'nodes/{node_name}/network')
                detailed_resources['networks'].extend(networks)

                # Get storage pools
                storages = self._make_request('GET', f'nodes/{node_name}/storage')
                detailed_resources['storages'].extend(storages)

            return detailed_resources
        except Exception as e:
            raise Exception(f"Failed to fetch resources: {str(e)}")

    def deploy_container(self, type, template, name, cpu, memory, storage, node=None, ip_config=None, tags=None):
        """Deploy a new container or VM with enhanced configuration"""
        try:
            if not node:
                # Get the first available node
                nodes = self._make_request('GET', 'nodes')
                if not nodes:
                    raise Exception("No Proxmox nodes found")
                node = nodes[0]['node']

            data = {
                'ostemplate' if type == 'lxc' else 'template': template,
                'hostname': name,
                'cores': cpu,
                'memory': memory,
                'storage': storage
            }

            # Add IP configuration if provided
            if ip_config:
                data['net0'] = f'name=eth0,ip={ip_config["ip"]}/24,gw={ip_config["gateway"]}'

            # Add tags if provided
            if tags:
                data['tags'] = ','.join(tags)

            if type == 'lxc':
                endpoint = f'nodes/{node}/lxc'
            else:
                endpoint = f'nodes/{node}/qemu'

            return self._make_request('POST', endpoint, data)
        except Exception as e:
            raise Exception(f"Deployment failed: {str(e)}")

    def get_deployment_status(self, type, vmid, node):
        """Get detailed status of a deployment"""
        try:
            endpoint = f'nodes/{node}/{"lxc" if type == "lxc" else "qemu"}/{vmid}/status/current'
            return self._make_request('GET', endpoint)
        except Exception as e:
            raise Exception(f"Failed to get deployment status: {str(e)}")