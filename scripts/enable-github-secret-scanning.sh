#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  echo "ERROR: Missing token. Set GITHUB_TOKEN or GH_TOKEN with repo admin scope."
  exit 2
fi

REMOTE_URL="$(git remote get-url origin 2>/dev/null || true)"
if [[ -z "$REMOTE_URL" ]]; then
  echo "ERROR: origin remote not found."
  exit 2
fi

OWNER_REPO=""
if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+/[^/.]+)(\.git)?$ ]]; then
  OWNER_REPO="${BASH_REMATCH[1]}"
fi

if [[ -z "$OWNER_REPO" ]]; then
  echo "ERROR: Could not parse owner/repo from origin URL: $REMOTE_URL"
  exit 2
fi

API_URL="https://api.github.com/repos/$OWNER_REPO"

echo "Enabling secret scanning for $OWNER_REPO ..."

HTTP_CODE=$(curl -sS -o /tmp/purehabit-gh-security-response.json -w "%{http_code}" \
  -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "$API_URL" \
  -d '{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}')

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "ERROR: GitHub API request failed (HTTP $HTTP_CODE)."
  sed -n '1,120p' /tmp/purehabit-gh-security-response.json
  exit 1
fi

echo "Success: Secret scanning and push protection requested."
sed -n '1,120p' /tmp/purehabit-gh-security-response.json
