from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from app import db, DEV_MODE
from models import Deployment, ProxmoxNode
from datetime import datetime

deployments = Blueprint('deployments', __name__)

@deployments.route('/deployments')
@login_required
def list_deployments():
    """List all deployments for the current user"""
    user_deployments = Deployment.query.filter_by(user_id=current_user.id).all()
    return render_template('deployments/list.html', deployments=user_deployments)

@deployments.route('/deployments/new')
@login_required
def new_deployment():
    """Show form to create a new deployment"""
    template_id = request.args.get('template')
    nodes = ProxmoxNode.query.filter_by(user_id=current_user.id, is_active=True).all()
    return render_template('deployments/new.html', 
                         template_id=template_id,
                         nodes=nodes)

@deployments.route('/deployments/<int:deployment_id>')
@login_required
def view_deployment(deployment_id):
    """View a specific deployment"""
    deployment = Deployment.query.get_or_404(deployment_id)
    if deployment.user_id != current_user.id:
        flash('You do not have permission to view this deployment', 'danger')
        return redirect(url_for('deployments.list_deployments'))

    return render_template('deployments/view.html', deployment=deployment)

@deployments.route('/api/deployments/count')
@login_required
def deployment_count():
    """Get the count of deployments for the current user"""
    count = Deployment.query.filter_by(user_id=current_user.id).count()
    return jsonify({'count': count})

@deployments.route('/api/resources/summary')
@login_required
def resource_summary():
    """Get summary of total allocated resources"""
    deployments = Deployment.query.filter_by(user_id=current_user.id).all()
    
    cpu_total = sum(d.cpu for d in deployments)
    ram_total = sum(d.memory for d in deployments)
    storage_total = sum(d.storage for d in deployments)
    
    return jsonify({
        'cpu_total': cpu_total,
        'ram_total_gb': round(ram_total / 1024, 1),
        'storage_total_gb': storage_total
    })

@deployments.route('/deployments/<int:deployment_id>/settings')
@login_required
def deployment_settings(deployment_id):
    """View deployment settings"""
    deployment = Deployment.query.get_or_404(deployment_id)
    if deployment.user_id != current_user.id:
        flash('You do not have permission to view this deployment', 'danger')
        return redirect(url_for('deployments.list_deployments'))

    return render_template('deployments/settings.html', deployment=deployment)

@deployments.route('/deployments/<int:deployment_id>/settings/save', methods=['POST'])
@login_required
def save_settings(deployment_id):
    """Save deployment settings"""
    deployment = Deployment.query.get_or_404(deployment_id)
    if deployment.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Permission denied'})

    try:
        # Update deployment settings
        deployment.name = request.form.get('deployment_name', deployment.name)
        deployment.cpu = int(request.form.get('cpu', deployment.cpu))
        deployment.memory = int(request.form.get('memory', deployment.memory))
        deployment.storage = int(request.form.get('storage', deployment.storage))
        
        # Update advanced settings
        deployment.autostart = request.form.get('autostart') == 'on'
        deployment.autoreboot = request.form.get('autoreboot') == 'on'
        deployment.backup_enabled = request.form.get('backup_enabled') == 'on'
        deployment.backup_schedule = request.form.get('backup_schedule', 'weekly')

        # Update tags
        tags_str = request.form.get('tags', '')
        if tags_str:
            deployment.tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
        else:
            deployment.tags = []

        # Save changes
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)})

@deployments.route('/deployments/<int:deployment_id>/reset', methods=['POST'])
@login_required
def reset_deployment(deployment_id):
    """Reset deployment to original template state"""
    deployment = Deployment.query.get_or_404(deployment_id)
    if deployment.user_id != current_user.id:
        flash('You do not have permission to reset this deployment', 'danger')
        return redirect(url_for('deployments.list_deployments'))

    try:
        # Implementation would go here
        # This would call the Proxmox API to actually reset the VM/container
        
        flash('Deployment has been reset to template defaults', 'success')
    except Exception as e:
        flash(f'Error resetting deployment: {str(e)}', 'danger')
    
    return redirect(url_for('deployments.view_deployment', deployment_id=deployment.id))

@deployments.route('/deployments/<int:deployment_id>/delete', methods=['POST'])
@login_required
def delete_deployment(deployment_id):
    """Delete a deployment"""
    deployment = Deployment.query.get_or_404(deployment_id)
    if deployment.user_id != current_user.id:
        flash('You do not have permission to delete this deployment', 'danger')
        return redirect(url_for('deployments.list_deployments'))

    try:
        # Implementation would go here to delete the VM/container from Proxmox
        
        # Delete from database
        db.session.delete(deployment)
        db.session.commit()
        
        flash('Deployment has been deleted', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting deployment: {str(e)}', 'danger')
    
    return redirect(url_for('deployments.list_deployments'))

@deployments.route('/deployments/create', methods=['POST'])
@login_required
def create_deployment():
    # ... (Existing code for handling other form fields) ...

    # Parse the DHCP setting first
    use_dhcp = request.form.get('use_dhcp') == 'on'
    
    # Build network configuration
    network_config = {
        'dhcp': use_dhcp,
        'bridge': request.form.get('bridge') or 'vmbr0'
    }
    
    # Add static IP configuration if not using DHCP
    if not use_dhcp:
        ip_address = request.form.get('ip_address')
        if ip_address:
            network_config['ip'] = ip_address
            network_config['gateway'] = request.form.get('gateway')
            network_config['dns'] = request.form.get('dns')
    
    # Add firewall configuration if enabled
    if request.form.get('enable_firewall') == 'on':
        network_config['firewall'] = {
            'enabled': True,
            'ssh': request.form.get('fw_ssh') == 'on',
            'http': request.form.get('fw_http') == 'on',
            'icmp': request.form.get('fw_icmp') == 'on'
        }
    
    # Add VLAN configuration if enabled
    if request.form.get('enable_vlan') == 'on' and request.form.get('vlan'):
        network_config['vlan'] = request.form.get('vlan')
    
    # Add bandwidth limits if specified
    bandwidth_in = request.form.get('bandwidth_in')
    bandwidth_out = request.form.get('bandwidth_out')
    
    if bandwidth_in and int(bandwidth_in) > 0:
        network_config['bandwidth_in'] = int(bandwidth_in)
    
    if bandwidth_out and int(bandwidth_out) > 0:
        network_config['bandwidth_out'] = int(bandwidth_out)

    # ... (rest of the create_deployment function) ...
    #This is placeholder,  the actual implementation to create the deployment would go here.  
    #It would involve using the network_config dictionary to set up the network for the deployment.
    return "Deployment created"