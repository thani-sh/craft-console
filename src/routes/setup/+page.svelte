<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Heading, Input, Text } from '$lib/client/ui';
	import { Upload, Loader2 } from 'lucide-svelte';

	let isUploading = $state(false);
</script>

<Heading>Setup a new server</Heading>
<Text>
	Upload the Minecraft Bedrock server zip file.<br />
	You can download it from the
	<a class="underline" href="https://www.minecraft.net/en-us/download/server/bedrock"> minecraft</a>
	website
</Text>

<form
	method="post"
	action="?/upload"
	enctype="multipart/form-data"
	class="mt-8 flex w-full flex-col lg:w-2xl"
	use:enhance={() => {
		isUploading = true;
		return async ({ update }) => {
			await update();
			isUploading = false;
		};
	}}
>
	<Input id="file" label="Choose file:" type="file" accept=".zip" />
	<Button
		type="submit"
		disabled={isUploading}
		icon={isUploading ? Loader2 : Upload}
		className={isUploading ? 'animate-pulse' : ''}
	>
		{isUploading ? 'Uploading and Extracting...' : 'Upload'}
	</Button>
</form>
