import * as z from 'zod';

/**
 * Zod schema for a Minecraft server configuration object.
 */
export const minecraftServerConfigSchema = z.object({
	'server-name': z
		.string()
		.refine((val) => !val.includes(';'), { message: 'Server name cannot contain semicolon (;)' })
		.default('Minecraft Server'),
	gamemode: z.enum(['survival', 'creative', 'adventure']).default('survival'),
	'force-gamemode': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.optional()
		.default('false'),
	difficulty: z.enum(['peaceful', 'easy', 'normal', 'hard']).default('easy'),
	'allow-cheats': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'max-players': z.preprocess((value) => Number(value), z.number().int().min(1)).default(20),
	'online-mode': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('true'),
	'allow-list': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'server-port': z
		.preprocess((value) => Number(value), z.number().int().min(1).max(65535))
		.default(19132),
	'server-portv6': z
		.preprocess((value) => Number(value), z.number().int().min(1).max(65535))
		.default(19133),
	'enable-lan-visibility': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'view-distance': z.preprocess((value) => Number(value), z.number().int().min(5)).default(32),
	'tick-distance': z
		.preprocess((value) => Number(value), z.number().int().min(4).max(12))
		.default(6),
	'player-idle-timeout': z
		.preprocess((value) => Number(value), z.number().int().min(1))
		.default(30),
	'max-threads': z.preprocess((value) => Number(value), z.number().int().min(1)).default(8),
	'level-name': z
		.string()
		.refine((val) => !val.includes(';'), { message: 'Level name cannot contain semicolon (;)' })
		.default('Minecraft World'),
	'level-seed': z.string().default('-7512197374568099503'),
	'default-player-permission-level': z.enum(['visitor', 'member', 'operator']).default('member'),
	'texturepack-required': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'content-log-file-enabled': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'compression-threshold': z
		.preprocess((value) => Number(value), z.number().int().min(1).max(65535))
		.default(1),
	'compression-algorithm': z.enum(['zlib', 'snappy']).default('zlib'),
	'server-authoritative-movement': z
		.enum(['client-auth', 'server-auth', 'server-auth-with-rewind', 'default'])
		.default('server-auth'),
	'player-position-acceptance-threshold': z
		.preprocess((value) => Number(value), z.number())
		.default(0.5),
	'player-movement-action-direction-threshold': z
		.preprocess((value) => Number(value), z.number().min(0).max(1))
		.default(0.85),
	'server-authoritative-block-breaking-pick-range-scalar': z
		.preprocess((value) => Number(value), z.number())
		.default(1.5),
	'chat-restriction': z.enum(['None', 'Dropped', 'Disabled']).default('None'),
	'disable-player-interaction': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'client-side-chunk-generation-enabled': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('true'),
	'block-network-ids-are-hashes': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('true'),
	'disable-persona': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'disable-custom-skins': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'server-build-radius-ratio': z
		.union([
			z.literal('Disabled'),
			z.preprocess((value) => Number(value), z.number().min(0).max(1))
		])
		.default('Disabled'),
	'allow-outbound-script-debugging': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'allow-inbound-script-debugging': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.default('false'),
	'script-debugger-auto-attach': z.enum(['disabled', 'connect', 'listen']).default('disabled'),
	'force-inbound-debug-port': z
		.preprocess((value) => Number(value), z.number().int().min(1).max(65535))
		.optional(),
	'script-debugger-auto-attach-connect-address': z.string().optional(),
	'script-debugger-auto-attach-timeout': z
		.preprocess((value) => Number(value), z.number().int().min(0))
		.optional(),
	'script-watchdog-enable': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.optional(),
	'script-watchdog-enable-exception-handling': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.optional(),
	'script-watchdog-enable-shutdown': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.optional(),
	'script-watchdog-hang-exception': z
		.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean())
		.optional(),
	'script-watchdog-hang-threshold': z
		.preprocess((value) => Number(value), z.number().int().min(1))
		.optional(),
	'script-watchdog-spike-threshold': z
		.preprocess((value) => Number(value), z.number().int().min(1))
		.optional(),
	'script-watchdog-slow-threshold': z
		.preprocess((value) => Number(value), z.number().int().min(1))
		.optional(),
	'script-watchdog-memory-warning': z
		.preprocess((value) => Number(value), z.number().int().min(1).max(2000))
		.optional(),
	'script-watchdog-memory-limit': z
		.preprocess((value) => Number(value), z.number().int().min(1).max(2000))
		.optional()
});

/**
 * Type definition for a Minecraft server configuration object.
 */
export type MinecraftServerConfig = z.infer<typeof minecraftServerConfigSchema>;
