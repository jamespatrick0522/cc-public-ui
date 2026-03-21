<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { searchEstablishments } from '@/api/establishments.api';
import { getReviews } from '@/api/reviews.api';
import EstablishmentCard from '@/components/public/EstablishmentCard.vue';
import FiltersBar from '@/components/public/FiltersBar.vue';
import ListingSkeleton from '@/components/public/ListingSkeleton.vue';
import { Button } from '@/components/ui/button';
import { usePublicStore } from '@/stores/public';
import type { Establishment } from '@/types/api';

const route = useRoute();
const router = useRouter();
const publicStore = usePublicStore();

const loading = ref(false);
const errorMessage = ref('');
const establishments = ref<Establishment[]>([]);

const queryState = computed(() => ({
  search: typeof route.query.search === 'string' ? route.query.search : undefined,
  category: typeof route.query.category === 'string' ? route.query.category : undefined,
  location: typeof route.query.location === 'string' ? route.query.location : undefined,
  openNow: route.query.openNow === 'true',
  minRating: typeof route.query.minRating === 'string' ? Number(route.query.minRating) : undefined,
  sort: typeof route.query.sort === 'string' ? route.query.sort : 'relevant',
  page: typeof route.query.page === 'string' ? Number(route.query.page) : 1,
}));

const filteredResults = computed(() => {
  let data = [...establishments.value];
  const state = queryState.value;

  if (state.location) {
    const q = state.location.toLowerCase();
    data = data.filter((item) => `${item.city} ${item.address}`.toLowerCase().includes(q));
  }

  if (state.minRating) {
    data = data.filter((item) => {
      const summary = publicStore.reviewSummaries[item.id];
      return summary ? summary.averageRating >= (state.minRating ?? 0) : false;
    });
  }

  if (state.sort === 'alphabetical') {
    data.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (state.sort === 'newest') {
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (state.sort === 'highest-rated') {
    data.sort((a, b) => {
      const ratingA = publicStore.reviewSummaries[a.id]?.averageRating ?? 0;
      const ratingB = publicStore.reviewSummaries[b.id]?.averageRating ?? 0;
      return ratingB - ratingA;
    });
  }

  return data;
});

const pagination = computed(() => {
  const pageSize = 12;
  const total = filteredResults.value.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(totalPages, Math.max(1, queryState.value.page || 1));
  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    total,
    totalPages,
    items: filteredResults.value.slice(offset, offset + pageSize),
  };
});

async function loadReviewSummaries(items: Establishment[]) {
  await Promise.all(
    items
      .filter((item) => !publicStore.reviewSummaries[item.id])
      .map(async (item) => {
        try {
          const response = await getReviews({ establishmentId: item.id, pageSize: 1 });
          publicStore.setReviewSummary(item.id, response.summary);
        } catch {
          // Listing cards can still render without review metadata.
        }
      }),
  );
}

async function load() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await searchEstablishments({
      search: queryState.value.search,
      category: queryState.value.category,
      openNow: queryState.value.openNow || undefined,
      page: 1,
      pageSize: 100,
    });

    establishments.value = response.data;
    await loadReviewSummaries(response.data);
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to load establishments.';
  } finally {
    loading.value = false;
  }
}

function applyFilters(payload: {
  search?: string;
  category?: string;
  location?: string;
  openNow?: boolean;
  minRating?: number;
  sort?: string;
}) {
  router.push({
    name: 'discover',
    query: {
      search: payload.search,
      category: payload.category,
      location: payload.location,
      openNow: payload.openNow ? 'true' : undefined,
      minRating: payload.minRating ? String(payload.minRating) : undefined,
      sort: payload.sort || undefined,
      page: '1',
    },
  });
}

function goToPage(page: number) {
  router.push({
    name: 'discover',
    query: {
      ...route.query,
      page: String(page),
    },
  });
}

watch(
  () => [queryState.value.search, queryState.value.category, queryState.value.openNow],
  () => {
    void load();
  },
);

onMounted(load);
</script>

<template>
  <section class="public-shell py-10">
    <div class="mb-6">
      <p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Discover Establishments</p>
      <h1 class="section-heading mt-2">Browse places by category, rating, or current availability.</h1>
      <p class="mt-3 max-w-3xl text-base text-muted-foreground">
        Use filters to narrow down places that fit your trip, errand, or quick stop around the city.
      </p>
    </div>

    <FiltersBar :initial-values="queryState" @apply="applyFilters" />

    <div class="mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>{{ pagination.total }} result(s) found</p>
      <p>Page {{ pagination.page }} of {{ pagination.totalPages }}</p>
    </div>

    <p v-if="errorMessage" class="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {{ errorMessage }}
    </p>

    <div class="mt-6">
      <ListingSkeleton v-if="loading" />

      <div v-else-if="!pagination.items.length" class="rounded-3xl border border-dashed bg-card p-8 text-center text-muted-foreground shadow-panel">
        No establishments matched your current filters.
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <EstablishmentCard
          v-for="item in pagination.items"
          :key="item.id"
          :establishment="item"
          :review-summary="publicStore.reviewSummaries[item.id]"
        />
      </div>
    </div>

    <div v-if="pagination.totalPages > 1" class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" class="rounded-full" :disabled="pagination.page <= 1" @click="goToPage(pagination.page - 1)">
        Previous
      </Button>
      <Button v-for="page in pagination.totalPages" :key="page" :variant="page === pagination.page ? 'default' : 'outline'" class="rounded-full" @click="goToPage(page)">
        {{ page }}
      </Button>
      <Button variant="outline" class="rounded-full" :disabled="pagination.page >= pagination.totalPages" @click="goToPage(pagination.page + 1)">
        Next
      </Button>
    </div>
  </section>
</template>


