<script setup lang="ts">
import { reactive, watch } from 'vue';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const props = defineProps<{
  initialValues: {
    search?: string;
    category?: string;
    location?: string;
    openNow?: boolean;
    minRating?: number;
    sort?: string;
  };
}>();

const emit = defineEmits<{
  apply: [payload: {
    search?: string;
    category?: string;
    location?: string;
    openNow?: boolean;
    minRating?: number;
    sort?: string;
  }];
}>();

const form = reactive({
  search: props.initialValues.search || '',
  category: props.initialValues.category || '',
  location: props.initialValues.location || '',
  openNow: props.initialValues.openNow || false,
  minRating: props.initialValues.minRating ? String(props.initialValues.minRating) : '',
  sort: props.initialValues.sort || 'relevant',
});

watch(
  () => props.initialValues,
  (value) => {
    form.search = value.search || '';
    form.category = value.category || '';
    form.location = value.location || '';
    form.openNow = value.openNow || false;
    form.minRating = value.minRating ? String(value.minRating) : '';
    form.sort = value.sort || 'relevant';
  },
  { deep: true },
);

function applyFilters() {
  emit('apply', {
    search: form.search.trim() || undefined,
    category: form.category || undefined,
    location: form.location.trim() || undefined,
    openNow: form.openNow || undefined,
    minRating: form.minRating ? Number(form.minRating) : undefined,
    sort: form.sort,
  });
}
</script>

<template>
  <div class="rounded-3xl border bg-card p-4 shadow-panel">
    <div class="grid gap-3 lg:grid-cols-[1.2fr_repeat(4,0.8fr)_auto]">
      <Input v-model="form.search" class="h-11" placeholder="Search by name or keyword" />

      <select v-model="form.category" class="h-11 rounded-md border bg-background px-3 text-sm">
        <option value="">All categories</option>
        <option value="tourist_spot">Tourist Spot</option>
        <option value="restaurant">Restaurant</option>
        <option value="clinic_hospital">Clinic / Hospital</option>
        <option value="mall">Mall</option>
        <option value="other">Other</option>
      </select>

      <Input v-model="form.location" class="h-11" placeholder="Location / district" />

      <select v-model="form.minRating" class="h-11 rounded-md border bg-background px-3 text-sm">
        <option value="">Any rating</option>
        <option value="4">4 stars & up</option>
        <option value="3">3 stars & up</option>
        <option value="2">2 stars & up</option>
      </select>

      <select v-model="form.sort" class="h-11 rounded-md border bg-background px-3 text-sm">
        <option value="relevant">Most relevant</option>
        <option value="highest-rated">Highest rated</option>
        <option value="newest">Newest</option>
        <option value="alphabetical">Alphabetical</option>
      </select>

      <div class="flex items-center justify-between rounded-md border bg-background px-3 text-sm lg:h-11">
        <span>Open now</span>
        <input v-model="form.openNow" type="checkbox" class="h-4 w-4 rounded border" />
      </div>

      <Button class="h-11" @click="applyFilters">Apply</Button>
    </div>
  </div>
</template>
