<script setup lang="ts">
import { Star } from 'lucide-vue-next';
import type { ReviewsSummary } from '@/types/api';

defineProps<{
  summary: ReviewsSummary;
}>();
</script>

<template>
  <div class="rounded-3xl border bg-card p-5 shadow-panel">
    <div class="flex items-center gap-4">
      <div class="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <span class="text-3xl font-bold">{{ summary.averageRating.toFixed(1) }}</span>
        <span class="text-xs uppercase tracking-[0.18em]">Rating</span>
      </div>

      <div>
        <div class="flex items-center gap-1 text-accent">
          <Star v-for="star in 5" :key="star" class="h-4 w-4" :class="star <= Math.round(summary.averageRating) ? 'fill-current' : ''" />
        </div>
        <p class="mt-2 text-sm text-muted-foreground">{{ summary.totalReviews }} public review(s)</p>
      </div>
    </div>

    <div class="mt-5 space-y-2">
      <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="grid grid-cols-[40px_1fr_36px] items-center gap-3 text-sm">
        <span>{{ rating }}?</span>
        <div class="h-2 rounded-full bg-muted">
          <div class="h-2 rounded-full bg-accent" :style="{ width: `${summary.totalReviews ? (summary.ratingBreakdown[rating as 1 | 2 | 3 | 4 | 5] / summary.totalReviews) * 100 : 0}%` }" />
        </div>
        <span class="text-right text-muted-foreground">{{ summary.ratingBreakdown[rating as 1 | 2 | 3 | 4 | 5] }}</span>
      </div>
    </div>
  </div>
</template>
