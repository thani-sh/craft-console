import { spawn, type ChildProcess } from 'node:child_process';

/**
 * The status of the process.
 */
export type ProcessStatus = 'idle' | 'running' | 'stopped';

/**
 * Options for creating a new process.
 */
export type ProcessOptions = {
	cwd?: string;
	env?: NodeJS.ProcessEnv;
};

/**
 * A log line from the process.
 */
export type ProcessLogLine = {
	type: 'stdout' | 'stderr';
	line: string;
	time: number;
};

/**
 * The maximum number of lines to keep in the logs.
 */
export const LOGS_SCROLLBACK = 1000;

/**
 * A wrapper class around NodeJS child process.
 */
export class Process {
	private process: ChildProcess | null = null;
	private status: ProcessStatus = 'idle';
	private command: string;
	private args: string[];
	private opts?: ProcessOptions;
	private code: number | null = null;
	private logs: ProcessLogLine[] = [];

	/**
	 * Initializes the process configuration without starting it.
	 */
	constructor(command: string, args: string[], options?: ProcessOptions) {
		this.command = command;
		this.args = args;
		this.opts = options;
	}

	/**
	 * Returns the current status of the process.
	 */
	public getStatus(): ProcessStatus {
		return this.status;
	}

	/**
	 * Returns the exit code of the process after it has stopped, or null otherwise.
	 */
	public getExitCode(): number | null {
		return this.code;
	}

	/**
	 * Returns the stored log lines.
	 */
	public getLogs(): ProcessLogLine[] {
		return this.logs;
	}

	/**
	 * Starts the process if it is currently idle.
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.status !== 'idle') {
				return reject(new Error('Process is not idle.'));
			}

			this.logs = [];
			this.code = null;
			try {
				this.process = spawn(this.command, this.args, this.opts);
			} catch (error) {
				this.status = 'stopped';
				this.code = 1;
				return reject(error);
			}

			if (this.process.stdout) {
				let stdoutBuffer = '';
				this.process.stdout.setEncoding('utf8');
				this.process.stdout.on('data', (data: string) => {
					stdoutBuffer += data;
					const lines = stdoutBuffer.split('\n');
					stdoutBuffer = lines.pop() || '';
					lines.forEach((line) => this.addLogLine('stdout', line));
				});
			}

			if (this.process.stderr) {
				let stderrBuffer = '';
				this.process.stderr.setEncoding('utf8');
				this.process.stderr.on('data', (data: string) => {
					stderrBuffer += data;
					const lines = stderrBuffer.split('\n');
					stderrBuffer = lines.pop() || '';
					lines.forEach((line) => this.addLogLine('stderr', line));
				});
			}

			this.process.once('error', (err) => {
				this.status = 'stopped';
				this.code = 1;
				this.process = null;
				reject(err);
			});

			this.process.on('exit', (code) => {
				this.status = 'stopped';
				this.code = code;
				this.process = null;
			});

			this.status = 'running';
			resolve();
		});
	}

	/**
	 * Stops the running process gracefully, with a fallback to force kill.
	 */
	public async stop(): Promise<void> {
		const processRef = this.process;

		if (this.status !== 'running' || !processRef) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				processRef.kill('SIGKILL');
			}, 5000);

			processRef.on('exit', (code) => {
				clearTimeout(timeout);
				this.code = code;
				resolve();
			});

			processRef.on('error', (err) => {
				clearTimeout(timeout);
				reject(err);
			});

			if (!processRef.kill()) {
				clearTimeout(timeout);
				if (this.status !== 'stopped') {
					this.status = 'stopped';
					this.process = null;
				}
				resolve();
			}
		});
	}

	/**
	 * Stops the process if running, then starts it again.
	 */
	public async restart(): Promise<void> {
		if (this.status === 'running') {
			await this.stop();
		}
		this.status = 'idle';
		this.start();
	}

	/**
	 * Adds a log line to the logs array and removes the oldest line if the limit is exceeded.
	 */
	private addLogLine(type: 'stdout' | 'stderr', line: string): void {
		this.logs.push({ type, line, time: Date.now() });
		if (this.logs.length > LOGS_SCROLLBACK) {
			this.logs.shift();
		}
	}
}
