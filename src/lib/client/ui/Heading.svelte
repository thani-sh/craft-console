<script lang="ts">
	import type { Icon } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		className?: string;
		icon?: typeof Icon;
		imageAlt?: string;
		imageSrc?: string;
	}

	let { children, icon, imageAlt, imageSrc, className = '' }: Props = $props();
</script>

<h1 class="mb-4 block text-4xl font-bold text-white {className}">
	{#if icon}
		{@const ButtonIcon = icon}
		<ButtonIcon class="h-8 w-8"></ButtonIcon>
	{/if}
	{#if imageSrc}
		<img src={imageSrc} alt={imageAlt} class="h-8 w-8" />
	{/if}
	{#if children}
		<span class="hidden lg:flex" class:lg:ml-8={icon || imageSrc}>
			{@render children?.()}
		</span>
	{/if}
</h1>
