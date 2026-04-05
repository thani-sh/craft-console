import { env } from '$env/dynamic/private';
import { randomBytes } from 'crypto';

const SESSION_COOKIE = 'craft_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24; // 24 hours

// In-memory session store: token → expiry
const sessions = new Map<string, number>();

export type SessionValidationResult =
	| { user: { username: string }; session: { token: string } }
	| { user: null; session: null };

export function validateCredentials(username: string, password: string): boolean {
	const adminUser = env.ADMIN_USER;
	const adminPass = env.ADMIN_PASS;

	if (!adminUser || !adminPass) {
		console.error('[auth] ADMIN_USER or ADMIN_PASS env vars are not set');
		return false;
	}

	return username === adminUser && password === adminPass;
}

export function createSession(): string {
	const token = randomBytes(32).toString('hex');
	sessions.set(token, Date.now() + SESSION_DURATION_MS);
	return token;
}

export function validateSession(token: string | undefined): SessionValidationResult {
	if (!token) return { user: null, session: null };

	const expiry = sessions.get(token);
	if (!expiry || Date.now() > expiry) {
		if (expiry) sessions.delete(token);
		return { user: null, session: null };
	}

	const adminUser = env.ADMIN_USER ?? 'admin';
	return {
		user: { username: adminUser },
		session: { token }
	};
}

export function invalidateSession(token: string): void {
	sessions.delete(token);
}

export { SESSION_COOKIE };
