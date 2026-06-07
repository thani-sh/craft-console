<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Heading, Text } from '$lib/client/ui';
	import { Download, Loader2 } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let isDownloading = $state(false);

	// Create select options. If options is empty/undefined, handle safely.
	let selectOptions = $derived(
		(data.options || []).map((opt: { downloadUrl: string; label: string; version: string }) => ({
			value: opt.downloadUrl,
			label: `${opt.label} (v${opt.version})`
		}))
	);

	// Default select value is the first option's URL if available
	let selectedUrl = $state('');

	$effect.pre(() => {
		if (!selectedUrl && data.options && data.options.length > 0) {
			selectedUrl = data.options[0].downloadUrl;
		}
	});
</script>

<svelte:head>
	<title>Setup Server · Craft Console</title>
</svelte:head>

<Heading>Setup a new server</Heading>
<Text className="mb-8 text-center max-w-xl">Choose Minecraft server version.</Text>

{#if data.error}
	<p
		class="mb-6 w-full max-w-xl border-4 border-red-500 bg-red-900/50 px-4 py-3 text-xl text-red-300"
	>
		{data.error}
	</p>
{/if}

{#if form?.error}
	<p
		class="mb-6 w-full max-w-xl border-4 border-red-500 bg-red-900/50 px-4 py-3 text-xl text-red-300"
	>
		{form.error}
	</p>
{/if}

{#if data.options && data.options.length > 0}
	<form
		method="post"
		action="?/download"
		class="mt-4 flex w-full flex-col gap-8 lg:w-2xl"
		use:enhance={() => {
			isDownloading = true;
			return async ({ update }) => {
				await update();
				isDownloading = false;
			};
		}}
	>
		<input type="hidden" name="downloadUrl" value={selectedUrl} />

		<div class="flex w-full flex-col">
			<label
				for="version-select"
				class="mb-4 block text-xl font-bold text-white"
				class:opacity-50={isDownloading}
			>
				Choose server version:
			</label>
			<div class="relative">
				<select
					id="version-select"
					value={selectedUrl}
					disabled={isDownloading}
					required
					onchange={(e) => {
						selectedUrl = (e.target as HTMLSelectElement).value;
					}}
					class="relative block w-full appearance-none border-4 border-gray-700 bg-gray-800 p-4 pr-8 text-xl font-bold text-white shadow-inner outline-none user-invalid:border-red-500 focus:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#each selectOptions as option (option.value)}
						<option value={option.value} class="bg-gray-800 py-4 text-white">
							{option.label}
						</option>
					{/each}
				</select>
				<div
					class="pointer-events-none absolute top-4 right-0 flex items-center pr-4 text-gray-700"
					class:opacity-50={isDownloading}
				>
					<svg
						class="h-8 w-8 fill-current text-white"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						><path
							d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
						/></svg
					>
				</div>
			</div>
		</div>

		<!-- Minecraft-styled EULA Acceptance Checkbox -->
		<div class="flex items-start gap-4">
			<input
				type="checkbox"
				id="eula"
				name="eula"
				required
				disabled={isDownloading}
				class="h-8 w-8 cursor-pointer border-4 border-gray-700 bg-gray-800 text-green-500 accent-green-600 focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			/>
			<label
				for="eula"
				class="cursor-pointer text-lg leading-tight text-white select-none"
				class:opacity-50={isDownloading}
			>
				I acknowledge that I have read and accepted the
				<a
					href="https://minecraft.net/eula"
					target="_blank"
					rel="noopener noreferrer"
					class="underline hover:text-green-400">Minecraft EULA</a
				>
				and the
				<a
					href="https://go.microsoft.com/fwlink/?LinkId=521839"
					target="_blank"
					rel="noopener noreferrer"
					class="underline hover:text-green-400">Privacy Policy</a
				>.
			</label>
		</div>

		<Button
			type="submit"
			disabled={isDownloading || !selectedUrl}
			icon={isDownloading ? Loader2 : Download}
			className={isDownloading ? 'animate-pulse mt-4' : 'mt-4'}
		>
			{isDownloading ? 'Downloading...' : 'Setup Server'}
		</Button>
	</form>
{:else if !data.error}
	<Text>No server versions available to install.</Text>
{/if}

<style>
	select.appearance-none::-ms-expand {
		display: none;
	}

	select.appearance-none::-webkit-details-marker {
		display: none;
	}
</style>
