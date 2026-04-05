<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Heading, Input, Text } from '$lib/client/ui';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Login · Craft Console</title>
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center p-8">
	<div class="flex w-full max-w-md flex-col items-center">
		<Heading className="text-5xl mb-2">Craft Console</Heading>
		<Text className="mb-12">Sign in to manage your servers</Text>

		<form
			method="post"
			action="?/login"
			use:enhance
			class="flex w-full flex-col gap-6"
		>
			<Input id="username" label="Username:" type="text" required />
			<Input id="password" label="Password:" type="password" required />

			{#if form?.error}
				<p class="border-4 border-red-500 bg-red-900/50 px-4 py-3 text-xl text-red-300">
					{form.error}
				</p>
			{/if}

			<Button type="submit" className="mt-4 w-full">Login</Button>
		</form>
	</div>
</div>
