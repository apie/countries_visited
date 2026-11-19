#!/bin/bash
set -e
if [ ! -f 'visited.py' ]; then
  echo 'Only run from within the dir'
  exit 1
fi
if [ ! -f 'config.py' ]; then
  cp config.example config.py
  echo 'Please edit the config file: config.py'
  exit 1
fi
~/.local/bin/uv sync
~/.local/bin/uv run --no-sync gunicorn visited:app -b localhost:${PORT:-8001}
