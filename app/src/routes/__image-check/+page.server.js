import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

export function load() {
	if (!dev && process.env.PLAYWRIGHT_IMAGE_CHECK !== 'true') {
		error(404);
	}
}
