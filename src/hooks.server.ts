import { redirect, type Handle } from '@sveltejs/kit';
import { validateSession, SESSION_COOKIE } from '$lib/server/auth';

const PUBLIC_ROUTES = ['/auth'];

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	const { user, session } = validateSession(token);

	event.locals.user = user;
	event.locals.session = session;

	const pathname = event.url.pathname;
	const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

	if (!user && !isPublic) {
		redirect(302, '/auth');
	}

	if (user && pathname === '/auth') {
		redirect(302, '/servers');
	}

	return resolve(event);
};
