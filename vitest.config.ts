import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const src = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// The package's exports map hides empty.js, so locate it from index.js.
const serverOnlyEmpty = join(
  dirname(createRequire(import.meta.url).resolve('server-only')),
  'empty.js',
)

export default defineConfig({
  resolve: {
    alias: {
      '@': src('./src'),
      // Next.js picks empty.js through the 'react-server' condition; Vitest does
      // not set it and would load the file that throws.
      'server-only': serverOnlyEmpty,
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
