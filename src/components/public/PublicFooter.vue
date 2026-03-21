<script setup lang="ts">
import { MapPinned, PhoneCall } from 'lucide-vue-next';
import { usePublicStore } from '@/stores/public';

const publicStore = usePublicStore();
</script>

<template>
  <footer class="mt-20 border-t bg-card/70">
    <div class="public-shell grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr]">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">City Connect</p>
        <h2 class="mt-2 text-2xl font-bold text-foreground">{{ publicStore.cityName }}</h2>
        <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          A simple public platform for discovering trusted establishments, checking current status, and sending inquiries before you visit.
        </p>
      </div>

      <div class="grid gap-3 text-sm text-muted-foreground">
        <div class="flex items-center gap-2">
          <MapPinned class="h-4 w-4 text-accent" />
          Browse verified establishments and city advisories.
        </div>
        <div class="flex items-center gap-2">
          <PhoneCall class="h-4 w-4 text-accent" />
          Ask questions directly through the public inquiry chat.
        </div>
      </div>
    </div>
  </footer>
</template>
