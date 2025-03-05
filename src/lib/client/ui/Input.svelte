<script lang="ts" generics="T extends string | number">
	import { randomString } from '$lib/client/utils';

	interface Props {
		accept?: string;
		className?: string;
		disabled?: boolean;
		id?: string;
		label?: string;
		description?: string;
		max?: number;
		min?: number;
		step?: number;
		onchange?: (newValue: T) => void;
		placeholder?: string;
		required?: boolean;
		type?: 'text' | 'number' | 'email' | 'password' | 'file';
		value?: T;
	}

	let {
		accept,
		className = '',
		disabled,
		id = randomString(),
		label,
		description,
		max,
		min,
		onchange,
		placeholder = '',
		required,
		step,
		type = 'text',
		value
	}: Props = $props();
</script>

<div class="flex w-full flex-col {className}">
	{#if label}
		<label for={id} class="mb-4 block text-xl font-bold text-white" class:opacity-50={disabled}>
			{label}
		</label>
	{/if}
	<div class="grid grid-cols-1 gap-8 {description ? 'md:grid-cols-2' : ''}">
		<div class="flex flex-row items-start gap-8">
			<input
				{id}
				name={id}
				{type}
				{value}
				{placeholder}
				{disabled}
				{required}
				{min}
				{max}
				{step}
				{accept}
				oninput={(e) => onchange?.((e.target as HTMLInputElement).value as T)}
				class="relative block w-full border-4 border-gray-700 bg-gray-800 p-4 text-xl font-bold text-white shadow-inner outline-none invalid:border-red-500 focus:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
			/>
		</div>
		{#if description}
			<div class="text-md mb-4 block hidden text-white sm:flex" class:opacity-50={disabled}>
				{@html description}
			</div>
		{/if}
	</div>
</div>

<style>
	input::file-selector-button {
		width: 0;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
