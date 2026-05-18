import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'test/**/*.test.ts',
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'chrome110',
      tsconfig: './tsconfig.test.json',
    }),
  ],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  nodeResolve: true,
};
