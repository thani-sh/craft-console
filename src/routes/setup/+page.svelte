<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Heading, Input, Text } from '$lib/client/ui';
	import { Upload } from 'lucide-svelte';
</script>

<Heading>Setup a new server</Heading>
<Text>
	Upload the latest Minecraft Bedrock server zip file.<br /> <br />
	You can download it from here: <br />
	<a href="https://www.minecraft.net/en-us/download/server/bedrock">
		https://www.minecraft.net/en-us/download/server/bedrock
	</a>
</Text>

<form
	method="post"
	action="?/upload"
	enctype="multipart/form-data"
	class="mt-8 flex w-full flex-col lg:w-2xl"
	use:enhance
>
	<Input id="file" label="Choose file:" type="file" accept=".zip" />
	<Button type="submit" icon={Upload} className="">Upload</Button>
</form>
