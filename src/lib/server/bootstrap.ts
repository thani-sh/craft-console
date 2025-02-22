import { mkdir } from 'node:fs/promises';
import { usernameSchema, passwordSchema, findUserByName, createUser } from '$lib/server/auth/user';
import { z } from 'zod';

/**
 * Zod schema for validating configuration.
 */
export const configSchema = z.object({
	ADMIN_USERNAME: usernameSchema.optional(),
	ADMIN_PASSWORD: passwordSchema.optional()
});

/**
 * Type of the configuration object.
 */
export type Config = z.infer<typeof configSchema>;

/**
 * Sets up the application on startup.
 */
export async function bootstrap(maybeConfig: object) {
	const config = configSchema.parse(maybeConfig);

	// Check if the admin user exists, create it if it doesn't exist
	if (config.ADMIN_USERNAME && config.ADMIN_PASSWORD) {
		const admin = await findUserByName(config.ADMIN_USERNAME);
		if (!admin) {
			await createUser(config.ADMIN_USERNAME, config.ADMIN_PASSWORD);
			console.log(`Admin user created successfully: ${config.ADMIN_USERNAME}`);
		} else {
			console.log(`Admin user already exists: ${config.ADMIN_USERNAME}`);
		}
	}

	// Create data directory and all sub-directories we will need later
	await mkdir('data/servers', { recursive: true });
}
