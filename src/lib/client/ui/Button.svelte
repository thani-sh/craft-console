<script lang="ts">
	import type { Icon } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		className?: string;
		disabled?: boolean;
		icon?: typeof Icon;
		imageAlt?: string;
		imageSrc?: string;
		onclick?: () => void;
		pressed?: boolean;
		type?: 'button' | 'submit' | 'reset';
	}

	let {
		children,
		className = '',
		disabled,
		icon,
		imageAlt,
		imageSrc,
		onclick = () => {},
		pressed = false,
		type = 'button'
	}: Props = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="relative flex cursor-pointer flex-col items-center justify-center border-b-6 border-gray-700 bg-gray-200 px-8 py-4 text-3xl font-bold text-black shadow-inner outline-none hover:border-gray-800 hover:bg-gray-400 focus:shadow-none active:shadow-inner disabled:cursor-not-allowed disabled:opacity-50 sm:flex-row {className}"
	class:bg-gray-500={pressed}
>
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
</button>
