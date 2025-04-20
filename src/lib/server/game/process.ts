import { spawn, type ChildProcess } from 'node:child_process';

/**
 * The status of the process.
 */
export type ProcessStatus = 'idle' | 'running' | 'stopped';

/**
 * Options for creating a new process.
 */
export type ProcessOptions = { cwd?: string; env?: NodeJS.ProcessEnv };

/**
 * A wrapper class around NodeJS child process.
 */
export class Process {
	private process: ChildProcess | null = null;
	private status: ProcessStatus = 'idle';
	private command: string;
	private args: string[];
	private options?: ProcessOptions;
	private exitCode: number | null = null;

	/**
	 * Initializes the process configuration without starting it.
	 */
	constructor(command: string, args: string[], options?: ProcessOptions) {
		this.command = command;
		this.args = args;
		this.options = options;
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
		return this.exitCode;
	}

	/**
	 * Starts the process if it is currently idle.
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.status !== 'idle') {
				return reject(new Error('Process is not idle.'));
			}

			this.exitCode = null;
			try {
				this.process = spawn(this.command, this.args, this.options);
			} catch (error) {
				this.status = 'stopped';
				this.exitCode = 1;
				return reject(error);
			}

			this.process.once('error', (err) => {
				this.status = 'stopped';
				this.exitCode = 1;
				this.process = null;
				reject(err);
			});

			this.process.on('exit', (code) => {
				this.status = 'stopped';
				this.exitCode = code;
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
				this.exitCode = code;
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
}
