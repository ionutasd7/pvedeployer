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
            # Test API connection and get initial resources
            resources = proxmox.get_resources()

            new_node = ProxmoxNode(
                name=name,
                host=host,
                user=user,
                password=password,  # In production, this should be encrypted
                user_id=current_user.id,
                resources=resources  # Store initial resource state
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
    nodes = ProxmoxNode.query.filter_by(user_id=current_user.id, is_active=True).all()
    if not nodes:
        return jsonify({'error': 'No active nodes available'}), 404

    best_node = None
    best_score = -1

    for node in nodes:
        if not node.resources:
            continue

        # Calculate weighted resource availability score
        try:
            node_resources = node.resources
            node_status = node_resources['nodes'][0]['status']

            # CPU score (30% weight)
            cpu_usage = node_status.get('cpu', 1)
            cpu_score = (1 - cpu_usage) * 0.3

            # Memory score (30% weight)
            mem_total = node_status.get('memory', {}).get('total', 1)
            mem_used = node_status.get('memory', {}).get('used', 0)
            mem_score = (1 - (mem_used / mem_total)) * 0.3

            # Storage score (20% weight)
            storage_score = 0
            storage_info = node_resources.get('storage_info', [])
            if storage_info:
                avail_storage = sum(s.get('avail', 0) for s in storage_info)
                total_storage = sum(s.get('total', 1) for s in storage_info)
                storage_score = (avail_storage / total_storage) * 0.2

            # Network score (20% weight)
            network_score = 0.2  # Default score if no network issues

            # Calculate total score
            total_score = cpu_score + mem_score + storage_score + network_score

            if total_score > best_score:
                best_score = total_score
                best_node = node

        except (KeyError, ZeroDivisionError, TypeError) as e:
            continue

    if best_node:
        return jsonify({
            'recommended_node': best_node.id,
            'name': best_node.name,
            'available_resources': best_score,
            'metrics': {
                'cpu': cpu_score / 0.3,
                'memory': mem_score / 0.3,
                'storage': storage_score / 0.2,
                'network': network_score
            }
        })

    return jsonify({'error': 'No suitable nodes found'}), 404