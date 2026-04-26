<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, Heading } from '$lib/client/ui';
	import type { MinecraftServer } from '$lib/types';
	import { LogOut } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- Snippet to render server name and version -->
{#snippet serverName(server: MinecraftServer)}
	<a class="flex flex-col" href="/servers/{server.slug}/console">
		<Heading className="text-4xl mt-4">
			{server.config['server-name']}
		</Heading>
		<Heading className="text-xl">
			(v{server.version})
		</Heading>
	</a>
{/snippet}

<!-- Snippet to render server action buttons -->
{#snippet serverActions(server: MinecraftServer)}
	{#if server.status === 'stopped'}
		<form method="post" action="/servers/{server.slug}?/start" use:enhance>
			<Button type="submit">Start</Button>
		</form>
	{:else}
		<form method="post" action="/servers/{server.slug}?/stop" use:enhance>
			<Button type="submit">Stop</Button>
		</form>
	{/if}
{/snippet}

<div class="flex h-screen flex-col p-8">
	<header class="flex flex-row justify-end gap-8">
		<form method="post" action="/auth?/logout" use:enhance>
			<Button icon={LogOut}></Button>
		</form>
	</header>

	<section class="mt-8 flex flex-1 flex-col items-center justify-center">
		<div class="w-3xl">
			{#each data.servers as server}
				<div class="flex flex-row items-center justify-between">
					<div class="flex flex-1">{@render serverName(server)}</div>
					<div class="flex">{@render serverActions(server)}</div>
				</div>
			{/each}
		</div>
		<div class="mt-8 flex w-3xl flex-col">
			<Button onclick={() => goto('/setup')}>Create a new server!</Button>
		</div>
	</section>
</div>
