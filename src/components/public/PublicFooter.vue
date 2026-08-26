<script setup lang="ts">
import { Ambulance, Flame, Landmark, MapPinned, PhoneCall, Shield } from 'lucide-vue-next';
import { usePublicStore } from '@/stores/public';

const publicStore = usePublicStore();

const emergencyHotlines = [
  { label: 'MDRRMC / Ambulance', number: '09305094283', icon: Ambulance },
  { label: 'Fire Station', number: '09854632715', icon: Flame },
  { label: 'ZANECO', number: '09557453049', icon: Landmark },
  { label: 'Police Station', number: '09985986784', icon: Shield },
];
</script>

<template>
  <footer class="mt-20 border-t bg-card/70">
    <div class="public-shell grid gap-8 py-10 lg:grid-cols-[1.1fr_0.8fr_1fr]">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">City Connect</p>
        <h2 class="mt-2 text-2xl font-bold text-foreground">{{ publicStore.cityName }}</h2>
        <p class="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          A simple public platform for discovering trusted establishments, checking current status, and sending inquiries before you visit.
        </p>
      </div>

      <div class="grid content-start gap-3 text-sm text-muted-foreground">
        <div class="flex items-center gap-2">
          <MapPinned class="h-4 w-4 shrink-0 text-accent" />
          Browse verified establishments and city advisories.
        </div>
        <div class="flex items-center gap-2">
          <PhoneCall class="h-4 w-4 shrink-0 text-accent" />
          Ask questions directly through the public inquiry chat.
        </div>
      </div>

      <div class="rounded-lg border border-border/80 bg-background/70 p-4">
        <div class="flex items-center gap-2">
          <PhoneCall class="h-4 w-4 text-destructive" />
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">Emergency Hotlines</p>
        </div>

        <dl class="mt-4 grid gap-3 text-sm">
          <div
            v-for="hotline in emergencyHotlines"
            :key="hotline.label"
            class="grid grid-cols-[1fr_auto] items-center gap-3"
          >
            <dt class="flex min-w-0 items-center gap-2 text-muted-foreground">
              <component :is="hotline.icon" class="h-4 w-4 shrink-0 text-accent" />
              <span class="truncate">{{ hotline.label }}</span>
            </dt>
            <dd class="font-semibold tabular-nums text-foreground">
              <a :href="`tel:${hotline.number}`" class="transition hover:text-secondary">
                {{ hotline.number }}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </footer>
</template>
