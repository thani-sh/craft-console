<script lang="ts">
	import Button from './Button.svelte';
	import type { Tab } from './types';

	interface Props {
		className?: string;
		tabs?: Tab[];
		selected?: string;
	}

	let { tabs = [], selected, className = '' }: Props = $props();
</script>

<div class="flex w-full flex-row gap-1 {className}">
	{#each tabs as tab}
		<Button
			onclick={() => tab.onclick?.()}
			disabled={tab.disabled}
			pressed={!!selected && selected === tab.id}
			icon={tab.icon}
			imageSrc={tab.imageSrc}
			imageAlt={tab.imageAlt}
			className="flex-1"
		>
			{tab.label}
		</Button>
	{/each}
</div>
