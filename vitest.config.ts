import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'features/**/*.test.ts'],
  },
  resolve: {
    alias: {
      types: path.resolve(__dirname, 'types'),
      lib: path.resolve(__dirname, 'lib'),
      features: path.resolve(__dirname, 'features'),
    },
  },
});
