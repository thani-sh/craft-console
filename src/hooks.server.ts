import { ADMIN_PASSWORD, ADMIN_USERNAME } from '$env/static/private';
import {
	CookieName,
	createSession,
	deleteSession,
	getSessionId,
	validateToken
} from '$lib/server/auth/session';
import { findUserById } from '$lib/server/auth/user';
import { bootstrap } from '$lib/server/bootstrap';
import type { Handle } from '@sveltejs/kit';

/**
 * Run startup code
 */
bootstrap({
	ADMIN_USERNAME: ADMIN_USERNAME,
	ADMIN_PASSWORD: ADMIN_PASSWORD
});

/**
 * Handle function for authenticating users.
 */
const handleAuth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(CookieName);
	if (!token) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}
	const session = await validateToken(token);
	if (session) {
		event.locals.user = await findUserById(session.userId);
		event.locals.session = await createSession(event, session.userId);
	} else {
		const sessionId = getSessionId(token);
		await deleteSession(event, sessionId);
		event.locals.session = null;
		event.locals.user = null;
	}
	return resolve(event);
};

/**
 * Export the SvelteKit handle function.
 */
export const handle: Handle = handleAuth;
