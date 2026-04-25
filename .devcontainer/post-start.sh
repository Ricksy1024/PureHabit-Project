#!/usr/bin/env bash
set -euo pipefail

mkdir -p "$HOME/.gemini/antigravity"
cp .devcontainer/mcp_config.json "$HOME/.gemini/antigravity/mcp_config.json"
