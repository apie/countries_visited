#!/usr/bin/env python3
import flask
import flask_sqlalchemy
import flask_restless
import os

app = flask.Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'visited.sqlite')
db = flask_sqlalchemy.SQLAlchemy(app)


class Visit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80))
    country = db.Column(db.String(120))
    year = db.Column(db.Integer)
    note = db.Column(db.String(512))


db.create_all()
manager = flask_restless.APIManager(app, flask_sqlalchemy_db=db)
manager.create_api(Visit, methods=['GET', 'POST', 'PUT', 'DELETE'], results_per_page=-1)

from flask import request, send_from_directory

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/favicon.ico')
def favicon():
    return app.send_static_file('favicon.ico')

if __name__ == '__main__':
    app.run()
