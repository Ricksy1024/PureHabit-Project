#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if command -v gitleaks >/dev/null 2>&1; then
  gitleaks git --redact --verbose --config .gitleaks.toml
  exit 0
fi

if command -v docker >/dev/null 2>&1; then
  docker run --rm -v "$ROOT_DIR:/repo" ghcr.io/gitleaks/gitleaks:latest \
    git --source=/repo --redact --verbose --config=/repo/.gitleaks.toml
  exit 0
fi

echo "gitleaks not found. Running fallback signature scan..."

PATTERN='AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[0-9A-Za-z-]{10,}|sk_live_[0-9A-Za-z]{10,}|BEGIN (RSA |EC |DSA |OPENSSH |)?PRIVATE KEY|"type"[[:space:]]*:[[:space:]]*"service_account"|"private_key"|"client_email"'

if git ls-files -z | xargs -0 grep -nHIE --binary-files=without-match -- "$PATTERN" >/tmp/purehabit-secret-scan.txt; then
  echo "Potential secret detected:"
  sed -n '1,60p' /tmp/purehabit-secret-scan.txt
  exit 1
fi

echo "Fallback signature scan passed."
exit 0
