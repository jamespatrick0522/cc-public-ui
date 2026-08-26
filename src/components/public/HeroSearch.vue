<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePublicStore } from '@/stores/public';

const router = useRouter();
const publicStore = usePublicStore();
const search = ref('');
const activeHeroIndex = ref(0);
let autoplayTimer: ReturnType<typeof window.setInterval> | null = null;

const heroImages = [
  { src: '/hero/IMG_1274.jpeg', alt: 'Kan-anan sa Baybay entrance at night', position: 'center' },
  { src: '/hero/IMG_1278.jpeg', alt: 'Indoor dining and bar area', position: 'center' },
  { src: '/hero/IMG_1267.jpeg', alt: 'Outdoor cafe seating at sunset', position: 'center' },
  { src: '/hero/IMG_1275.jpeg', alt: 'Sindangan Municipal Hall', position: 'center' },
  { src: '/hero/IMG_1269.webp', alt: 'Baywalk sunset view', position: 'center' },
  { src: '/hero/IMG_1273.jpeg', alt: 'Pool resort at sunset', position: 'center' },
  { src: '/hero/IMG_1276.jpeg', alt: 'Aerial view of JSB Lifestyle and Resorts pool', position: 'center' },
  { src: '/hero/IMG_1268.jpeg', alt: 'Hilltop pool overlooking the coast', position: 'center' },
];

const activeHeroAlt = computed(() => heroImages[activeHeroIndex.value]?.alt ?? 'City destination');

function submit() {
  router.push({
    name: 'discover',
    query: {
      search: search.value.trim() || undefined,
    },
  });
}

function showHeroImage(index: number) {
  activeHeroIndex.value = (index + heroImages.length) % heroImages.length;
}

function nextHeroImage() {
  showHeroImage(activeHeroIndex.value + 1);
}

function previousHeroImage() {
  showHeroImage(activeHeroIndex.value - 1);
}

function startAutoplay() {
  if (autoplayTimer) return;
  autoplayTimer = window.setInterval(nextHeroImage, 6000);
}

function stopAutoplay() {
  if (!autoplayTimer) return;
  window.clearInterval(autoplayTimer);
  autoplayTimer = null;
}

onMounted(startAutoplay);
onBeforeUnmount(stopAutoplay);
</script>

<template>
  <section class="public-shell pt-8">
    <div
      class="relative isolate overflow-hidden rounded-lg bg-foreground text-white shadow-panel"
      @mouseenter="stopAutoplay"
      @mouseleave="startAutoplay"
    >
      <div class="absolute inset-0">
        <img
          v-for="(image, index) in heroImages"
          :key="image.src"
          :src="image.src"
          :alt="image.alt"
          class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out"
          :class="index === activeHeroIndex ? 'opacity-100' : 'opacity-0'"
          :style="{ objectPosition: image.position }"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/25" />
        <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <div class="relative grid min-h-[520px] gap-8 px-6 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-14 lg:min-h-[560px]">
        <div class="flex max-w-3xl flex-col justify-center">
          <div class="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur-sm">
            <Sparkles class="h-4 w-4" />
            Verified local discovery
          </div>
          <h1 class="text-4xl font-bold leading-tight md:text-6xl">
            Explore trusted places in {{ publicStore.cityName }}.
          </h1>
          <p class="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            Find restaurants, tourist spots, clinics, malls, and helpful local services with live status, reviews, and direct inquiry chat.
          </p>

          <form class="mt-8 flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
            <div class="relative flex-1">
              <Search class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
              <Input v-model="search" class="h-12 rounded-full border-white/20 bg-white px-11 text-foreground" placeholder="What are you looking for today?" />
            </div>
            <Button class="h-12 rounded-full bg-accent px-6 text-accent-foreground hover:bg-accent/90">Discover Now</Button>
          </form>
        </div>

        <div class="flex flex-col justify-end gap-4">
          <div class="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div class="rounded-lg border border-white/15 bg-black/30 p-4 backdrop-blur-sm">
              <p class="text-sm uppercase tracking-[0.18em] text-white/80">Search Fast</p>
              <p class="mt-2 text-lg font-semibold">Filter by type, city, and open now.</p>
            </div>
            <div class="rounded-lg border border-white/15 bg-black/30 p-4 backdrop-blur-sm">
              <p class="text-sm uppercase tracking-[0.18em] text-white/80">Ask Before You Go</p>
              <p class="mt-2 text-lg font-semibold">Send inquiry messages to establishments as a guest.</p>
            </div>
            <div class="rounded-lg border border-white/15 bg-black/30 p-4 backdrop-blur-sm">
              <p class="text-sm uppercase tracking-[0.18em] text-white/80">Check Reviews</p>
              <p class="mt-2 text-lg font-semibold">Read visitor feedback and submit your own review.</p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-white">{{ activeHeroAlt }}</p>
              <p class="text-xs text-white/70">{{ activeHeroIndex + 1 }} / {{ heroImages.length }}</p>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition hover:bg-white/20"
                aria-label="Previous hero image"
                @click="previousHeroImage"
              >
                <ChevronLeft class="h-5 w-5" />
              </button>
              <button
                type="button"
                class="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition hover:bg-white/20"
                aria-label="Next hero image"
                @click="nextHeroImage"
              >
                <ChevronRight class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2" aria-label="Hero image carousel">
            <button
              v-for="(_, index) in heroImages"
              :key="index"
              type="button"
              class="h-2.5 rounded-full transition-all"
              :class="index === activeHeroIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'"
              :aria-label="`Show hero image ${index + 1}`"
              :aria-current="index === activeHeroIndex ? 'true' : undefined"
              @click="showHeroImage(index)"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

