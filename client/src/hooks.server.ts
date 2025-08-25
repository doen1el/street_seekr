import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { pb as basePb } from '$lib/server/pocketbase';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handlePocketBase: Handle = async ({ event, resolve }) => {
	const pb = basePb;
	event.locals.pb = pb;
	return resolve(event);
};

export const handle: Handle = async ({ event, resolve }) => {
	return handlePocketBase({
		event,
		resolve: (event) => handleParaglide({ event, resolve })
	});
};
