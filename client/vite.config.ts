import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type PluginOption, type ViteDevServer } from 'vite';
import { attachWebSocketServer } from './server/index.js';

const webSocketServer: PluginOption = {
	name: 'streetseekr-websocket',
	configureServer(server: ViteDevServer) {
		if (server.httpServer) attachWebSocketServer(server.httpServer, { dev: true });
	},
	configurePreviewServer(server) {
		if (server.httpServer) attachWebSocketServer(server.httpServer);
	}
};

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		webSocketServer
	],
	server: {
		fs: { allow: ['./server'] }
	}
});
