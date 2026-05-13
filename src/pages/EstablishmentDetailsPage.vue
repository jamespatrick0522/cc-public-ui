<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Clock3, Mail, MapPin, MessageCircleMore, PhoneCall, ShieldAlert, Star } from 'lucide-vue-next';

import { getAnnouncements } from '@/api/announcements.api';
import { getEstablishmentById } from '@/api/establishments.api';
import { createReport } from '@/api/reports.api';
import { createReview, getReviews } from '@/api/reviews.api';
import CallEstablishmentDialog from '@/components/public/CallEstablishmentDialog.vue';
import GuestChatPanel from '@/components/public/GuestChatPanel.vue';
import ReportDialog from '@/components/public/ReportDialog.vue';
import ReviewForm from '@/components/public/ReviewForm.vue';
import ReviewList from '@/components/public/ReviewList.vue';
import ReviewSummary from '@/components/public/ReviewSummary.vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePublicStore } from '@/stores/public';
import type { Announcement, CreateReviewPayload, Establishment, ReviewItem, ReviewsSummary } from '@/types/api';

const route = useRoute();
const publicStore = usePublicStore();

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const chatOpen = ref(false);
const callOpen = ref(false);
const reportOpen = ref(false);

const establishment = ref<Establishment | null>(null);
const reviews = ref<ReviewItem[]>([]);
const summary = ref<ReviewsSummary>({
  averageRating: 0,
  totalReviews: 0,
  ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
});
const advisories = ref<Announcement[]>([]);

