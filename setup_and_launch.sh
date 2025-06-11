#!/usr/bin/env bash
set -e

# Install Python type checker
pip install pyright

# Install Python dependencies if a pyproject exists
if [ -f pyproject.toml ]; then
  poetry install --with test
else
  echo "pyproject.toml not found, skipping poetry install"
fi

# Install Node.js dependencies
pnpm install

# Launch the game
pnpm dev

