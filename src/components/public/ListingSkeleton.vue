<template>
  <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
    <div v-for="index in 6" :key="index" class="overflow-hidden rounded-3xl border bg-card shadow-panel">
      <div class="h-52 animate-pulse bg-muted"></div>
      <div class="space-y-3 p-5">
        <div class="h-5 w-1/3 animate-pulse rounded bg-muted"></div>
        <div class="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
        <div class="h-4 w-full animate-pulse rounded bg-muted"></div>
        <div class="h-4 w-5/6 animate-pulse rounded bg-muted"></div>
      </div>
    </div>
  </div>
</template>
