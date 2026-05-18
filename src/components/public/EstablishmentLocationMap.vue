<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import L from 'leaflet';
import { LocateFixed, MapPin } from 'lucide-vue-next';

import { Button } from '@/components/ui/button';

const props = defineProps<{
  latitude?: string | null;
  longitude?: string | null;
  name: string;
  address?: string | null;
}>();

const mapKey = import.meta.env.VITE_MAPTILER_API_KEY as string | undefined;
const mapElement = ref<HTMLElement | null>(null);
const locationMessage = ref('');

let map: L.Map | null = null;
let userMarker: L.Marker | null = null;

const latitudeNumber = computed(() => parseCoordinate(props.latitude));
const longitudeNumber = computed(() => parseCoordinate(props.longitude));
const hasCoordinates = computed(() => isValidCoordinate(latitudeNumber.value, longitudeNumber.value));
const hasAddress = computed(() => Boolean(props.address?.trim()));
const googleMapsUrl = computed(() => {
  if (hasCoordinates.value) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitudeNumber.value},${longitudeNumber.value}`;
  }

  if (hasAddress.value) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.address!.trim())}`;
  }

  return null;
});
const wazeUrl = computed(() => {
  if (!hasCoordinates.value) {
    return null;
  }

  return `https://waze.com/ul?ll=${latitudeNumber.value},${longitudeNumber.value}&navigate=yes`;
});

function parseCoordinate(value?: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidCoordinate(latitude: number | null, longitude: number | null): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function pointIcon(className: string) {
  return L.divIcon({
    className,
    html: '<span></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function initializeMap() {
  if (!mapElement.value || !mapKey || !hasCoordinates.value) {
    return;
  }

  const destination: [number, number] = [latitudeNumber.value!, longitudeNumber.value!];
  map = L.map(mapElement.value, {
    center: destination,
    zoom: 16,
    zoomControl: true,
  });

  L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapKey}`, {
    attribution:
      '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    tileSize: 512,
    zoomOffset: -1,
  }).addTo(map);

  L.marker(destination, {
    icon: pointIcon('cc-establishment-marker'),
  })
    .addTo(map)
    .bindPopup(props.name);
}

function showMyLocation() {
  locationMessage.value = '';

  if (!map || !navigator.geolocation) {
    locationMessage.value = 'Location detection is unavailable in this browser.';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const current: [number, number] = [position.coords.latitude, position.coords.longitude];

      if (!userMarker) {
        userMarker = L.marker(current, {
          icon: pointIcon('cc-user-marker'),
        })
          .addTo(map!)
          .bindPopup('Your location');
      } else {
        userMarker.setLatLng(current);
      }

      map!.fitBounds([current, [latitudeNumber.value!, longitudeNumber.value!]], {
        padding: [36, 36],
        maxZoom: 16,
      });
    },
    () => {
      locationMessage.value = 'Location permission was denied or unavailable.';
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

onMounted(initializeMap);

onUnmounted(() => {
  map?.remove();
  map = null;
  userMarker = null;
});
</script>

<template>
  <section class="rounded-3xl border bg-card p-5 shadow-panel">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Location</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ address?.trim() || 'No address provided yet.' }}
        </p>
      </div>
      <MapPin class="h-5 w-5 text-secondary" />
    </div>

    <div v-if="hasCoordinates && mapKey" ref="mapElement" class="mt-4 h-80 overflow-hidden rounded-2xl border bg-muted"></div>
    <div v-else class="mt-4 rounded-2xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">
      <p v-if="hasCoordinates && !mapKey">
        Map preview is unavailable until the MapTiler API key is configured.
      </p>
      <p v-else-if="hasAddress">
        This listing does not have an exact map pin yet. You can still open the address in Google Maps.
      </p>
      <p v-else>
        This listing does not have a map pin or address yet.
      </p>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <Button v-if="hasCoordinates && mapKey" type="button" variant="outline" class="h-10" @click="showMyLocation">
        <LocateFixed class="mr-2 h-4 w-4" />
        Show My Location
      </Button>
      <Button v-if="googleMapsUrl" as-child type="button" class="h-10">
        <a :href="googleMapsUrl" target="_blank" rel="noreferrer">Open in Google Maps</a>
      </Button>
      <Button v-if="wazeUrl" as-child type="button" variant="secondary" class="h-10">
        <a :href="wazeUrl" target="_blank" rel="noreferrer">Open in Waze</a>
      </Button>
    </div>

    <p v-if="locationMessage" class="mt-3 text-sm text-destructive">{{ locationMessage }}</p>
  </section>
</template>

<style scoped>
:global(.cc-establishment-marker),
:global(.cc-user-marker) {
  background: transparent;
}

:global(.cc-establishment-marker span),
:global(.cc-user-marker span) {
  display: block;
  width: 24px;
  height: 24px;
  border: 3px solid white;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgb(0 0 0 / 0.25);
}

:global(.cc-establishment-marker span) {
  background: hsl(var(--primary));
}

:global(.cc-user-marker span) {
  background: hsl(var(--secondary));
}
</style>
