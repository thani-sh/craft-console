<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Heading, Text } from '$lib/client/ui';
	import { LogOut } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Servers · Craft Console</title>
</svelte:head>

<div class="flex h-screen flex-col p-8">
	<header class="flex flex-row justify-end gap-8">
		<form method="post" action="/auth?/logout" use:enhance>
			<Button icon={LogOut}></Button>
		</form>
	</header>

	<section class="mt-8 flex flex-1 flex-col items-center justify-center">
		<div class="w-full max-w-3xl">
			<Heading className="mb-8 text-center text-5xl">Select Server</Heading>

			<div class="flex flex-col gap-4">
				{#each data.servers as server (server.slug)}
					<a
						href="/servers/{server.slug}/console"
						class="flex flex-row items-center justify-between border-4 border-zinc-700 bg-zinc-800 p-6 shadow-md transition-all hover:border-zinc-500 hover:bg-zinc-700/80 active:translate-y-0.5"
					>
						<!-- Left: Server Details -->
						<div class="flex flex-col pt-2 pl-4">
							<h2 class="text-3xl font-bold text-white">
								{server.config['server-name']}
							</h2>
							<Text className="text-sm text-zinc-400">
								World: {server.config['level-name'] || 'Bedrock World'}
							</Text>
						</div>

						<!-- Right: Status Indicator -->
						<div class="flex items-center gap-3 pr-4">
							{#if server.status === 'running'}
								<span class="h-4 w-4 animate-pulse rounded-full bg-green-500"></span>
								<span class="text-xl font-bold text-green-400">Online</span>
							{:else}
								<span class="h-4 w-4 rounded-full bg-red-500"></span>
								<span class="text-xl font-bold text-zinc-400">Offline</span>
							{/if}
						</div>
					</a>
				{/each}
			</div>

			<div class="mt-12 flex w-full flex-col">
				<Button onclick={() => goto('/setup')}>Create a new server!</Button>
			</div>
		</div>
	</section>
</div>
