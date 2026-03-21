<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
const categories = [
  { label: 'Tourist Spots', value: 'tourist_spot' },
  { label: 'Restaurants', value: 'restaurant' },
  { label: 'Clinics & Hospitals', value: 'clinic_hospital' },
  { label: 'Malls', value: 'mall' },
  { label: 'Other Services', value: 'other' },
];

function openCategory(category: string) {
  router.push({ name: 'discover', query: { category } });
}
</script>

<template>
  <section class="public-shell mt-10">
    <div class="flex flex-wrap gap-3">
      <button v-for="item in categories" :key="item.value" class="rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary" @click="openCategory(item.value)">
        {{ item.label }}
      </button>
    </div>
  </section>
</template>
