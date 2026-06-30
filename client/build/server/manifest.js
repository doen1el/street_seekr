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
		client: {start:"_app/immutable/entry/start.CYQ9ytyE.js",app:"_app/immutable/entry/app.ruA-zwED.js",imports:["_app/immutable/entry/start.CYQ9ytyE.js","_app/immutable/chunks/B5OpIwj3.js","_app/immutable/chunks/DOGrFwu9.js","_app/immutable/entry/app.ruA-zwED.js","_app/immutable/chunks/BYfPOBiv.js","_app/immutable/chunks/DOGrFwu9.js","_app/immutable/chunks/CGnfAG2J.js","_app/immutable/chunks/Ci43VXtd.js","_app/immutable/chunks/IltuuONp.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-Dfszp3YB.js')),
			__memo(() => import('./chunks/1-COCJFu0m.js')),
			__memo(() => import('./chunks/2-yp2is1BD.js')),
			__memo(() => import('./chunks/3-D5SGcFrk.js'))
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
				id: "/[code]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"code","optional":false,"rest":false,"chained":false}],
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
