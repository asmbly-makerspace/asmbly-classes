import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {

				'img-src': ['self', 'data:'],
				'media-src': ['self', 'data:'],
				'frame-ancestors': ['self'],
				'form-action': ['self'],
				'connect-src': ['self'],
				'worker-src': ['self'],
				'script-src': ['self'],
				'object-src': ['none'],
				'frame-src': ['self'],
				'font-src': ['self', 'fonts.gstatic.com', 'fonts.googleapis.com', 'data:'],
				'style-src': ['self', 'unsafe-inline', 'fonts.googleapis.com', 'fonts.gstatic.com'],
				'default-src': ['self']
			}
		}
	},
	preprocess: vitePreprocess()
};

export default config;
