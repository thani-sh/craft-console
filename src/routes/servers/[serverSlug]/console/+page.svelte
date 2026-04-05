<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { Button, Input } from '$lib/client/ui';
	import { Play, Square } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type ProcessLogLine = {
		type: 'stdout' | 'stderr';
		line: string;
		time: number;
	};

	let logs: ProcessLogLine[] = $state([]);
	let interval: ReturnType<typeof setInterval>;
	let consoleContainer: HTMLDivElement;
	let slug = $derived(page.url.pathname.split('/')[2]);
	
	let commandInput = $state('');

	const fetchLogs = async () => {
		if (!slug) return;
		try {
			const formData = new FormData();
			const res = await fetch(`?/logs`, {
				method: 'POST',
				body: formData,
				headers: {
					'x-sveltekit-action': 'true'
				}
			});
			if (res.ok) {
				const result = await res.json();
				if (result.type === 'success' && result.data?.logs) {
					const newLogs = result.data.logs;
					if (newLogs.length !== logs.length) {
						logs = newLogs;
						requestAnimationFrame(() => {
							if (consoleContainer) {
								consoleContainer.scrollTop = consoleContainer.scrollHeight;
							}
						});
					}
				}
			}
		} catch (err) {
			console.error('Failed to fetch logs:', err);
		}
	};

	onMount(() => {
		fetchLogs();
		interval = setInterval(fetchLogs, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="flex h-full w-full flex-col gap-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<div class="text-xl font-bold text-white">Server Engine</div>
			<div class="text-sm font-medium uppercase px-2 py-1 rounded bg-zinc-800 text-zinc-300">
				Status: <span class="{data.server.status === 'running' ? 'text-green-400' : 'text-red-400'}">{data.server.status}</span>
			</div>
		</div>

		<div class="flex gap-2">
			{#if data.server.status !== 'running'}
				<form method="post" action="?/start" use:enhance>
					<Button type="submit" icon={Play} className="bg-green-600 hover:bg-green-500">Start Server</Button>
				</form>
			{:else}
				<form method="post" action="?/stop" use:enhance>
					<Button type="submit" icon={Square} className="bg-red-600 hover:bg-red-500">Stop Server</Button>
				</form>
			{/if}
		</div>
	</div>

	<div class="relative flex flex-1 w-full flex-col overflow-hidden rounded bg-zinc-950 p-4 font-mono text-sm text-white shadow-inner">
		<div class="absolute right-4 top-2 text-xs text-zinc-500">Live Console</div>
		<div bind:this={consoleContainer} class="mt-4 flex flex-1 flex-col overflow-y-auto break-all pb-2">
			{#if logs.length === 0}
				<div class="text-zinc-600 italic">No logs available. Start the server to see output.</div>
			{:else}
				{#each logs as log}
					<div class="flex flex-row whitespace-pre-wrap py-0.5 {log.type === 'stderr' ? 'text-red-400' : ''}">
						<span>{log.line}</span>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<form method="post" action="?/input" use:enhance={() => {
		const temp = commandInput;
		commandInput = '';
		return async ({ update }) => {
			await update({ reset: false });
		}
	}} class="flex w-full flex-row gap-2">
		<div class="flex-1 w-full">
			<Input id="command" value={commandInput} onchange={(v) => commandInput = v as string} placeholder="Enter server command (e.g. op username)" />
		</div>
		<Button type="submit">Send</Button>
	</form>
</div>
