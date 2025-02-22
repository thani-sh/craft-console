import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Load function for the page.
 */
export const load: PageServerLoad = async () => {
	return redirect(302, '/servers');
};
