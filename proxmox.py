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

    def get_resources(self):
        """Get available resources from Proxmox"""
        try:
            # First get the node list
            nodes = self._make_request('GET', 'nodes')
            if not nodes:
                raise Exception("No Proxmox nodes found")

            # Use the first available node for resources
            node = nodes[0]['node']

            resources = {
                'nodes': nodes,
                'templates': self._make_request('GET', f'nodes/{node}/storage/local/content'),
                'networks': self._make_request('GET', f'nodes/{node}/network')
            }
            return resources
        except Exception as e:
            raise Exception(f"Failed to fetch resources: {str(e)}")

    def deploy_container(self, type, template, name, cpu, memory, storage):
        """Deploy a new container or VM"""
        try:
            # Get the first available node
            nodes = self._make_request('GET', 'nodes')
            if not nodes:
                raise Exception("No Proxmox nodes found")

            node = nodes[0]['node']

            data = {
                'ostemplate': template,
                'hostname': name,
                'cores': cpu,
                'memory': memory,
                'storage': storage,
            }

            if type == 'lxc':
                endpoint = f'nodes/{node}/lxc'
            else:
                endpoint = f'nodes/{node}/qemu'

            return self._make_request('POST', endpoint, data)
        except Exception as e:
            raise Exception(f"Deployment failed: {str(e)}")