import type { MinecraftServerConfig, MinecraftServerConfigKey } from '$lib/types/MinecraftServerConfig';

/**
 * Parses a Minecraft server.properties file string into a Record.
 */
export function parseProperties(content: string): Partial<MinecraftServerConfig> {
	const result: Record<string, any> = {};
	const lines = content.split('\n');

	for (let line of lines) {
		line = line.trim();
		if (line.startsWith('#') || line.length === 0) continue;

		const separatorIndex = line.indexOf('=');
		if (separatorIndex === -1) continue;

		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();

		if (value.length > 0) {
			result[key] = value;
		}
	}

	return result as Partial<MinecraftServerConfig>;
}

/**
 * Stringifies a MinecraftServerConfig object back to the server.properties format.
 */
export function writeProperties(config: Partial<MinecraftServerConfig>, originalContent = ''): string {
	const lines = originalContent.split('\n');
	const configKeysHandled = new Set<string>();
	const newLines: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const rawLine = lines[i];
		const line = rawLine.trim();

		if (line.startsWith('#') || line.length === 0) {
			newLines.push(rawLine);
			continue;
		}

		const separatorIndex = line.indexOf('=');
		if (separatorIndex !== -1) {
			const key = line.slice(0, separatorIndex).trim() as keyof MinecraftServerConfig;
			if (config[key] !== undefined) {
				newLines.push(`${key}=${config[key]}`);
				configKeysHandled.add(key);
				continue;
			}
		}
		newLines.push(rawLine);
	}

	// Add any fields that were not in the original properties file
	for (const [key, value] of Object.entries(config)) {
		if (!configKeysHandled.has(key) && value !== undefined) {
			newLines.push(`${key}=${value}`);
		}
	}

	return newLines.join('\n');
}
