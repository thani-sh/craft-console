import { redirect } from '@sveltejs/kit';
import { getServerInfo } from '$lib/server/game';
import type { LayoutServerLoad } from './$types';

/**
 * Load function for the layout.
 */
export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login');
	}
	const servers = await getServerInfo();
	if (!servers.length) {
		return redirect(302, '/setup');
	}
	return { user: event.locals.user, servers };
};
