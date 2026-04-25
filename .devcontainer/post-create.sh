#!/usr/bin/env bash
set -euo pipefail

npm install
npm install -g firebase-tools@latest
bash scripts/install-gitleaks-fixed.sh

if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="$HOME/.local/bin" sh
fi

"$HOME/.local/bin/uv" tool install specify-cli --from git+https://github.com/github/spec-kit.git || true

firebase --version
