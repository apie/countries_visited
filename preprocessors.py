from flask_restless import ProcessingException
from flask import redirect, url_for, request
from flask_login import current_user
from flask_security import Security, auth_required

from visited import app, user_datastore, Visit
security = Security(app, user_datastore)

@security.unauthn_handler
def r(*args, headers):
        if 'api/' in request.url:
            #Needed for auth_func because it needs to raise something. Return values dont matter.
            raise ProcessingException(description='Not Authorized', code=401)
        #Otherwise, normal behavior: redirect to login page
        return redirect(url_for('security.login'))


@auth_required()
def auth_func_single(instance_id=None, **kwargs):
        if ('data' in kwargs and kwargs['data']['username'] != str(current_user.email)) or (Visit.query.filter_by(username=current_user.email, id=instance_id).first() is None):
            # Changed the username OR instance_id was not found for the current user
            raise ProcessingException(description='Not Authorized', code=401)

@auth_required()
def auth_func_many(search_params=None, **kwargs):
        if 'filters' not in search_params:
            search_params['filters'] = []
        # Always filter on current logged in user
        search_params['filters'].append(
            dict(name='username', op='eq', val=current_user.email)
        )

def deny(*args, **kwargs):
        raise ProcessingException(description='Forbidden', code=403)

def auth_func_post(data, **kwargs):
        if data['username'] != str(current_user.email):
            # Can only post for the current user
            raise ProcessingException(description='Not Authorized', code=401)

check_user=dict(
    GET_SINGLE=[auth_func_single],
    GET_MANY=[auth_func_many],
    POST=[auth_func_post],
    PUT_SINGLE=[auth_func_single],
    PUT_MANY=[deny],
    DELETE_SINGLE=[auth_func_single],
    DELETE_MANY=[deny],
)

