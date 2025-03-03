from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from app import db
from models import ProxmoxNode, Storage, Template, Deployment
from proxmox import ProxmoxAPI

nodes = Blueprint('nodes', __name__)

@nodes.route('/nodes')
@login_required
def list_nodes():
    user_nodes = ProxmoxNode.query.filter_by(user_id=current_user.id).all()
    return render_template('nodes/list.html', nodes=user_nodes)

@nodes.route('/nodes/add', methods=['GET', 'POST'])
@login_required
def add_node():
    if request.method == 'POST':
        name = request.form.get('name')
        host = request.form.get('host')
        user = request.form.get('user')
        password = request.form.get('password')
        
        # Test connection before saving
        try:
            proxmox = ProxmoxAPI(
                host=host,
                user=user,
                password=password,
                verify_ssl=False,
                timeout=15
            )
            # Test API connection
            proxmox.get_resources()
            
            new_node = ProxmoxNode(
                name=name,
                host=host,
                user=user,
                password=password,  # In production, this should be encrypted
                user_id=current_user.id
            )
            
            db.session.add(new_node)
            db.session.commit()
            
            flash('Node added successfully!', 'success')
            return redirect(url_for('nodes.list_nodes'))
            
        except Exception as e:
            flash(f'Failed to connect to node: {str(e)}', 'error')
            
    return render_template('nodes/add.html')

@nodes.route('/nodes/<int:node_id>/resources')
@login_required
def node_resources(node_id):
    node = ProxmoxNode.query.get_or_404(node_id)
    if node.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    try:
        proxmox = ProxmoxAPI(
            host=node.host,
            user=node.user,
            password=node.password,
            verify_ssl=False
        )
        resources = proxmox.get_resources()
        
        # Update node's resource information in database
        node.resources = resources
        node.last_checked = db.func.now()
        db.session.commit()
        
        return jsonify(resources)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@nodes.route('/nodes/recommend')
@login_required
def recommend_node():
    """Recommend the best node for deployment based on available resources"""
    nodes = ProxmoxNode.query.filter_by(user_id=current_user.id).all()
    best_node = None
    max_available_resources = 0
    
    for node in nodes:
        if not node.resources:
            continue
            
        # Calculate available resources (simplified version)
        available_resources = 0
        for resource in node.resources.get('nodes', []):
            cpu_usage = resource.get('cpu', 1)
            mem_usage = resource.get('mem_usage', 0) / resource.get('maxmem', 1)
            available_resources += (1 - cpu_usage) * (1 - mem_usage)
            
        if available_resources > max_available_resources:
            max_available_resources = available_resources
            best_node = node
            
    if best_node:
        return jsonify({
            'recommended_node': best_node.id,
            'name': best_node.name,
            'available_resources': max_available_resources
        })
    return jsonify({'error': 'No nodes available'}), 404
