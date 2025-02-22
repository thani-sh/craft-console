import { deleteSession } from '$lib/server/auth/session';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

/**
 * Load function for the page.
 */
export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/dash');
	} else {
		return redirect(302, '/auth/login');
	}
};

/**
 * Actions for the page.
 */
export const actions: Actions = {
	/**
	 * Logs out a user.
	 */
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await deleteSession(event, event.locals.session.id);
		return redirect(302, '/auth/login');
	}
};
