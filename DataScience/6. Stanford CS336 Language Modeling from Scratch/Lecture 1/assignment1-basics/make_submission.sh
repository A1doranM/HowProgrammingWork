#!/usr/bin/env bash
set -euo pipefail

uv run pytest -v ./tests --junitxml=test_results.xml || true
echo "Done running tests"

# Set the name of the output tar.gz file
output_file="cs336-spring2025-assignment-1-submission.zip"
rm "$output_file" || true

# Compress all files in the current directory into a single zip file
zip -r "$output_file" . \
    -x '*egg-info*' \
    -x '*mypy_cache*' \
    -x '*pytest_cache*' \
    -x '*build*' \
    -x '*ipynb_checkpoints*' \
    -x '*__pycache__*' \
    -x '*.pkl' \
    -x '*.pickle' \
    -x '*.txt' \
    -x '*.log' \
    -x '*.json' \
    -x '*.out' \
    -x '*.err' \
    -x '.git*' \
    -x '.venv/*' \
    -x '.*' \
    -x 'tests/fixtures' \
    -x 'tests/_snapshots' \
    -x '*.pt' \
    -x '*.pth' \
    -x '*.npy' \
    -x '*.npz'

echo "All files have been compressed into $output_file"