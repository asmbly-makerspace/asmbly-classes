import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';

export default defineConfig({
	plugins: [enhancedImages(), sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			reporter: ['text', 'json', 'json-summary', 'html'],
			reportOnFailure: true
		}
	},
	resolve: {
		alias: {
			'$tests': fileURLToPath(new URL('./tests', import.meta.url))
		}
	},
	vite: {
		server: {
			watch: {
				usePolling: true
			}
		}
	}
});
