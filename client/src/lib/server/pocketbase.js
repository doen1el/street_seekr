import PocketBase from 'pocketbase';
import { POCKETBASE_URL } from '$env/static/private';

export const pb = new PocketBase(POCKETBASE_URL);
