import * as z from 'zod';
import { minecraftServerConfigSchema, type MinecraftServerConfig } from './MinecraftServerConfig';

/**
 * Zod schema for a Minecraft server
 */
export const minecraftServer = z.object({
	name: z.string(),
	slug: z.string(),
	version: z.string(),
	status: z.enum(['idle', 'stopped', 'running']),
	config: minecraftServerConfigSchema
});

/**
 * Type definition for a Minecraft server
 */
export interface MinecraftServer extends z.infer<typeof minecraftServer> {
	config: MinecraftServerConfig;
}
