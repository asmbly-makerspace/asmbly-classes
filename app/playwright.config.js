import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	testDir: path.join(appDirectory, 'tests'),
	fullyParallel: true,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'on-first-retry'
	},
	webServer: {
		command: process.env.CI
			? 'npm run preview -- --host 127.0.0.1 --port 4173'
			: 'npm run dev -- --host 127.0.0.1 --port 4173',
		cwd: appDirectory,
		env: {
			PLAYWRIGHT_IMAGE_CHECK: 'true'
		},
		reuseExistingServer: !process.env.CI,
		url: 'http://127.0.0.1:4173/__image-check'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
