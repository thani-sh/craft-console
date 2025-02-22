import { redirect } from '@sveltejs/kit';
import { getServerInfo, getServersList } from '$lib/server/game';
import type { LayoutServerLoad } from './$types';

/**
 * Load function for the layout.
 */
export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/auth/login');
	}
	const names = await getServersList();
	if (!names.length) {
		return redirect(302, '/setup');
	}
	const servers = await Promise.all(names.map(getServerInfo));
	return { user: event.locals.user, servers };
};
