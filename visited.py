#!/usr/bin/env python3
import flask
import flask_sqlalchemy
import flask_restless
import os
from flask_mail import Mail
import config

app = flask.Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'visited.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SECURITY_REGISTERABLE'] = True
app.config['SECURITY_DEFAULT_REMEMBER_ME'] = True
app.config['SECURITY_RECOVERABLE'] = True
app.config['SECURITY_UNAUTHORIZED_VIEW'] = '/login'
app.config['SECURITY_SEND_PASSWORD_RESET_NOTICE_EMAIL'] = False
app.config['SECURITY_EMAIL_SUBJECT_REGISTER'] = 'Welcome to Countries Visited'

app.config['MAIL_SERVER'] = config.MAIL_SERVER
app.config['MAIL_PORT'] = config.MAIL_PORT
app.config['MAIL_USE_SSL'] = config.MAIL_USE_SSL
app.config['MAIL_USERNAME'] = config.MAIL_USERNAME
app.config['MAIL_DEFAULT_SENDER'] = config.MAIL_DEFAULT_SENDER
app.config['MAIL_PASSWORD'] = config.MAIL_PASSWORD
mail = Mail(app)
# Generate a nice key using secrets.token_urlsafe()
app.config['SECRET_KEY'] = config.SECRET_KEY
# Generate a good salt using: secrets.SystemRandom().getrandbits(128)
app.config['SECURITY_PASSWORD_SALT'] = config.SECURITY_PASSWORD_SALT

# As of Flask-SQLAlchemy 2.4.0 it is easy to pass in options directly to the
# underlying engine. This option makes sure that DB connections from the
# pool are still valid. Important for entire application since
# many DBaaS options automatically close idle connections.
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
}


db = flask_sqlalchemy.SQLAlchemy(app)

app.config['DEBUG'] = config.DEBUG
from flask_security import Security, SQLAlchemyUserDatastore, auth_required, hash_password
from flask_security.models import fsqla_v2 as fsqla

class Visit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80))
    country = db.Column(db.String(120))
    year = db.Column(db.Integer)
    note = db.Column(db.String(512))


# Define models
fsqla.FsModels.set_db_info(db)

class Role(db.Model, fsqla.FsRoleMixin):
    pass

class User(db.Model, fsqla.FsUserMixin):
    pass

user_datastore = SQLAlchemyUserDatastore(db, User, Role)
db.create_all()
security = Security(app, user_datastore)

from flask import redirect, url_for

@security.unauthn_handler
def r(*args, headers):
        if 'api/' in request.url:
            #Needed for auth_func because it needs to raise something. Return values dont matter.
            raise flask_restless.ProcessingException(description='Not Authorized', code=401)
        #Otherwise, normal behavior: redirect to login page
        return redirect(url_for('security.login'))

from flask_login import current_user

@auth_required()
def auth_func_single(instance_id=None, **kwargs):
        if ('data' in kwargs and kwargs['data']['username'] != current_user.email) or (Visit.query.filter_by(username=current_user.email, id=instance_id).first() is None):
            # Changed the username OR instance_id was not found for the current user
            raise flask_restless.ProcessingException(description='Not Authorized', code=401)

@auth_required()
def auth_func_many(search_params=None, **kwargs):
        if 'filters' not in search_params:
            search_params['filters'] = []
        # Always filter on current logged in user
        search_params['filters'].append(
            dict(name='username', op='eq', val=current_user.email)
        )

def deny(*args, **kwargs):
        raise flask_restless.ProcessingException(description='Forbidden', code=403)

def auth_func_post(data, **kwargs):
        breakpoint()
        if data['username'] != current_user.email:
            # Can only post for the current user
            raise flask_restless.ProcessingException(description='Not Authorized', code=401)

manager = flask_restless.APIManager(app, flask_sqlalchemy_db=db)
manager.create_api(
        Visit,
        methods=['GET', 'POST', 'PUT', 'DELETE'],
        results_per_page=-1,
        preprocessors=dict(
            GET_SINGLE=[auth_func_single],
            GET_MANY=[auth_func_many],
            POST=[auth_func_post],
            PUT_SINGLE=[auth_func_single],
            PUT_MANY=[deny],
            DELETE_SINGLE=[auth_func_single],
            DELETE_MANY=[deny],
        ),
)

from flask import request, send_from_directory

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)


from flask import Flask, render_template_string

@app.route('/')
@auth_required()
def index():
    return app.send_static_file('index.html')

@app.route('/favicon.ico')
def favicon():
    return app.send_static_file('favicon.ico')

@app.route("/user.js")
@auth_required()
def username():
    return render_template_string("username = '{{ current_user.email }}';")

if __name__ == '__main__':
    app.run()
