import { browser } from '$app/environment';
import { AVATAR_STYLES, DEFAULT_AVATAR, isAvatarStyle } from '../../server/avatars.js';

export interface Profile {
	name: string;
	avatar: string;
	clientId: string;
}

const KEY = 'streetseekr:profile';

function newClientId(): string {
	try {
		return crypto.randomUUID();
	} catch {
		return `c-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
	}
}

class ProfileStore {
	name = $state('');
	avatar = $state(DEFAULT_AVATAR);
	clientId = $state('');

	constructor() {
		if (browser) this.#load();
	}

	#load() {
		try {
			const raw = localStorage.getItem(KEY);
			const p = raw ? JSON.parse(raw) : null;
			this.name = typeof p?.name === 'string' ? p.name : '';
			this.avatar = isAvatarStyle(p?.avatar) ? p.avatar : DEFAULT_AVATAR;
			this.clientId = typeof p?.clientId === 'string' && p.clientId ? p.clientId : newClientId();
		} catch {
			this.clientId = newClientId();
		}
		this.#save();
	}

	#save() {
		if (!browser) return;
		try {
			localStorage.setItem(
				KEY,
				JSON.stringify({ name: this.name, avatar: this.avatar, clientId: this.clientId })
			);
		} catch {
		}
	}

	set(name: string, avatar?: string) {
		this.name = name;
		if (avatar && isAvatarStyle(avatar)) this.avatar = avatar;
		this.#save();
	}

	nextAvatar() {
		const i = AVATAR_STYLES.indexOf(this.avatar);
		this.avatar = AVATAR_STYLES[(i + 1) % AVATAR_STYLES.length];
		this.#save();
	}

	get value(): Profile {
		return { name: this.name, avatar: this.avatar, clientId: this.clientId };
	}
}

export const profile = new ProfileStore();
