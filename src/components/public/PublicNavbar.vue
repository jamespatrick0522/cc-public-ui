<script setup lang="ts">
import { computed, ref } from 'vue';
import { Menu, Search } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { usePublicStore } from '@/stores/public';

const router = useRouter();
const publicStore = usePublicStore();
const search = ref('');

const links = computed(() => [
  { to: '/', label: 'Home' },
  { to: '/discover', label: 'Discover' },
]);

function submitSearch() {
  router.push({
    name: 'discover',
    query: {
      search: search.value.trim() || undefined,
    },
  });
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
    <div class="public-shell flex h-20 items-center justify-between gap-4">
      <RouterLink to="/" class="flex min-w-0 items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">CC</div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold uppercase tracking-[0.18em] text-secondary">City Connect</p>
          <p class="truncate text-lg font-semibold text-foreground">{{ publicStore.cityName }}</p>
        </div>
      </RouterLink>

      <form class="hidden max-w-xl flex-1 items-center gap-2 lg:flex" @submit.prevent="submitSearch">
        <div class="relative flex-1">
          <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="search" class="h-11 rounded-full pl-9" placeholder="Search places, food, clinics, and more" />
        </div>
        <Button class="h-11 rounded-full px-5">Search</Button>
      </form>

      <nav class="hidden items-center gap-5 md:flex">
        <RouterLink v-for="item in links" :key="item.to" :to="item.to" class="text-sm font-medium text-foreground/80 transition hover:text-primary">
          {{ item.label }}
        </RouterLink>
      </nav>

      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="h-11 w-11 md:hidden">
            <Menu class="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" class="w-[320px]">
          <SheetHeader class="text-left">
            <SheetTitle>{{ publicStore.cityName }}</SheetTitle>
            <SheetDescription>{{ publicStore.cityTagline }}</SheetDescription>
          </SheetHeader>

          <form class="mt-5 flex items-center gap-2" @submit.prevent="submitSearch">
            <Input v-model="search" class="h-11" placeholder="Search places" />
            <Button class="h-11">Go</Button>
          </form>

          <div class="mt-6 space-y-3">
            <RouterLink v-for="item in links" :key="item.to" :to="item.to" class="block rounded-lg border px-4 py-3 text-base font-medium hover:bg-muted">
              {{ item.label }}
            </RouterLink>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
