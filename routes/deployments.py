
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
