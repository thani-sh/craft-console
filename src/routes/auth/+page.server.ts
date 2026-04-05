import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import {
	validateCredentials,
	createSession,
	invalidateSession,
	SESSION_COOKIE
} from '$lib/server/auth';

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required.' });
		}

		if (!validateCredentials(username, password)) {
			return fail(401, { error: 'Invalid username or password.' });
		}

		const token = createSession();
		cookies.set(SESSION_COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 // 24 hours
		});

		redirect(303, '/servers');
	},

	logout: async ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE);
		if (token) {
			invalidateSession(token);
			cookies.delete(SESSION_COOKIE, { path: '/' });
		}
		redirect(303, '/auth');
	}
} satisfies Actions;
