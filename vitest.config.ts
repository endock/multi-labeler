import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    alias: {
      // the real plugin talks to the API; tests hand getConfig a local fixture path
      '@probot/octokit-plugin-config': fileURLToPath(
        new URL('./vitest/mocks/probot-octokit-plugin-config.ts', import.meta.url),
      ),
    },
    // spying on an export needs a module vite has processed, not a native ESM namespace
    server: { deps: { inline: ['@actions/core'] } },
  },
});
