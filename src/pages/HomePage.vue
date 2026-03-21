<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ArrowRight, Megaphone } from 'lucide-vue-next';

import { getAnnouncements } from '@/api/announcements.api';
import { searchEstablishments } from '@/api/establishments.api';
import { getReviews } from '@/api/reviews.api';
import CategoryQuickLinks from '@/components/public/CategoryQuickLinks.vue';
import EstablishmentCard from '@/components/public/EstablishmentCard.vue';
import HeroSearch from '@/components/public/HeroSearch.vue';
import ListingSkeleton from '@/components/public/ListingSkeleton.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePublicStore } from '@/stores/public';
import type { Announcement, Establishment } from '@/types/api';

const publicStore = usePublicStore();
const loading = ref(false);
const featured = ref<Establishment[]>([]);
const announcements = ref<Announcement[]>([]);

const favoritesCount = computed(() => publicStore.favoriteIds.length);

async function loadReviewSummaries(establishments: Establishment[]) {
  await Promise.all(
    establishments
      .filter((item) => !publicStore.reviewSummaries[item.id])
      .map(async (item) => {
        try {
          const response = await getReviews({ establishmentId: item.id, pageSize: 1 });
          publicStore.setReviewSummary(item.id, response.summary);
        } catch {
          // Keep cards resilient even if reviews are unavailable.
        }
      }),
  );
}

async function load() {
  loading.value = true;

  try {
    const [featuredResponse, advisoryResponse] = await Promise.all([
      searchEstablishments({ page: 1, pageSize: 6 }),
      getAnnouncements({ limit: 3 }),
    ]);

    featured.value = featuredResponse.data;
    announcements.value = advisoryResponse;
    await loadReviewSummaries(featuredResponse.data);
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <HeroSearch />
    <CategoryQuickLinks />

    <section class="public-shell mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <Card class="glass-panel border-0 shadow-panel">
        <CardContent class="p-6">
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Why use City Connect</p>
          <h2 class="mt-3 section-heading max-w-xl">Plan visits with less guesswork and more confidence.</h2>
          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border bg-background/70 p-4">
              <p class="text-2xl font-bold text-primary">{{ featured.length }}</p>
              <p class="mt-1 text-sm text-muted-foreground">Featured places today</p>
            </div>
            <div class="rounded-2xl border bg-background/70 p-4">
              <p class="text-2xl font-bold text-primary">{{ announcements.length }}</p>
              <p class="mt-1 text-sm text-muted-foreground">Active advisories</p>
            </div>
            <div class="rounded-2xl border bg-background/70 p-4">
              <p class="text-2xl font-bold text-primary">{{ favoritesCount }}</p>
              <p class="mt-1 text-sm text-muted-foreground">Saved locally on this device</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="glass-panel border-0 shadow-panel">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-2xl">
            <Megaphone class="h-5 w-5 text-accent" />
            Latest Advisories
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="!announcements.length" class="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
            No advisories available right now.
          </div>
          <div v-for="item in announcements" :key="item.id" class="rounded-2xl border bg-background/70 p-4">
            <div class="mb-2 flex items-center justify-between gap-2">
              <h3 class="font-semibold">{{ item.title }}</h3>
              <Badge variant="secondary">{{ item.city }}</Badge>
            </div>
            <p class="line-clamp-2 text-sm text-muted-foreground">{{ item.content }}</p>
          </div>
        </CardContent>
      </Card>
    </section>

    <section class="public-shell mt-14">
      <div class="mb-6 flex items-end justify-between gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Featured Listings</p>
          <h2 class="section-heading mt-2">Start with trusted, visitor-friendly establishments.</h2>
        </div>
        <Button as-child variant="outline" class="rounded-full">
          <RouterLink to="/discover">
            Explore all
            <ArrowRight class="ml-2 h-4 w-4" />
          </RouterLink>
        </Button>
      </div>

      <ListingSkeleton v-if="loading" />
      <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <EstablishmentCard
          v-for="item in featured"
          :key="item.id"
          :establishment="item"
          :review-summary="publicStore.reviewSummaries[item.id]"
        />
      </div>
    </section>
  </div>
</template>
