const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.ico","robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.C5kzNuVr.js",app:"_app/immutable/entry/app.BoDFp8NE.js",imports:["_app/immutable/entry/start.C5kzNuVr.js","_app/immutable/chunks/D3dmPIq3.js","_app/immutable/chunks/D1rX8njY.js","_app/immutable/entry/app.BoDFp8NE.js","_app/immutable/chunks/wrQf6Heq.js","_app/immutable/chunks/D1rX8njY.js","_app/immutable/chunks/3l5szf1F.js","_app/immutable/chunks/B5tPeL39.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:true},
		nodes: [
			__memo(() => import('./chunks/0-O2Six_Yd.js')),
			__memo(() => import('./chunks/1-DsYjJWSS.js')),
			__memo(() => import('./chunks/2-07o8H4gV.js')),
			__memo(() => import('./chunks/3-DmEMxO8H.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/[id]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
