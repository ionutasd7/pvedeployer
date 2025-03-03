
from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from app import db, DEV_MODE, MOCK_RESOURCES
from models import Template

templates_bp = Blueprint('templates', __name__)

@templates_bp.route('/templates')
@login_required
def list_templates():
    """List all available templates"""
    if DEV_MODE:
        # In development mode, use mock data
        mock_templates = MOCK_RESOURCES.get('templates', [])
        return render_template('templates/list.html', templates=mock_templates)
    else:
        # In production, fetch from database
        templates = Template.query.all()
        return render_template('templates/list.html', templates=templates)
