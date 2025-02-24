<script lang="ts" generics="T extends string">
	import { randomString } from '$lib/client/utils';

	interface Props {
		className?: string;
		disabled?: boolean;
		id?: string;
		label?: string;
		description?: string;
		onchange?: (newValue: T) => void;
		options?: T[] | { value: T; label: string }[];
		required?: boolean;
		value?: T;
	}

	let {
		className = '',
		disabled = false,
		id = randomString(),
		label,
		description,
		onchange = () => {},
		options = [],
		required = false,
		value
	}: Props = $props();
</script>

<div class="flex w-full flex-col {className}">
	{#if label}
		<label for={id} class="mb-4 block text-xl font-bold text-white" class:opacity-50={disabled}>
			{label}
		</label>
	{/if}
	<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
		<div class="relative">
			<select
				{id}
				{value}
				{disabled}
				{required}
				onchange={(e) => onchange?.((e.target as HTMLSelectElement).value as T)}
				class="relative block w-full appearance-none border-4 border-gray-700 bg-gray-800 p-4 pr-8 text-xl font-bold text-white shadow-inner outline-none invalid:border-red-500 focus:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#each options as option}
					{#if typeof option === 'string'}
						<option value={option} class="bg-gray-800 py-4 text-white">
							{option}
						</option>
					{:else}
						<option value={option.value} class="bg-gray-800 py-4 text-white">
							{option.label}
						</option>
					{/if}
				{/each}
			</select>
			<div
				class="pointer-events-none absolute top-4 right-0 flex items-center pr-4 text-gray-700"
				class:opacity-50={disabled}
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
		{#if description}
			<div class="text-md mb-4 block text-white" class:opacity-50={disabled}>
				{@html description}
			</div>
		{/if}
	</div>
</div>

<style>
	select.appearance-none::-ms-expand {
		display: none;
	}

	select.appearance-none::-webkit-details-marker {
		display: none;
	}
</style>
