<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ReviewItem } from '@/types/api';

defineProps<{
  reviews: ReviewItem[];
}>();
</script>

<template>
  <div class="space-y-4">
    <Card v-for="review in reviews" :key="review.id" class="shadow-panel">
      <CardContent class="p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <p class="font-semibold">{{ review.displayName }}</p>
              <Badge v-if="review.isAnonymous" variant="secondary">Anonymous</Badge>
            </div>
            <p class="text-sm text-muted-foreground">{{ new Date(review.createdAt).toLocaleDateString() }}</p>
          </div>
          <div class="rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-foreground">
            {{ review.rating }}/5
          </div>
        </div>

        <p class="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{{ review.comment }}</p>
      </CardContent>
    </Card>
  </div>
</template>
