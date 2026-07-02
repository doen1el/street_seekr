<script lang="ts">
	import { onMount } from 'svelte';
	import { resolvePolygon } from '$lib/geocode';
	import { Pencil, Check, X, Trash2 } from 'lucide-svelte';
	import type { Feature } from 'geojson';

	let {
		areaText = $bindable(''),
		polygon = $bindable<Feature | null>(null),
		disabled = false
	}: { areaText?: string; polygon?: Feature | null; disabled?: boolean } = $props();

	let mapEl: HTMLDivElement;
	let map: any = null;
	let L: any = null;
	let polyLayer: any = null;
	let drawLayer: any = null;
	let vertexGroup: any = null;

	let drawing = $state(false);
	let drawPts = $state<[number, number][]>([]); // [lat, lng]
	let resolvingArea = $state(false);

	function renderPolygon() {
		if (!map || !L) return;
		if (polyLayer) {
			map.removeLayer(polyLayer);
			polyLayer = null;
		}
		if (!polygon) return;
		try {
			polyLayer = L.geoJSON(polygon as any, {
				style: { color: '#047857', weight: 2, fillColor: '#10b981', fillOpacity: 0.25 }
			}).addTo(map);
			const b = polyLayer.getBounds();
			if (b.isValid()) map.fitBounds(b, { padding: [24, 24], maxZoom: 6 });
		} catch {
			/* malformed geometry — ignore */
		}
	}

	function redrawDraw() {
		if (!map || !L) return;
		if (drawLayer) {
			map.removeLayer(drawLayer);
			drawLayer = null;
		}
		if (vertexGroup) {
			map.removeLayer(vertexGroup);
			vertexGroup = null;
		}
		if (!drawPts.length) return;
		const shape =
			drawPts.length >= 3
				? L.polygon(drawPts, {
						interactive: false,
						color: '#047857',
						weight: 2,
						fillColor: '#10b981',
						fillOpacity: 0.25
					})
				: L.polyline(drawPts, { interactive: false, color: '#047857', weight: 2, dashArray: '4 4' });
		drawLayer = shape.addTo(map);
		vertexGroup = L.layerGroup(
			drawPts.map((p) =>
				L.circleMarker(p, {
					interactive: false,
					radius: 4,
					color: '#047857',
					fillColor: '#ffffff',
					fillOpacity: 1,
					weight: 2
				})
			)
		).addTo(map);
	}

	function startDraw() {
		if (disabled) return;
		drawing = true;
		drawPts = [];
		if (polyLayer) {
			map.removeLayer(polyLayer);
			polyLayer = null;
		}
		redrawDraw();
	}

	function cancelDraw() {
		drawing = false;
		drawPts = [];
		redrawDraw();
		renderPolygon();
	}

	function finishDraw() {
		if (drawPts.length < 3) return;
		const ring = drawPts.map(([lat, lng]) => [lng, lat]);
		ring.push(ring[0]);
		drawing = false;
		drawPts = [];
		redrawDraw();
		areaText = '';
		polygon = {
			type: 'Feature',
			properties: {},
			geometry: { type: 'MultiPolygon', coordinates: [[ring]] }
		} as Feature;
	}

	function clearArea() {
		drawing = false;
		drawPts = [];
		redrawDraw();
		areaText = '';
		polygon = null;
	}

	async function applyArea() {
		if (disabled) return;
		const names = areaText
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!names.length) {
			polygon = null;
			return;
		}
		resolvingArea = true;
		try {
			polygon = (await resolvePolygon(names)) as Feature | null;
		} catch {
			polygon = null;
		} finally {
			resolvingArea = false;
		}
	}

	onMount(() => {
		let disposed = false;
		(async () => {
			L = await import('leaflet');
			if (disposed) return;
			map = L.map(mapEl).setView([20, 0], 2);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap'
			}).addTo(map);
			map.on('click', (e: any) => {
				if (!drawing) return;
				drawPts = [...drawPts, [e.latlng.lat, e.latlng.lng]];
				redrawDraw();
			});
			setTimeout(() => map?.invalidateSize(), 0);
			renderPolygon();
		})();
		return () => {
			disposed = true;
			if (map) map.remove();
			map = null;
		};
	});

	$effect(() => {
		void polygon;
		if (map && !drawing) renderPolygon();
	});
</script>

<label class="form-control">
	<span class="label-text text-xs opacity-70">List of Areas</span>
	<div class="relative">
		<input
			class="input input-sm input-bordered w-full pr-9"
			placeholder="e.g. America, France — blank = worldwide"
			{disabled}
			bind:value={areaText}
			onchange={applyArea}
		/>
		{#if resolvingArea}
			<span
				class="loading loading-spinner loading-xs absolute top-1/2 right-3 -translate-y-1/2"
			></span>
		{/if}
	</div>
	<span class="label-text-alt mt-0.5 text-[0.7rem] opacity-60">
		Restrict to areas (comma-separated) or draw a polygon on the map.
	</span>
</label>

<div class="relative mt-2">
	<div
		class="h-[200px] w-full overflow-hidden rounded-lg border border-base-300"
		bind:this={mapEl}
	></div>

	{#if !disabled}
		<div class="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
			{#if drawing}
				<button
					class="btn btn-square btn-sm btn-success"
					aria-label="Finish area"
					disabled={drawPts.length < 3}
					onclick={finishDraw}
				>
					<Check class="size-4" />
				</button>
				<button class="btn btn-square btn-sm" aria-label="Cancel drawing" onclick={cancelDraw}>
					<X class="size-4" />
				</button>
			{:else}
				<button class="btn btn-square btn-sm" aria-label="Draw area" onclick={startDraw}>
					<Pencil class="size-4" />
				</button>
			{/if}
			<button class="btn btn-square btn-sm" aria-label="Clear area" onclick={clearArea}>
				<Trash2 class="size-4" />
			</button>
		</div>
	{/if}

	{#if drawing}
		<div
			class="absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-base-100/90 px-3 py-1 text-xs shadow"
		>
			Click the map to add points ({drawPts.length}) — need at least 3.
		</div>
	{/if}
</div>
