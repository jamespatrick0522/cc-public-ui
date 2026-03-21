<script setup lang="ts">
import { computed } from 'vue';
import { Heart, MapPin, Star } from 'lucide-vue-next';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePublicStore } from '@/stores/public';
import type { Establishment, ReviewsSummary } from '@/types/api';

const props = defineProps<{
  establishment: Establishment;
  reviewSummary?: ReviewsSummary | null;
}>();

const publicStore = usePublicStore();
const isFavorite = computed(() => publicStore.favoriteIds.includes(props.establishment.id));

function toggleFavorite() {
  publicStore.toggleFavorite(props.establishment.id);
}
</script>

<template>
  <Card class="group h-full overflow-hidden border-0 shadow-panel transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div class="relative h-52 overflow-hidden bg-muted">
      <img v-if="establishment.coverPhotoUrl" :src="establishment.coverPhotoUrl" :alt="establishment.name" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div v-else class="flex h-full items-center justify-center bg-gradient-to-br from-secondary/25 to-accent/25 text-lg font-semibold text-foreground/70">
        {{ establishment.name }}
      </div>

      <button class="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-foreground shadow" @click.prevent="toggleFavorite">
        <Heart :class="['h-4 w-4', isFavorite ? 'fill-primary text-primary' : 'text-foreground/70']" />
      </button>
    </div>

    <CardContent class="p-5">
      <div class="mb-3 flex items-center justify-between gap-2">
        <Badge variant="secondary">{{ establishment.category.replace('_', ' ') }}</Badge>
        <Badge :variant="establishment.isOpenNow ? 'default' : 'outline'">
          {{ establishment.isOpenNow ? 'Open now' : establishment.businessStatus.replace('_', ' ') }}
        </Badge>
      </div>

      <RouterLink :to="`/establishments/${establishment.id}`" class="block">
        <h3 class="text-xl font-semibold text-foreground transition group-hover:text-primary">{{ establishment.name }}</h3>
      </RouterLink>

      <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{{ establishment.description || 'No description provided yet.' }}</p>

      <div class="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin class="mt-0.5 h-4 w-4 text-secondary" />
        <span>{{ establishment.address }}</span>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm">
          <Star class="h-4 w-4 fill-accent text-accent" />
          <span v-if="reviewSummary && reviewSummary.totalReviews > 0">
            {{ reviewSummary.averageRating.toFixed(1) }} ({{ reviewSummary.totalReviews }})
          </span>
          <span v-else class="text-muted-foreground">No reviews yet</span>
        </div>

        <Button as-child size="sm" class="rounded-full">
          <RouterLink :to="`/establishments/${establishment.id}`">View details</RouterLink>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
