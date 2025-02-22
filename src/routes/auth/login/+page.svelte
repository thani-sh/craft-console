<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input } from '$lib/client/ui';
	import { LogIn } from 'lucide-svelte';
</script>

<div class="flex h-full flex-col items-center justify-center px-8">
	<form method="post" action="?/login" class="flex w-full flex-col gap-8 sm:w-lg" use:enhance>
		<Input id="username" type="text" label="Username" />
		<Input id="password" type="password" label="Password" />
		<Button type="submit" icon={LogIn}>Login</Button>
	</form>
</div>
``
