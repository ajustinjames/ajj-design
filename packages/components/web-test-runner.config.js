import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'test/**/*.test.ts',
  plugins: [esbuildPlugin({ ts: true })],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  nodeResolve: true,
};
