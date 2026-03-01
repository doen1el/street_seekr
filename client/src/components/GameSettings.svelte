<script lang="ts">
	import type { RecordModel } from 'pocketbase';
	import { onDestroy, onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { m } from '$lib/paraglide/messages.js';

	export let game: RecordModel;
	export let isAdmin: boolean;
	export let onUpdate: () => void;
	export let onPolygonUpdate: (locationString: string) => Promise<any>;

	let previewMapContainer: HTMLDivElement;
	let previewMap: L.Map;
	let drawnItems: L.FeatureGroup;
	let coverageLayer: L.LayerGroup | null = null;
	let L: typeof import('leaflet');
	let locationInput = (game.locationStrings as string[])?.join(', ') || '';
	let coverageRefreshTimer: ReturnType<typeof setTimeout> | null = null;
	let coverageRefreshToken = 0;
	let isDestroyed = false;

    let lastPolygonJSON: string | null = game.polygon ? JSON.stringify(game.polygon) : null;

	const configuredCoverageBases = (
		env.PUBLIC_PANORAMAX_API_URLS ||
		env.PUBLIC_PANORAMAX_API_URL ||
		env.PUBLIC_PANORAMAX_VIEWER_URLS ||
		env.PUBLIC_PANORAMAX_VIEWER_URL ||
		'https://panoramax.ign.fr'
	)
		.split(',')
		.map((url) => url.trim().replace(/\/$/, ''))
		.filter(Boolean);

	const coverageApiBase = (() => {
		const base = configuredCoverageBases[0] || 'https://panoramax.ign.fr';
		return base.endsWith('/api') ? base : `${base}/api`;
	})();

	onMount(() => {
		(async () => {
			L = (await import('leaflet')).default;
			await import('leaflet-draw');

			if (previewMapContainer) {
				previewMap = L.map(previewMapContainer).setView([20, 0], 2);
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(previewMap);
				drawnItems = L.featureGroup().addTo(previewMap);
				coverageLayer = L.layerGroup().addTo(previewMap);

				if (isAdmin) {
					const drawControl = new L.Control.Draw({
						edit: { featureGroup: drawnItems },
						draw: {
							polygon: {},
							polyline: false,
							rectangle: false,
							circle: false,
							marker: false,
							circlemarker: false
						}
					});
					previewMap.addControl(drawControl);

					const updateFromDraw = (layer: any) => {
						game.polygon = layer.toGeoJSON();
						game.locationStrings = [];
						locationInput = '';
						onUpdate();
					};

					previewMap.on(L.Draw.Event.CREATED, (e: any) => {
						drawnItems.clearLayers();
						drawnItems.addLayer(e.layer);
						updateFromDraw(e.layer);
					});
					previewMap.on(L.Draw.Event.EDITED, (e: any) => e.layers.eachLayer(updateFromDraw));
					previewMap.on(L.Draw.Event.DELETED, () => {
						game.polygon = null;
						onUpdate();
					});
				} else {
					previewMap.dragging.disable();
					previewMap.scrollWheelZoom.disable();
					previewMap.doubleClickZoom.disable();
					previewMap.boxZoom.disable();
					previewMap.keyboard.disable();
					// @ts-ignore optional
					previewMap.touchZoom && previewMap.touchZoom.disable();
					// @ts-ignore optional
					previewMap.tap && previewMap.tap.disable();
				}

				if (game?.polygon) {
					showPolygonOnMap(game.polygon);
				}

				scheduleCoverageRefresh();
				previewMap.on('moveend zoomend', scheduleCoverageRefresh);
			}
		})();
	});

	onDestroy(() => {
		isDestroyed = true;
		if (coverageRefreshTimer) clearTimeout(coverageRefreshTimer);
		if (previewMap) {
			previewMap.off('moveend zoomend', scheduleCoverageRefresh);
		}
	});

	function scheduleCoverageRefresh() {
		if (!previewMap || !coverageLayer) return;
		if (coverageRefreshTimer) clearTimeout(coverageRefreshTimer);
		coverageRefreshTimer = setTimeout(() => {
			refreshCoveragePoints();
		}, 400);
	}

	function buildSampleBoxes(bounds: L.LatLngBounds): [number, number, number, number][] {
		const west = Math.max(-180, bounds.getWest());
		const east = Math.min(180, bounds.getEast());
		const south = Math.max(-85, bounds.getSouth());
		const north = Math.min(85, bounds.getNorth());

		const spanLon = Math.max(0.1, east - west);
		const spanLat = Math.max(0.1, north - south);
		const targetSamples = 24;

		const cols = Math.max(3, Math.min(8, Math.round(Math.sqrt((targetSamples * spanLon) / spanLat))));
		const rows = Math.max(3, Math.min(8, Math.ceil(targetSamples / cols)));

		const stepLon = spanLon / cols;
		const stepLat = spanLat / rows;
		const boxes: [number, number, number, number][] = [];

		for (let col = 0; col < cols; col++) {
			for (let row = 0; row < rows; row++) {
				const minLon = west + col * stepLon;
				const maxLon = Math.min(east, minLon + stepLon);
				const minLat = south + row * stepLat;
				const maxLat = Math.min(north, minLat + stepLat);
				boxes.push([minLon, minLat, maxLon, maxLat]);
			}
		}

		for (let i = boxes.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[boxes[i], boxes[j]] = [boxes[j], boxes[i]];
		}

		return boxes.slice(0, targetSamples);
	}

	async function fetchPointForBox(
		box: [number, number, number, number]
	): Promise<[number, number] | null> {
		const params = new URLSearchParams({
			bbox: box.join(','),
			limit: '1'
		});

		const res = await fetch(`${coverageApiBase}/search?${params.toString()}`, {
			headers: { Accept: 'application/geo+json' }
		});
		if (!res.ok) return null;
		const json = await res.json();
		const features = Array.isArray(json?.features) ? json.features : [];
		if (!features.length) return null;

		const coords = features[0]?.geometry?.coordinates;
		if (!Array.isArray(coords) || coords.length !== 2) return null;
		if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') return null;
		return [coords[1], coords[0]];
	}

	async function refreshCoveragePoints() {
		if (!previewMap || !coverageLayer || !L || isDestroyed) return;

		const token = ++coverageRefreshToken;
		const bounds = previewMap.getBounds();
		const sampleBoxes = buildSampleBoxes(bounds);

		const collected: [number, number][] = [];
		const chunkSize = 6;

		for (let i = 0; i < sampleBoxes.length; i += chunkSize) {
			if (isDestroyed || token !== coverageRefreshToken) return;
			const chunk = sampleBoxes.slice(i, i + chunkSize);
			const chunkResults = await Promise.all(
				chunk.map(async (box) => {
					try {
						return await fetchPointForBox(box);
					} catch {
						return null;
					}
				})
			);

			for (const point of chunkResults) {
				if (point) collected.push(point);
			}
		}

		if (isDestroyed || token !== coverageRefreshToken) return;

		const unique = new Map<string, [number, number]>();
		for (const [lat, lon] of collected) {
			const key = `${lat.toFixed(3)}:${lon.toFixed(3)}`;
			if (!unique.has(key)) unique.set(key, [lat, lon]);
		}

		coverageLayer.clearLayers();
		for (const [lat, lon] of unique.values()) {
			L.circleMarker([lat, lon], {
				radius: 3,
				color: 'hsl(var(--p))',
				fillColor: 'hsl(var(--p))',
				fillOpacity: 0.8,
				weight: 0,
				interactive: false
			}).addTo(coverageLayer);
		}
	}

	function showPolygonOnMap(polygon: any) {
		drawnItems.clearLayers();
		if (polygon) {
			L.geoJSON(polygon, { onEachFeature: (_, layer) => drawnItems.addLayer(layer) });
			previewMap.fitBounds(drawnItems.getBounds());
		}
	}

	async function handleLocationInputChange() {
		drawnItems.clearLayers();
		const newPolygon = await onPolygonUpdate(locationInput);
		game.polygon = newPolygon;
		game.locationStrings = locationInput
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (newPolygon) {
			showPolygonOnMap(newPolygon);
		}
		scheduleCoverageRefresh();
		onUpdate();
	}

     $: if (!isAdmin) {
        const joined = (game.locationStrings || []).join(', ');
        if (joined !== locationInput) {
            locationInput = joined;
        }

        const currentJSON = game.polygon ? JSON.stringify(game.polygon) : null;
        if (previewMap && drawnItems && currentJSON !== lastPolygonJSON) {
            lastPolygonJSON = currentJSON;
            drawnItems.clearLayers();
            if (game.polygon) {
                showPolygonOnMap(game.polygon);
            }
        }
    }

    $: if (isAdmin && previewMap && drawnItems) {
        lastPolygonJSON = game.polygon ? JSON.stringify(game.polygon) : null;
    }
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">{m.game_settings()}</h2>
		<div class="grid grid-cols-1 items-start gap-x-6 gap-y-4 md:grid-cols-2">
			<div class="form-control min-h-24">
				<label class="label min-h-12 items-end" for="max-rounds">
					<span class="label-text text-sm break-words">{m.rounds()}</span>
				</label>
				<input
					type="number"
					id="max-rounds"
					class="input-bordered input w-full"
					bind:value={game.maxRounds}
					on:input={onUpdate}
					disabled={!isAdmin}
					min="1"
					max="50"
				/>
			</div>

			<div class="form-control min-h-24">
				<label class="label min-h-12 items-end" for="time-limit">
					<span class="label-text text-sm break-words">{m.time_per_round()}</span>
				</label>
				<input
					type="number"
					id="time-limit"
					class="input-bordered input w-full"
					bind:value={game.timeLimit}
					on:input={onUpdate}
					disabled={!isAdmin}
					min="0"
					step="10"
				/>
			</div>

			<div class="form-control min-h-24">
				<label class="label min-h-12 items-end" for="max-points">
					<span class="label-text text-sm break-words">{m.maxPoints()}</span>
				</label>
				<input
					type="number"
					id="max-points"
					class="input-bordered input w-full"
					bind:value={game.maxPoints}
					on:input={onUpdate}
					disabled={!isAdmin}
					min="1"
				/>
			</div>

			<div class="form-control min-h-24">
				<label class="label min-h-12 items-end" for="grace-distance">
					<span class="label-text text-sm break-words">{m.grace_distance()}</span>
				</label>
				<input
					type="number"
					id="grace-distance"
					class="input-bordered input w-full"
					bind:value={game.graceDistance}
					on:input={onUpdate}
					disabled={!isAdmin}
					min="1"
					max="1000"
				/>
			</div>

			<div class="form-control min-h-24">
				<label class="label min-h-12 items-end" for="fall-off-rate">
					<span class="label-text text-sm break-words">{m.fall_of_rate()}</span>
				</label>
				<input
					type="number"
					id="fall-off-rate"
					class="input-bordered input w-full"
					bind:value={game.fallOfRate}
					on:input={onUpdate}
					disabled={!isAdmin}
					min="1"
					max="1000"
				/>
			</div>

			<div class="form-control justify-center md:col-span-2 md:justify-end">
				<label class="label cursor-pointer" for="private-lobby-toggle">
					<span class="label-text mr-4">{m.private_game()}</span>
					<input
						id="private-lobby-toggle"
						type="checkbox"
						class="toggle toggle-primary"
						bind:checked={game.private}
						on:change={onUpdate}
						disabled={!isAdmin}
					/>
				</label>
			</div>

			<div class="col-span-full">
				<label class="label" for="location-strings"
					><span class="label-text">{m.list_of_areas()}</span></label
				>
				<input
					type="text"
					id="location-strings"
					class="input-bordered input w-full"
					bind:value={locationInput}
					on:change={handleLocationInputChange}
					placeholder={m.list_of_areas_placeholder()}
					disabled={!isAdmin}
				/>
				<small class="text-xs text-base-content/60">{m.list_of_areas_description()}</small>
			</div>
			<div class="relative col-span-full">
				<div class="relative col-span-full">
					<div
						class="h-64 overflow-hidden rounded-lg transition"
						class:grayscale={!isAdmin}
						class:opacity-60={!isAdmin}
						class:pointer-events-none={!isAdmin}
						bind:this={previewMapContainer}
					></div>
					{#if !isAdmin}
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<span class="badge text-xs badge-neutral">
								{m.only_admin_edits?.() || 'Admin only'}
							</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
