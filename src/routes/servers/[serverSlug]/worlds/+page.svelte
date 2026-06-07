<script lang="ts">
	import type { PageProps } from './$types';
	import { Heading, Text, Button } from '$lib/client/ui';

	let { data }: PageProps = $props();

	function formatBytes(bytes: number) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function formatDate(timestamp: number) {
		if (!timestamp) return 'Unknown';
		return new Date(timestamp).toLocaleString();
	}
</script>

<div class="flex w-full flex-col gap-8">
	<Heading>Server Worlds</Heading>

	{#if data.worlds.length === 0}
		<div class="w-full border-4 border-zinc-700 bg-zinc-900 p-8 text-center">
			<Text>No worlds were found on this server.</Text>
			<Text className="text-zinc-400 mt-2 text-sm"
				>Start the server and join it for the first time to generate a world.</Text
			>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.worlds as world}
				<div class="flex flex-col gap-4 border-4 border-zinc-700 bg-zinc-800 p-6 shadow-md">
					<div class="flex flex-col">
						<h2 class="mb-1 truncate text-2xl font-bold text-white" title={world.name}>
							{world.name}
						</h2>
						<p class="truncate text-xs text-zinc-400" title={world.id}>Folder: {world.id}</p>
					</div>

					<hr class="my-2 border-zinc-700" />

					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<Text className="text-sm font-bold text-zinc-400">Size</Text>
							<Text className="text-sm text-white">{formatBytes(world.sizeBytes)}</Text>
						</div>
						<div class="flex items-center justify-between">
							<Text className="text-sm font-bold text-zinc-400">Last Modified</Text>
							<span
								class="max-w-[150px] truncate text-sm text-white"
								title={formatDate(world.lastModified)}>{formatDate(world.lastModified)}</span
							>
						</div>
					</div>

					<!--
					We could potentially add buttons here in the future for "Download Backup"
					or "Delete World" if those operations become supported!
					-->
				</div>
			{/each}
		</div>
	{/if}
</div>