const establishmentId = computed(() => String(route.params.id || ''));
const serviceList = computed(() =>
  establishment.value?.services
    ? establishment.value.services.split(',').map((item) => item.trim()).filter(Boolean)
    : [],
);
const mapUrl = computed(() => {
  if (!establishment.value?.address) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(establishment.value.address)}`;
});

async function load() {
  if (!establishmentId.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const place = await getEstablishmentById(establishmentId.value);
    establishment.value = place;

    const [reviewResponse, advisoryResponse] = await Promise.all([
      getReviews({ establishmentId: establishmentId.value, page: 1, pageSize: 8 }),
      getAnnouncements({ city: place.city, limit: 3 }),
    ]);

    reviews.value = reviewResponse.data;
    summary.value = reviewResponse.summary;
    advisories.value = advisoryResponse;
    publicStore.setReviewSummary(establishmentId.value, reviewResponse.summary);
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to load this establishment.';
  } finally {
    loading.value = false;
  }
}

async function submitReview(payload: CreateReviewPayload) {
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await createReview(payload);
    successMessage.value = 'Thank you. Your review was submitted successfully.';
    await load();
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to submit your review.';
  }
}

async function submitReport(payload: { establishmentId: string; reason: string; details?: string }) {
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await createReport(payload);
    reportOpen.value = false;
    successMessage.value = 'Your report was submitted. Thank you for helping keep listings accurate.';
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to submit your report.';
  }
}

async function openReviewSection() {
  await nextTick();
  document.getElementById('write-review')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

onMounted(load);
</script>

<template>
  <section class="public-shell py-10">
    <div v-if="loading" class="space-y-6">
      <div class="h-72 animate-pulse rounded-3xl bg-muted"></div>
      <div class="h-8 w-1/3 animate-pulse rounded bg-muted"></div>
      <div class="h-5 w-2/3 animate-pulse rounded bg-muted"></div>
    </div>

    <div v-else-if="errorMessage && !establishment" class="rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-destructive">
      {{ errorMessage }}
    </div>

    <div v-else-if="establishment">
      <div class="mb-5 text-sm text-muted-foreground">
        <RouterLink to="/" class="hover:text-primary">Home</RouterLink>
        <span class="mx-2">/</span>
        <RouterLink to="/discover" class="hover:text-primary">Discover</RouterLink>
        <span class="mx-2">/</span>
        <span>{{ establishment.name }}</span>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div class="overflow-hidden rounded-3xl border bg-card shadow-panel">
            <div class="h-[320px] bg-muted sm:h-[420px]">
              <img v-if="establishment.coverPhotoUrl" :src="establishment.coverPhotoUrl" :alt="establishment.name" class="h-full w-full object-cover" />
              <div v-else class="flex h-full items-center justify-center bg-gradient-to-br from-secondary/25 to-accent/30 text-2xl font-semibold text-foreground/70">
                {{ establishment.name }}
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{{ establishment.category.replace('_', ' ') }}</Badge>
            <Badge :variant="establishment.isOpenNow ? 'default' : 'outline'">{{ establishment.isOpenNow ? 'Open now' : establishment.businessStatus.replace('_', ' ') }}</Badge>
            <Badge v-if="establishment.statusNote" variant="outline">{{ establishment.statusNote }}</Badge>
          </div>

          <h1 class="mt-4 text-4xl font-bold text-foreground md:text-5xl">{{ establishment.name }}</h1>
          <p class="mt-4 max-w-4xl text-base leading-relaxed text-muted-foreground">{{ establishment.description || 'No detailed description provided yet.' }}</p>

          <div class="mt-6 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div class="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-panel">
              <MapPin class="mt-0.5 h-4 w-4 text-secondary" />
              <div>
                <p class="font-medium text-foreground">Address</p>
                <p>{{ establishment.address }}</p>
                <a v-if="mapUrl" :href="mapUrl" target="_blank" rel="noreferrer" class="mt-2 inline-block text-secondary hover:underline">Open in Maps</a>
              </div>
            </div>
            <div class="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-panel">
              <Clock3 class="mt-0.5 h-4 w-4 text-secondary" />
              <div>
                <p class="font-medium text-foreground">Business hours</p>
                <p>{{ establishment.opensAt || 'N/A' }} - {{ establishment.closesAt || 'N/A' }}</p>
              </div>
            </div>
            <div v-if="establishment.contactNumber" class="rounded-2xl border bg-card p-4 shadow-panel">
              <p class="font-medium text-foreground">Contact number</p>
              <p class="mt-1 text-muted-foreground">{{ establishment.contactNumber }}</p>
            </div>
            <div v-if="establishment.email" class="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-panel">
              <Mail class="mt-0.5 h-4 w-4 text-secondary" />
              <div>
                <p class="font-medium text-foreground">Email</p>
                <p>{{ establishment.email }}</p>
              </div>
            </div>
          </div>

          <div v-if="serviceList.length" class="mt-8">
            <h2 class="text-2xl font-semibold text-foreground">Services / Offerings</h2>
            <div class="mt-4 flex flex-wrap gap-3">
              <Badge v-for="service in serviceList" :key="service" variant="outline">{{ service }}</Badge>
            </div>
          </div>
        </div>

        <div class="space-y-5">
          <Card class="shadow-panel">
            <CardContent class="space-y-4 p-5">
              <div class="flex items-center gap-3">
                <Star class="h-8 w-8 fill-accent text-accent" />
                <div>
                  <p class="text-3xl font-bold text-foreground">{{ summary.averageRating.toFixed(1) }}</p>
                  <p class="text-sm text-muted-foreground">{{ summary.totalReviews }} review(s)</p>
                </div>
              </div>

              <div class="grid gap-3">
                <Button class="h-12 justify-start" @click="chatOpen = true">
                  <MessageCircleMore class="mr-2 h-4 w-4" />
                  Send inquiry
                </Button>
                <Button variant="outline" class="h-12 justify-start" @click="callOpen = true">
                  <PhoneCall class="mr-2 h-4 w-4" />
                  Call establishment
                </Button>
                <Button variant="outline" class="h-12 justify-start" @click="reportOpen = true">
                  <ShieldAlert class="mr-2 h-4 w-4" />
                  Submit report
                </Button>
                <Button variant="secondary" class="h-12 justify-start" @click="openReviewSection">
                  <Star class="mr-2 h-4 w-4" />
                  Write review
                </Button>
              </div>
            </CardContent>
          </Card>

          <div v-if="advisories.length" class="rounded-3xl border bg-card p-5 shadow-panel">
            <h2 class="text-xl font-semibold text-foreground">City advisories</h2>
            <div class="mt-4 space-y-3">
              <div v-for="item in advisories" :key="item.id" class="rounded-2xl border bg-background p-4">
                <div class="mb-2 flex items-center justify-between gap-2">
                  <h3 class="font-semibold">{{ item.title }}</h3>
                  <Badge variant="secondary">{{ item.city }}</Badge>
                </div>
                <p class="line-clamp-3 text-sm text-muted-foreground">{{ item.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-if="successMessage" class="mt-6 rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">{{ successMessage }}</p>
      <p v-if="errorMessage && establishment" class="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{{ errorMessage }}</p>

      <div class="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <ReviewSummary :summary="summary" />
        <div id="write-review">
          <ReviewForm :establishment-id="establishment.id" @submit="submitReview" />
        </div>
      </div>

      <section class="mt-10">
        <h2 class="section-heading">Visitor Reviews</h2>
        <p class="mt-3 text-base text-muted-foreground">Helpful experiences from other tourists and local visitors.</p>
        <div class="mt-6">
          <ReviewList v-if="reviews.length" :reviews="reviews" />
          <div v-else class="rounded-3xl border border-dashed bg-card p-8 text-center text-muted-foreground shadow-panel">
            No reviews yet. Be the first to share your experience.
          </div>
        </div>
      </section>

      <GuestChatPanel :open="chatOpen" :establishment-id="establishment.id" :establishment-name="establishment.name" @close="chatOpen = false" />
      <CallEstablishmentDialog :open="callOpen" :establishment-id="establishment.id" :establishment-name="establishment.name" @close="callOpen = false" />
      <ReportDialog :open="reportOpen" :establishment-id="establishment.id" @close="reportOpen = false" @submit="submitReport" />
    </div>
  </section>
</template>
