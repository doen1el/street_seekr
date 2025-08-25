// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		mapillary?: any;
	}

	namespace App {
		// interface Error {}
		interface Locals {
			pb: import('pocketbase').default;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
