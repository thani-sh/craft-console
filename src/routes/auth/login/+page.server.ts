import { createSession } from '$lib/server/auth/session';
import { authenticate, passwordSchema, usernameSchema } from '$lib/server/auth/user';
import { validateFormData } from '$lib/server/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

/**
 * Load function for the page.
 */
export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/dash');
	}
	return {};
};

/**
 * Actions for the page.
 */
export const actions: Actions = {
	/**
	 * Logs in a user.
	 */
	login: async (event) => {
		const formData = await validateFormData(event, {
			username: usernameSchema,
			password: passwordSchema
		});
		const user = await authenticate(formData.username, formData.password);
		if (!user) {
			return fail(401, { message: 'Invalid username or password' });
		}
		await createSession(event, user.id);
		return redirect(302, '/dash');
	}
};
