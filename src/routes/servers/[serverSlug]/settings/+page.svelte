<script lang="ts">
	import { Button, Heading, Input, Text } from '$lib/client/ui';
	import { minecraftServerConfigControls, type MinecraftServerConfig } from '$lib/types';
	import { SaveIcon, Download, Upload } from 'lucide-svelte';
	import type { PageProps } from './$types';
	import FormControl from './(components)/FormControl.svelte';
	import { updateServerConfig } from './settings.remote';
	import { enhance } from '$app/forms';

	let { data, form }: PageProps = $props();

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

	// Note: save only the changed fields to the server
	const save = async () => {
		await updateServerConfig({ slug: data.server.slug, changes });
		changes = {};
	};
</script>

<div class="mb-32 flex w-full flex-1 flex-col">
	<Heading>Server Configurations</Heading>
	<section class="flex w-full flex-col gap-8 md:mt-8 md:gap-16">
		{#each minecraftServerConfigControls as def}
			{@const name = def.name as keyof MinecraftServerConfig}
			<FormControl {def} value={config[name]} onchange={(val) => set(name, val)} />
		{/each}
	</section>

	<hr class="my-16 border-2 border-gray-700" />

	<Heading>Backup & Maintenance</Heading>
	<section class="mt-8 flex flex-col gap-8">
		<!-- Export Properties Section -->
		<div class="flex flex-col gap-4 border-4 border-gray-700 bg-gray-800 p-6">
			<Heading className="text-2xl">Export server.properties</Heading>
			<Text>Download the current server.properties file containing all configuration values.</Text>
			<div>
				<Button
					onclick={() => {
						window.location.href = `/servers/${data.server.slug}/settings/export-properties`;
					}}
					icon={Download}
				>
					Export
				</Button>
			</div>
		</div>

		<!-- Import Properties Section -->
		<div class="flex flex-col gap-4 border-4 border-gray-700 bg-gray-800 p-6">
			<Heading className="text-2xl">Import server.properties</Heading>
			<Text>Upload a server.properties file to replace the current configurations.</Text>

			{#if form?.error}
				<p class="border-4 border-red-500 bg-red-900/50 px-4 py-3 text-xl text-red-300">
					{form.error}
				</p>
			{/if}
			{#if form?.success}
				<p class="border-4 border-green-500 bg-green-900/50 px-4 py-3 text-xl text-green-300">
					Successfully imported server.properties!
				</p>
			{/if}

			<form
				method="post"
				action="?/importProperties"
				enctype="multipart/form-data"
				use:enhance
				class="flex flex-col gap-6"
			>
				<Input
					id="propertiesFile"
					label="Import properties file:"
					type="file"
					accept=".properties"
					required
				/>
				<div>
					<Button type="submit" icon={Upload}>Import</Button>
				</div>
			</form>
		</div>
	</section>
</div>
{#if modified}
	<footer class="fixed right-0 bottom-0 left-0 flex justify-end bg-green-900 p-2 text-white">
		<Button onclick={save} icon={SaveIcon} />
	</footer>
{/if}
