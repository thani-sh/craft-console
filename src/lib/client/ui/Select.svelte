<script lang="ts">
	import { randomString } from '$lib/client/utils';

	interface Props {
		className?: string;
		disabled?: boolean;
		id?: string;
		label?: string;
		onchange?: (newValue: string) => void;
		options?: { value: string; label: string }[];
		required?: boolean;
		value?: string;
	}

	let {
		className = '',
		disabled = true,
		id = randomString(),
		label = '',
		onchange = () => {},
		options = [],
		required = false,
		value = ''
	}: Props = $props();
</script>

<div class="flex w-full flex-col {className}">
	{#if label}
		<label for={id} class="mb-4 block text-3xl font-bold text-white" class:opacity-50={disabled}>
			{label}
		</label>
	{/if}
	<div class="relative">
		<select
			{id}
			{value}
			{disabled}
			{required}
			onchange={(e) => onchange?.((e.target as HTMLSelectElement).value)}
			class="relative block w-full appearance-none border-4 border-gray-700 bg-gray-800 py-8 pr-8 pl-4 text-3xl font-bold text-white shadow-inner outline-none invalid:border-red-500 focus:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#each options as option}
				<option value={option.value} class="bg-gray-800 py-4 text-white">
					{option.label}
				</option>
			{/each}
		</select>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-700"
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
</div>

<style>
	select.appearance-none::-ms-expand {
		display: none;
	}

	select.appearance-none::-webkit-details-marker {
		display: none;
	}
</style>
