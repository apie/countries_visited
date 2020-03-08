#!/bin/bash
set -e
if [ ! -f 'visited.py' ]; then
  echo 'Only run from within the dir'
  exit 1
fi
if [ ! -d "venv" ]; then
  virtualenv --python=python3 venv
fi
source venv/bin/activate
pip3 install -r requirements.txt
venv/bin/gunicorn visited:app --reload -b localhost:8001

