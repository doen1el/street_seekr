<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { m } from '$lib/paraglide/messages.js';

    export let disabled = false;
    export let username: string;;

    let mapContainer: HTMLElement;
    let map: any;
    let marker: any;
    let L: any;

    const dispatch = createEventDispatcher<{
        locationSelected: [number, number];
    }>();

    onMount(() => {
        
        const loadMap = async () => {
        L = await import('leaflet');

        map = L.map(mapContainer, {
            zoomControl: false
        }).setView([20, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        map.on('click', (e: any) => {
            if (disabled) return;

            const { lat, lng } = e.latlng;

            if (marker) {
                marker.setLatLng([lat, lng]);
            } else {
                marker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        html: `<img src="https://api.dicebear.com/9.x/miniavs/svg?seed=${username}" alt="${username}" class="w-10 h-10 rounded-full border-2 border-primary bg-base-100 p-0.5">`,
                        className: '',
                        iconSize: [32, 32],
                        iconAnchor: [16, 32]
                    })
                }).addTo(map);
            }
            dispatch('locationSelected', [lat, lng]);
        });

        return () => {
            if (map) {
                map.remove();
            }
        };
    }
    loadMap();
    });

    export function invalidateMapSize() {
        if (map) {
            map.invalidateSize();
        }
    }
</script>

<div class="relative w-full h-full">
    <div class="w-full h-full bg-base-200" bind:this={mapContainer}> </div>

    {#if !disabled}
         <div
            class="absolute top-2 left-1/2 -translate-x-1/2 bg-base-100/80 p-2 rounded-lg shadow-lg pointer-events-none z-[1000]"
        >
            <p class="text-sm font-semibold">{m.click_on_map()}</p>
        </div>
    {/if}
</div>