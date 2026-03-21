<template>
  <div class="public-shell flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">404</p>
    <h1 class="mt-3 text-5xl font-bold text-foreground">Page not found</h1>
    <p class="mt-4 max-w-xl text-base text-muted-foreground">
      The page you are looking for may have been moved or the establishment link may no longer be available.
    </p>
    <RouterLink to="/discover" class="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
      Go back to Discover
    </RouterLink>
  </div>
</template>
