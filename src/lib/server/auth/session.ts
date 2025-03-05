import { db, schema, type Session } from '$lib/server/data';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

/**
 * The number of milliseconds in a day.
 */
const DAY_MILLIS = 1000 * 60 * 60 * 24;

/**
 * Cookie name to store the session token
 */
export const CookieName = 'session_token';

/**
 * Generates a session ID from a token.
 */
export function getSessionId(token: string) {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

/**
 * Generates a secure token.
 */
export function createToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

/**
 * Validates a session token.
 */
export async function validateToken(token: string): Promise<Session | null> {
	const sessionId = getSessionId(token);
	const [session] = await db
		.select()
		.from(schema.session)
		.where(eq(schema.session.id, sessionId))
		.limit(1);
	if (!session) {
		return null;
	}
	const isExpired = Date.now() >= session.expiresAt.getTime();
	if (isExpired) {
		await db.delete(schema.session).where(eq(schema.session.id, session.id));
		return null;
	}
	return session;
}

/**
 * Creates a new session.
 */
export async function createSession(
	event: RequestEvent,
	userId: string
): Promise<{ session: Session; token: string }> {
	const token = createToken();
	const sessionId = getSessionId(token);
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_MILLIS * 30)
	};
	await db.insert(schema.session).values(session);
	setSessionCookie(event, token, session.expiresAt);
	return { session, token };
}

/**
 * Invalidates a session by id.
 */
export async function deleteSession(event: RequestEvent, sessionId: string): Promise<void> {
	await db.delete(schema.session).where(eq(schema.session.id, sessionId));
	deleteSessionCookie(event);
}

/**
 * Sets the session token cookie.
 */
export function setSessionCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set(CookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

/**
 * Deletes the session token cookie.
 */
export function deleteSessionCookie(event: RequestEvent): void {
	event.cookies.delete(CookieName, {
		path: '/'
	});
}

/**
 * Retrieves the current session from the cookie.
 */
export async function getCurrentSession(event: RequestEvent): Promise<Session | null> {
	const token = event.cookies.get(CookieName);
	if (!token) {
		return null;
	}
	return await validateToken(token);
}
