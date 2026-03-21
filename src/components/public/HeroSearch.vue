<script setup lang="ts">
import { ref } from 'vue';
import { Search, Sparkles } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePublicStore } from '@/stores/public';

const router = useRouter();
const publicStore = usePublicStore();
const search = ref('');

function submit() {
  router.push({
    name: 'discover',
    query: {
      search: search.value.trim() || undefined,
    },
  });
}
</script>

<template>
  <section class="public-shell pt-8">
    <Card class="hero-gradient overflow-hidden border-none text-white shadow-panel">
      <CardContent class="grid gap-10 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-14">
        <div>
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur-sm">
            <Sparkles class="h-4 w-4" />
            Verified local discovery
          </div>
          <h1 class="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
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

        <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
          <div class="rounded-2xl bg-white/14 p-4 backdrop-blur-sm">
            <p class="text-sm uppercase tracking-[0.18em] text-white/80">Search Fast</p>
            <p class="mt-2 text-lg font-semibold">Filter by type, city, and open now.</p>
          </div>
          <div class="rounded-2xl bg-white/14 p-4 backdrop-blur-sm">
            <p class="text-sm uppercase tracking-[0.18em] text-white/80">Ask Before You Go</p>
            <p class="mt-2 text-lg font-semibold">Send inquiry messages to establishments as a guest.</p>
          </div>
          <div class="rounded-2xl bg-white/14 p-4 backdrop-blur-sm">
            <p class="text-sm uppercase tracking-[0.18em] text-white/80">Check Reviews</p>
            <p class="mt-2 text-lg font-semibold">Read visitor feedback and submit your own review.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
