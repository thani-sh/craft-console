import { startServer, stopServer } from '$lib/server/game';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

/**
 * Load function for the page.
 */
export const load: PageServerLoad = async (event) => {
	return redirect(302, `/servers/${event.params.serverSlug}/worlds`);
};

/**
 * Actions for the page.
 */
export const actions: Actions = {
	/**
	 * Start a server
	 */
	start: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		console.info(`Starting server: ${event.params.serverSlug}`);
		startServer(event.params.serverSlug)?.catch((err) => {
			console.error('Failed to start:', err);
		});
	},

	/**
	 * Stop a server
	 */
	stop: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		console.info(`Stopping server: ${event.params.serverSlug}`);
		stopServer(event.params.serverSlug);
	}
};
