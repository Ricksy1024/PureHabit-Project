#!/usr/bin/env bash
set -euo pipefail

GITLEAKS_VERSION="8.30.1"
GITLEAKS_TAG="v${GITLEAKS_VERSION}"

if command -v gitleaks >/dev/null 2>&1; then
  INSTALLED_VERSION="$(gitleaks version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1 || true)"
  if [[ "$INSTALLED_VERSION" == "$GITLEAKS_VERSION" ]]; then
    echo "gitleaks ${GITLEAKS_VERSION} already installed; skipping."
    exit 0
  fi
fi

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64 | amd64)
    ASSET_ARCH="x64"
    ;;
  aarch64 | arm64)
    ASSET_ARCH="arm64"
    ;;
  *)
    echo "ERROR: Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

ASSET_FILE="gitleaks_${GITLEAKS_VERSION}_linux_${ASSET_ARCH}.tar.gz"
BASE_URL="https://github.com/gitleaks/gitleaks/releases/download/${GITLEAKS_TAG}"
ASSET_URL="${BASE_URL}/${ASSET_FILE}"
CHECKSUM_URL="${BASE_URL}/gitleaks_${GITLEAKS_VERSION}_checksums.txt"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

curl -fsSL -o "$WORKDIR/$ASSET_FILE" "$ASSET_URL"
curl -fsSL -o "$WORKDIR/checksums.txt" "$CHECKSUM_URL"

CHECKSUM_ENTRY="$(grep " ${ASSET_FILE}$" "$WORKDIR/checksums.txt" || true)"
if [[ -z "$CHECKSUM_ENTRY" ]]; then
  echo "ERROR: Missing checksum entry for $ASSET_FILE"
  exit 1
fi

( cd "$WORKDIR" && echo "$CHECKSUM_ENTRY" | sha256sum -c - )

tar -xzf "$WORKDIR/$ASSET_FILE" -C "$WORKDIR"

if [[ -w /usr/local/bin ]]; then
  install -m 0755 "$WORKDIR/gitleaks" /usr/local/bin/gitleaks
else
  mkdir -p "$HOME/.local/bin"
  install -m 0755 "$WORKDIR/gitleaks" "$HOME/.local/bin/gitleaks"
fi

echo "Installed gitleaks ${GITLEAKS_VERSION}"
gitleaks version
