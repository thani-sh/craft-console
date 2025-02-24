<script lang="ts">
	import { minecraftServerConfigSchema, type MinecraftServerConfigKey } from '$lib/types';
	import { formControlfromZodSchema } from '$lib/client/form';
	import { Heading } from '$lib/client/ui';
	import type { PageProps } from './$types';
	import FormControl from './(components)/FormControl.svelte';

	let { data }: PageProps = $props();

	const defs = $derived(
		Object.entries(minecraftServerConfigSchema.shape).map(([key, schema]) =>
			formControlfromZodSchema(key, schema)
		)
	);
</script>

<div class="mt-16 mb-32 flex w-full flex-1 flex-col items-center">
	<Heading>Server Configurations</Heading>
	<section class="mt-16 flex w-full flex-col gap-16 xl:w-6xl">
		{#each defs as def}
			<FormControl {def} value={data.server.config[def.name as MinecraftServerConfigKey]} />
		{/each}
	</section>
</div>
