<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Heading, Input, Text } from '$lib/client/ui';
	import { UserPlus, Trash2, ShieldCheck } from 'lucide-svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let playerName = $state('');
	let ignoresPlayerLimit = $state(false);
</script>

<div class="flex w-full flex-col gap-8">
	<Heading>Allowed Players</Heading>

	<!-- Add player form -->
	<div class="border-4 border-zinc-700 bg-zinc-800 p-6">
		<Text className="text-white font-bold mb-4 text-lg">Add Player to Allowlist</Text>

		{#if form?.error}
			<div class="mb-4 border-4 border-red-600 bg-red-900 px-4 py-2 text-sm text-white">
				{form.error}
			</div>
		{/if}

		<form method="post" action="?/add" use:enhance={() => {
			return async ({ update }) => {
				playerName = '';
				ignoresPlayerLimit = false;
				await update();
			};
		}} class="flex flex-col gap-6">
			<div class="flex flex-col gap-4 md:flex-row md:items-end">
				<div class="flex-1">
					<Input
						id="name"
						label="Player Name"
						value={playerName}
						onchange={(v) => (playerName = v as string)}
						placeholder="e.g. Steve"
					/>
				</div>
				<Button type="submit" icon={UserPlus} className="shrink-0">Add Player</Button>
			</div>

			<label class="flex cursor-pointer items-center gap-4 text-white">
				<input
					type="checkbox"
					name="ignoresPlayerLimit"
					bind:checked={ignoresPlayerLimit}
					class="h-5 w-5 accent-green-500"
				/>
				<span class="text-sm">Ignores player limit</span>
			</label>
		</form>
	</div>

	<!-- Player list -->
	<div class="flex flex-col gap-0 border-4 border-zinc-700">
		{#if data.players.length === 0}
			<div class="bg-zinc-900 p-8 text-center w-full">
				<Text>No players on the allowlist.</Text>
				<Text className="text-zinc-400 mt-2 text-sm">
					Add a player above, or disable allow-list in Settings to let anyone join.
				</Text>
			</div>
		{:else}
			{#each data.players as player, i}
				<div
					class="flex items-center justify-between gap-4 px-6 py-4 {i % 2 === 0
						? 'bg-zinc-800'
						: 'bg-zinc-900'}"
				>
					<div class="flex items-center gap-4">
						<!-- Pixel-art style avatar placeholder -->
						<div class="h-10 w-10 shrink-0 border-2 border-zinc-600 bg-zinc-700 flex items-center justify-center">
							<span class="text-xs font-bold text-white">{player.name[0].toUpperCase()}</span>
						</div>
						<div class="flex flex-col">
							<span class="font-bold text-white">{player.name}</span>
							{#if player.xuid}
								<span class="text-xs text-zinc-400">XUID: {player.xuid}</span>
							{/if}
						</div>
						{#if player.ignoresPlayerLimit}
							<span class="flex items-center gap-1 border-2 border-yellow-600 bg-yellow-900 px-2 py-0.5 text-xs text-yellow-300">
								<ShieldCheck class="h-3 w-3" />
								VIP
							</span>
						{/if}
					</div>

					<form method="post" action="?/remove" use:enhance>
						<input type="hidden" name="name" value={player.name} />
						<Button type="submit" icon={Trash2} className="!bg-red-900 hover:!bg-red-700 border-red-800 text-white !text-sm !px-4 !py-2"></Button>
					</form>
				</div>
			{/each}
		{/if}
	</div>
</div>
