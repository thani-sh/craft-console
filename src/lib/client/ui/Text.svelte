<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		className?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
	}

	let { children, className = '', size = 'xl' }: Props = $props();
</script>

<p class="mb-4 block text-{size} text-white {className}">
	{@render children?.()}
</p>
