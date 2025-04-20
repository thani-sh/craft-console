<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Heading } from '$lib/client/ui';
	import { minecraftServerConfigControls, type MinecraftServerConfig } from '$lib/types';
	import { SaveIcon } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import FormControl from './(components)/FormControl.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data }: PageProps = $props();

	// Note: holds changes to the server config
	let changes: Partial<MinecraftServerConfig> = $state({});
	let modified = $derived(Object.keys(changes).length > 0);

	// Note: working copy of the server config
	let config: MinecraftServerConfig = $derived({
		...data.server.config,
		...changes
	});

	// Note: update the working copy of the server config
	const set = <T extends keyof MinecraftServerConfig>(name: T, value: MinecraftServerConfig[T]) => {
		changes[name] = value;
	};

	// Note: remove any unmodified fields from the form data
	const prepare: SubmitFunction = (input) => {
		input.formData
			.keys()
			.filter((key) => !(key in changes))
			.map((key) => {
				console.log('deleting key', key);
				return key;
			})
			.forEach((key) => input.formData.delete(key));
	};
</script>

<form method="post" action="?/update" use:enhance={prepare}>
	<div class="mb-32 flex w-full flex-1 flex-col">
		<Heading>Server Configurations</Heading>
		<section class="flex w-full flex-col gap-8 md:mt-8 md:gap-16">
			{#each minecraftServerConfigControls as def}
				{@const name = def.name as keyof MinecraftServerConfig}
				<FormControl {def} value={config[name]} onchange={(val) => set(name, val)} />
			{/each}
		</section>
	</div>
	{#if modified}
		<footer class="fixed right-0 bottom-0 left-0 flex justify-end bg-green-900 p-2 text-white">
			<Button type="submit" icon={SaveIcon} />
		</footer>
	{/if}
</form>
