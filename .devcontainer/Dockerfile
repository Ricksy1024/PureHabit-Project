FROM mcr.microsoft.com/devcontainers/typescript-node:22

RUN apt-get update \
    && apt-get install -y --no-install-recommends bubblewrap \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @openai/codex@latest
