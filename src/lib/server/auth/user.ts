import { db, schema, type User } from '$lib/server/data';
import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Zod schema for validating usernames.
 */
export const usernameSchema = z.string().min(3).max(32);

/**
 * Zod schema for validating passwords.
 */
export const passwordSchema = z.string().min(6).max(255);

/**
 * Creates a new user account.
 */
export function createUserId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}

/**
 * Finds a user by ID.
 */
export async function findUserById(id: string): Promise<User | null> {
	const [user] = await db.select().from(schema.user).where(eq(schema.user.id, id));
	return user ?? null;
}

/**
 * Finds a user by username.
 */
export async function findUserByName(username: string): Promise<User | null> {
	const [user] = await db.select().from(schema.user).where(eq(schema.user.username, username));
	return user ?? null;
}

/**
 * Authenticates a user by username and password.
 */
export async function authenticate(username: string, password: string): Promise<User | null> {
	const [user] = await db.select().from(schema.user).where(eq(schema.user.username, username));
	if (!user) {
		return null;
	}
	const authenticated = await verify(user.passwordHash, password);
	if (!authenticated) {
		return null;
	}
	return user;
}

/**
 * Creates a new user account with given username and password.
 */
export async function createUser(username: string, password: string): Promise<User> {
	const id = createUserId();
	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	const user: User = {
		id,
		username,
		passwordHash
	};
	await db.insert(schema.user).values(user);
	return user;
}
