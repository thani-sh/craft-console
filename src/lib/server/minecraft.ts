import { spawn, type ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { minecraftServerConfigSchema, type MinecraftServerConfig } from '$lib/types/MinecraftServerConfig';
import { parseProperties, writeProperties } from './properties';

export type ProcessLogLine = {
	type: 'stdout' | 'stderr';
	line: string;
	time: number;
};

interface ServerInstance {
	process?: ChildProcess;
	logs: ProcessLogLine[];
}

const instances: Record<string, ServerInstance> = {};

function getServerDir(slug: string) {
	return path.join(process.cwd(), 'data', 'servers', slug);
}

export async function getServerConfig(slug: string): Promise<MinecraftServerConfig> {
	const serverDir = getServerDir(slug);
	const propsPath = path.join(serverDir, 'server.properties');
	
	let content = '';
	try {
		content = await fs.readFile(propsPath, 'utf8');
	} catch (err) {
		// File might not exist yet; we'll return default configs.
	}

	const rawConfig = parseProperties(content);
	// Zod will apply defaults for missing keys
	return minecraftServerConfigSchema.parse(rawConfig);
}

export async function setServerConfig(slug: string, configUpdates: Partial<MinecraftServerConfig>) {
	const serverDir = getServerDir(slug);
	const propsPath = path.join(serverDir, 'server.properties');
	
	let content = '';
	try {
		content = await fs.readFile(propsPath, 'utf8');
	} catch (err) {
		// Ignore if error reading
	}

	const newContent = writeProperties(configUpdates, content);
	await fs.mkdir(serverDir, { recursive: true });
	await fs.writeFile(propsPath, newContent, 'utf8');
}

export function getServerStatus(slug: string): 'idle' | 'stopped' | 'running' {
	const instance = instances[slug];
	if (!instance) return 'idle';
	return (instance.process && instance.process.exitCode === null) ? 'running' : 'stopped';
}

export function getServerLogs(slug: string): ProcessLogLine[] {
	return instances[slug]?.logs || [];
}

export async function startServer(slug: string) {
	if (getServerStatus(slug) === 'running') return;

	const serverDir = getServerDir(slug);
	
	// Create executable path. For Mac/Linux it's bedrock_server. For Windows it's bedrock_server.exe
	const isWin = process.platform === 'win32';
	const exeName = isWin ? 'bedrock_server.exe' : 'bedrock_server';
	const executablePath = path.join(serverDir, exeName);

	// Ensure executable permissions just in case
	if (!isWin) {
		try {
			await fs.chmod(executablePath, 0o755);
		} catch (e) {
			console.error(`Failed to chmod +x ${executablePath}`, e);
		}
	}

	const child = spawn(executablePath, [], {
		cwd: serverDir,
		env: process.env,
		stdio: ['pipe', 'pipe', 'pipe']
	});

	if (!instances[slug]) {
		instances[slug] = { logs: [] };
	}
	instances[slug].process = child;
	// Clear old logs on start
	instances[slug].logs = [];

	const addLog = (type: 'stdout' | 'stderr', data: Buffer) => {
		const lines = data.toString('utf8').split('\n');
		for (const line of lines) {
			if (!line.trim()) continue;
			instances[slug].logs.push({
				type,
				line: line.replace(/\r/g, ''),
				time: Date.now()
			});
		}
		// Keep last 1000 logs to prevent memory leaks
		if (instances[slug].logs.length > 1000) {
			instances[slug].logs = instances[slug].logs.slice(-1000);
		}
	};

	child.on('error', (err) => {
		console.error('Failed to start bedrock server process:', err);
		addLog('stderr', Buffer.from(`Failed to start server: ${err.message}`));
		instances[slug].process = undefined;
	});

	child.stdout?.on('data', (data) => addLog('stdout', data));
	child.stderr?.on('data', (data) => addLog('stderr', data));

	child.on('exit', () => {
		instances[slug].logs.push({
			type: 'stderr',
			line: `Server process exited.`,
			time: Date.now()
		});
	});
}

export function stopServer(slug: string) {
	const instance = instances[slug];
	if (instance && instance.process) {
		// Gracefully stop the bedrock server
		instance.process.stdin?.write('stop\n');
		// We could also kill it if it doesn't stop after a timeout, 
		// but standard 'stop' command works for Bedrock.
	}
}

export function writeServerInput(slug: string, input: string) {
	const instance = instances[slug];
	if (instance && instance.process && instance.process.stdin) {
		instance.process.stdin.write(input + '\n');
		instance.logs.push({
			type: 'stdout',
			line: `> ${input}`,
			time: Date.now()
		});
	}
}
