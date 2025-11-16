import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/__mocks__/**',
        '**/dist/**',
      ],
      reporter: ['text', 'lcov'],
    },
    env: {
      NODE_ENV: 'test',
    },
  },
})
