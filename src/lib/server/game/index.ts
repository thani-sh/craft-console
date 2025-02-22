import type { MinecraftServer, MinecraftServerConfig } from '$lib/types';
import { minecraftServerConfigSchema } from '$lib/types';
import decompress from 'decompress';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { execa } from 'execa';
import { resolve } from 'path';
import { slugify } from '../utils';

/**
 * A map of server names to running server processes
 */
const processHandles: Record<string, ReturnType<typeof execa>> = {};

/**
 * Get the game server process handle if it exists
 */
export function getServerProcess(slug: string) {
	const runningProcess = processHandles[slug];
	if (!(slug in processHandles) || runningProcess.exitCode !== null || runningProcess.killed) {
		delete processHandles[slug];
		return null;
	}
	return runningProcess;
}

/**
 * Starts the Minecraft bedrock server process
 */
export function startServer(slug: string) {
	if (getServerProcess(slug)) {
		return;
	}
	const startedProcess = execa('./bedrock_server', {
		all: true,
		cwd: resolve(getServerPath(slug)),
		env: { LD_LIBRARY_PATH: '.' },
		shell: true
	});
	if (startedProcess.all) {
		// TODO: we should be able to read this from the web
		startedProcess.all.pipe(process.stdout);
	}
	processHandles[slug] = startedProcess;
	return startedProcess;
}

/**
 * Stops a Minecraft bedrock server process (if any)
 */
export function stopServer(slug: string) {
	getServerProcess(slug)?.kill();
}

/**
 * Get the path of server files from the server name
 */
function getServerPath(slug: string): string {
	return `data/servers/${slug}`;
}

/**
 * Get the path of the metadata.json file (craft-ui)
 */
function getServerMetadataPath(slug: string): string {
	return `./data/servers/${slug}/metadata.json`;
}

/**
 * Get the path of the server.properties file
 */
function getServerPropertiesPath(slug: string): string {
	return `./data/servers/${slug}/server.properties`;
}

/**
 * Get the path of the behaviour_packs directory
 */
function getBehaviourPacksPath(slug: string): string {
	return `./data/servers/${slug}/behavior_packs`;
}

/**
 * Get a list of servers currently available
 */
export async function getServersList(): Promise<string[]> {
	return await readdir('./data/servers');
}

/**
 * Get server details by reading server files
 */
export async function getServerInfo(slug: string): Promise<MinecraftServer> {
	const config = await extractServerConfig(slug);
	const { name, version } = JSON.parse(await readFile(getServerMetadataPath(slug), 'utf-8'));
	const status = getServerProcess(slug) ? 'running' : 'stopped';
	return { name, slug, version, config, status };
}

/**
 * Setups up a new Minecraft server from an archive (.zip) file
 */
export async function setupNewMinecraftServer(name: string, file: File): Promise<void> {
	// Extract the zip file under data/servers directory
	const slug = slugify(name);
	const path = getServerPath(slug);
	const buff = Buffer.from(await file.arrayBuffer());
	await decompress(buff, path);
	// Createa a metadata.json file with some name and version
	const version = await extractServerVersion(slug);
	await writeFile(getServerMetadataPath(slug), JSON.stringify({ name, version }));
}

/**
 * Extract the server version by reading server files
 */
export async function extractServerVersion(slug: string): Promise<string> {
	try {
		return (await readdir(getBehaviourPacksPath(slug)))
			.filter((item) => item.startsWith('vanilla_'))
			.reverse()[0]
			.slice('vanilla_'.length);
	} catch (err) {
		console.warn('Unable to extract the Minecraft server version', err);
		return 'unknown';
	}
}

/**
 * Extract the server config by reading server properties file
 */
export async function extractServerConfig(slug: string): Promise<MinecraftServerConfig> {
	const text = await readFile(getServerPropertiesPath(slug), 'utf-8');
	return parseMinecraftServerConfig(text);
}

/**
 * Converts the MinecraftServerConfig instance back to a string format for saving.
 */
export function stringifyMinecraftServerConfig(config: MinecraftServerConfig): string {
	let content = '';
	for (const key of Object.keys(config) as (keyof MinecraftServerConfig)[]) {
		const value = config[key];
		if (typeof value === 'boolean') {
			content += `${key}=${value ? 'true' : 'false'}\n`;
		} else if (value !== undefined) {
			content += `${key}=${value}\n`;
		}
	}
	return content;
}

/**
 * Parses a Minecraft server configuration file content string and sets the config property.
 */
export function parseMinecraftServerConfig(content: string): MinecraftServerConfig {
	const config: Record<string, string> = {};
	const lines = content.split('\n');
	for (const line of lines) {
		const trimmedLine = line.trim();
		// Skip empty lines and comment lines
		if (!trimmedLine || trimmedLine.startsWith('#')) {
			continue;
		}
		const [key, value] = trimmedLine.split('=', 2); // Split at the first '=', limit to 2 parts
		if (key && value !== undefined) {
			// Ensure key and value exist after split
			const trimmedKey = key.trim();
			const trimmedValue = value.trim();
			config[trimmedKey] = trimmedValue;
		} else {
			console.warn(`Warning: Line "${trimmedLine}" is missing a value`);
		}
	}
	// Validate the parsed config against the Zod schema
	return minecraftServerConfigSchema.parse(config);
}
