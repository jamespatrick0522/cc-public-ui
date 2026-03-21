<script setup lang="ts">
import { reactive, ref } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CreateReviewPayload } from '@/types/api';

const props = defineProps<{
  establishmentId: string;
}>();

const emit = defineEmits<{
  submit: [payload: CreateReviewPayload];
}>();

const form = reactive({
  reviewerName: '',
  reviewerAlias: '',
  rating: 5,
  comment: '',
  isAnonymous: false,
});

const errorMessage = ref('');

function submitForm() {
  errorMessage.value = '';

  if (!form.comment.trim()) {
    errorMessage.value = 'Please write a short review.';
    return;
  }

  if (!form.isAnonymous && !form.reviewerName.trim()) {
    errorMessage.value = 'Please enter your name or post anonymously.';
    return;
  }

  emit('submit', {
    establishmentId: props.establishmentId,
    rating: form.rating,
    comment: form.comment.trim(),
    reviewerName: form.isAnonymous ? undefined : form.reviewerName.trim(),
    isAnonymous: form.isAnonymous,
    reviewerAlias: form.isAnonymous ? form.reviewerAlias.trim() || undefined : undefined,
  });
}
</script>

<template>
  <form class="rounded-3xl border bg-card p-5 shadow-panel" @submit.prevent="submitForm">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <Label>Your name</Label>
        <Input v-model="form.reviewerName" class="h-11" :disabled="form.isAnonymous" placeholder="Optional if anonymous is checked" />
      </div>
      <div class="space-y-2">
        <Label>Anonymous alias</Label>
        <Input v-model="form.reviewerAlias" class="h-11" :disabled="!form.isAnonymous" placeholder="Anonymous Visitor" />
      </div>
    </div>

    <div class="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
      <div class="space-y-2">
        <Label>Rating</Label>
        <select v-model="form.rating" class="h-11 w-full rounded-md border bg-background px-3 text-sm">
          <option :value="5">5 - Excellent</option>
          <option :value="4">4 - Good</option>
          <option :value="3">3 - Average</option>
          <option :value="2">2 - Poor</option>
          <option :value="1">1 - Bad</option>
        </select>
      </div>

      <div class="flex items-end justify-between rounded-2xl border bg-background px-4 py-3 text-sm">
        <div>
          <p class="font-medium">Post anonymously</p>
          <p class="text-muted-foreground">Your review can appear as “Anonymous Visitor”.</p>
        </div>
        <input v-model="form.isAnonymous" type="checkbox" class="h-5 w-5 rounded border" />
      </div>
    </div>

    <div class="mt-4 space-y-2">
      <Label>Comment</Label>
      <Textarea v-model="form.comment" class="min-h-[120px]" placeholder="Share your experience to help other visitors." />
    </div>

    <p v-if="errorMessage" class="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {{ errorMessage }}
    </p>

    <Button class="mt-4 h-11">Submit review</Button>
  </form>
</template>
