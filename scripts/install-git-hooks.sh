#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .githooks/pre-commit ]]; then
  echo "Missing .githooks/pre-commit hook."
  exit 1
fi

chmod +x .githooks/pre-commit
git config core.hooksPath .githooks

echo "Git hooks installed. core.hooksPath=.githooks"
