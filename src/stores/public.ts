import { computed, ref } from "vue";
import { defineStore } from "pinia";

import type { ReviewSummaryMap } from "@/types/api";

const FAVORITES_KEY = "city_connect_public_favorites";

function readFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  if (!raw) {
    return [] as string[];
  }

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export const usePublicStore = defineStore("public", () => {
  const cityName = computed(
    () => import.meta.env.VITE_CITY_NAME || "Sindangan, Zamboanga del Norte",
  );
  const cityTagline = computed(
    () =>
      import.meta.env.VITE_CITY_TAGLINE ||
      "Discover trusted places, services, and local favorites.",
  );
  const favoriteIds = ref<string[]>(readFavorites());
  const reviewSummaries = ref<ReviewSummaryMap>({});

  function toggleFavorite(establishmentId: string) {
    if (favoriteIds.value.includes(establishmentId)) {
      favoriteIds.value = favoriteIds.value.filter(
        (id) => id !== establishmentId,
      );
    } else {
      favoriteIds.value = [...favoriteIds.value, establishmentId];
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds.value));
  }

  function setReviewSummary(
    establishmentId: string,
    summary: ReviewSummaryMap[string],
  ) {
    reviewSummaries.value = {
      ...reviewSummaries.value,
      [establishmentId]: summary,
    };
  }

  return {
    cityName,
    cityTagline,
    favoriteIds,
    reviewSummaries,
    toggleFavorite,
    setReviewSummary,
  };
});
