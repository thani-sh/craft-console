import type { MinecraftServer } from '$lib/types';
import { readdir } from 'node:fs/promises';
import { GameServer } from './server';

/**
 * Re-export the GameServer class for use in other modules
 */
export { GameServer } from './server';

/**
 * A map of server names to running server processes
 */
const servers: Record<string, GameServer> = {};

/**
 * Get the game server process handle if it exists
 */
export function getServer(slug: string): GameServer {
	let server = servers[slug];
	if (!server) {
		server = new GameServer(slug);
		servers[slug] = server;
		server.start();
	}
	return server;
}

/**
 * Get a list of servers currently available
 */
export async function getServers(): Promise<GameServer[]> {
	const slugs = await readdir('./data/servers');
	return slugs.map((slug) => getServer(slug));
}

/**
 * Get a list of server information
 */
export async function getServerInfo(): Promise<MinecraftServer[]> {
	const servers = await getServers();
	return Promise.all(servers.map((s) => s.getInfo()));
}
