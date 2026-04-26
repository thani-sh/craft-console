import type { Actions } from './$types';
import { setServerConfig } from '$lib/server/minecraft';
import { minecraftServerConfigSchema, type MinecraftServerConfig } from '$lib/types/MinecraftServerConfig';

export const actions = {
	update: async ({ request, params }) => {
		const slug = params.serverSlug;
		const formData = await request.formData();
		
		const rawData: Record<string, any> = {};
		for (const [key, value] of formData.entries()) {
			// Skip empty strings so optional fields are treated as absent by Zod
			// (e.g. optional numeric fields would otherwise preprocess "" → NaN/0 and fail min() checks)
			if (value !== '') {
				rawData[key] = value;
			}
		}

		// We use the partial schema because we only want to update the provided fields
		// and we also don't want to enforce missing fields.
		const validation = minecraftServerConfigSchema.partial().safeParse(rawData);
		
		if (!validation.success) {
			console.error("Validation errors updating settings:", validation.error);
			return { success: false, errors: validation.error.flatten() };
		}
		
		await setServerConfig(slug, validation.data as Partial<MinecraftServerConfig>);
		return { success: true };
	}
} satisfies Actions;
