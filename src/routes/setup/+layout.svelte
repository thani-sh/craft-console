<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/client/ui';
	import { LogOut } from 'lucide-svelte';

	let { children } = $props();
</script>

<div class="flex h-screen flex-col p-8">
	<header class="flex flex-row justify-end gap-8">
		<form method="post" action="/auth?/logout" use:enhance>
			<Button icon={LogOut}></Button>
		</form>
	</header>

	<section class="mt-8 flex flex-1 flex-col items-center justify-center">
		{@render children()}
	</section>
</div>
