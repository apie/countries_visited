from flask import Blueprint, abort, jsonify, redirect, request, url_for
from flask_login import current_user
from flask_security import Security, auth_required

from visited import app, db, user_datastore, Visit
security = Security(app, user_datastore)


@security.unauthn_handler
def r(*args, headers=None):
    if 'api/' in request.url:
        return jsonify(message='Not Authorized'), 401
    # Otherwise, normal behavior: redirect to login page
    return redirect(url_for('security.login'))


# Minimal replacement for Flask-Restless 0.17 (unmaintained, incompatible with
# current Werkzeug/SQLAlchemy). Keeps the same JSON contract the frontend uses.
api = Blueprint('api', __name__, url_prefix='/api')

FIELDS = ('country', 'year', 'note')


def _dict(v):
    return dict(id=v.id, username=v.username, country=v.country, year=v.year, note=v.note)


def _own_or_404(visit_id):
    visit = Visit.query.filter_by(id=visit_id, username=current_user.email).first()
    if visit is None:
        # Same response for "not found" and "not yours"
        abort(401)
    return visit


def _payload():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        abort(400)
    if 'username' in data and data['username'] != str(current_user.email):
        abort(401)
    return data


@api.route('/visit', methods=['GET'])
@auth_required()
def visit_list():
    visits = Visit.query.filter_by(username=current_user.email).all()
    return jsonify(num_results=len(visits), page=1, total_pages=1,
                   objects=[_dict(v) for v in visits])


@api.route('/visit', methods=['POST'])
@auth_required()
def visit_create():
    data = _payload()
    visit = Visit(username=current_user.email, **{k: data.get(k) for k in FIELDS})
    db.session.add(visit)
    db.session.commit()
    return jsonify(_dict(visit)), 201


@api.route('/visit/<int:visit_id>', methods=['GET'])
@auth_required()
def visit_get(visit_id):
    return jsonify(_dict(_own_or_404(visit_id)))


@api.route('/visit/<int:visit_id>', methods=['PUT'])
@auth_required()
def visit_update(visit_id):
    visit = _own_or_404(visit_id)
    data = _payload()
    for k in FIELDS:
        if k in data:
            setattr(visit, k, data[k])
    db.session.commit()
    return jsonify(_dict(visit))


@api.route('/visit/<int:visit_id>', methods=['DELETE'])
@auth_required()
def visit_delete(visit_id):
    db.session.delete(_own_or_404(visit_id))
    db.session.commit()
    return '', 204


app.register_blueprint(api)
