from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from app import db
from models import Script, Deployment

scripts = Blueprint('scripts', __name__)

@scripts.route('/scripts')
@login_required
def list_scripts():
    """List all available post-deployment scripts"""
    monitoring_scripts = Script.query.filter_by(category='monitoring').all()
    system_scripts = Script.query.filter_by(category='system').all()
    custom_scripts = Script.query.filter_by(category='custom', user_id=current_user.id).all()
    
    return render_template('scripts/list.html',
                         monitoring_scripts=monitoring_scripts,
                         system_scripts=system_scripts,
                         custom_scripts=custom_scripts)

@scripts.route('/scripts/add', methods=['GET', 'POST'])
@login_required
def add_script():
    """Add a new custom script"""
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        script_content = request.form.get('script_content')
        category = request.form.get('category', 'custom')
        
        try:
            script = Script(
                name=name,
                description=description,
                content=script_content,
                category=category,
                user_id=current_user.id
            )
            db.session.add(script)
            db.session.commit()
            
            flash('Script added successfully!', 'success')
            return redirect(url_for('scripts.list_scripts'))
            
        except Exception as e:
            flash(f'Failed to add script: {str(e)}', 'error')
            
    return render_template('scripts/add.html')

@scripts.route('/scripts/<int:script_id>/execute', methods=['POST'])
@login_required
def execute_script(script_id):
    """Execute a script on a deployment"""
    script = Script.query.get_or_404(script_id)
    deployment_id = request.form.get('deployment_id')
    deployment = Deployment.query.get_or_404(deployment_id)
    
    if deployment.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    try:
        # Here we would execute the script on the deployment
        # This is a placeholder for the actual implementation
        success = True
        message = f"Script '{script.name}' executed successfully"
        
        return jsonify({
            'success': success,
            'message': message
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
