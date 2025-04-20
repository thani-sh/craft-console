import type { MinecraftServer, MinecraftServerConfig } from '$lib/types';
import { minecraftServerConfigSchema } from '$lib/types';
import decompress from 'decompress';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { slugify } from '../utils';
import { Process } from './process';

/**
 * Minecraft server metadata file (craft-ui)
 */
export type GameMetadata = {
	name: string;
	version: string;
};

/**
 * Minecraft Bedrock server process
 */
export class GameServer {
	/**
	 * Creates a new game server instance with the given name and file.
	 */
	public static async setup(name: string, file: File): Promise<GameServer> {
		const game = new GameServer(slugify(name));
		await game.setGamedata(file);
		await game.setMetadata(name);
		return game;
	}

	/**
	 * The process handle for the server
	 */
	private process: Process;

	/**
	 * Initializes the game server with given slug.
	 */
	constructor(public slug: string) {
		this.process = new Process(`./bedrock_server`, [], {
			cwd: this.getServerPath(),
			env: { LD_LIBRARY_PATH: '.' }
		});
	}

	/**
	 * Returns the server information (name, version, etc.)
	 */
	public async getInfo(): Promise<MinecraftServer> {
		const metadata = await this.getMetadata();
		return {
			slug: this.slug,
			name: metadata.name,
			version: metadata.version,
			config: await this.getConfig(),
			status: this.process.getStatus()
		};
	}

	/**
	 * Starts the server process
	 */
	public start() {
		return this.process.start();
	}

	/**
	 * Stops the server process
	 */
	public stop() {
		return this.process.stop();
	}

	/**
	 * Restarts the server process
	 */
	public restart() {
		return this.process.restart();
	}

	/**
	 * Returns the current status of the server process
	 */
	public getStatus() {
		return this.process.getStatus();
	}

	/**
	 * Returns the exit code of the server process.
	 */
	public getExitCode() {
		return this.process.getExitCode();
	}

	/**
	 * Returns the stored log lines of the server process.
	 */
	public getLogs() {
		return this.process.getLogs();
	}

	/**
	 * Get Minecraft server properties
	 */
	public async getConfig() {
		const text = await readFile(this.getPropertiesPath(), 'utf-8');
		return this.parseMinecraftServerConfig(text);
	}

	/**
	 * Set Minecraft server properties.
	 * Note: this will require a server restart to take effect.
	 */
	public async setConfig(config: MinecraftServerConfig) {
		const content = this.stringifyMinecraftServerConfig(config);
		await writeFile(this.getPropertiesPath(), content, 'utf-8');
	}

	/**
	 * Get the server metadata (name, version)
	 */
	public async getMetadata(): Promise<GameMetadata> {
		try {
			const text = await readFile(this.getMetadataPath(), 'utf-8');
			return JSON.parse(text);
		} catch {
			return { name: this.slug, version: 'unknown' };
		}
	}

	/**
	 * Set the server metadata (name, version)
	 */
	public async setMetadata(name?: string, version?: string) {
		if (!name) {
			name = this.slug;
		}
		if (!version) {
			version = await this.extractVersion();
		}
		const metadata: GameMetadata = { name, version };
		await writeFile(this.getMetadataPath(), JSON.stringify(metadata), 'utf-8');
	}

	/**
	 * Get the path of server files from the server name
	 */
	public getServerPath() {
		return `data/servers/${this.slug}`;
	}

	/**
	 * Get the path of the metadata.json file (craft-ui)
	 */
	public getMetadataPath() {
		return `${this.getServerPath()}/metadata.json`;
	}

	/**
	 * Get the path of the server.properties file
	 */
	public getPropertiesPath() {
		return `${this.getServerPath()}/server.properties`;
	}

	/**
	 * Get the path of the server icon
	 */
	public getBehaviourPacksPath() {
		return `${this.getServerPath()}/behavior_packs`;
	}

	/**
	 * Setups up a new Minecraft server from an archive (.zip) file
	 */
	private async setGamedata(file: File) {
		const buff = Buffer.from(await file.arrayBuffer());
		await decompress(buff, this.getServerPath());
	}

	/**
	 * Get the Minecraft server version
	 */
	private async extractVersion() {
		try {
			return (await readdir(this.getBehaviourPacksPath()))
				.filter((item) => item.startsWith('vanilla_'))
				.reverse()[0]
				.slice('vanilla_'.length);
		} catch {
			return 'unknown';
		}
	}

	/**
	 * Parse the Minecraft server properties file and return a config object.
	 */
	private parseMinecraftServerConfig(content: string): MinecraftServerConfig {
		const config: Record<string, string> = {};
		const lines = content.split('\n');
		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine || trimmedLine.startsWith('#')) {
				continue;
			}
			const [key, value] = trimmedLine.split('=', 2);
			if (key && value !== undefined) {
				const trimmedKey = key.trim();
				const trimmedValue = value.trim();
				config[trimmedKey] = trimmedValue;
			}
		}
		return minecraftServerConfigSchema.parse(config);
	}

	/**
	 * Stringifies the Minecraft server config object to a string format for saving.
	 */
	private stringifyMinecraftServerConfig(config: MinecraftServerConfig): string {
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
}
