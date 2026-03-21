import { createRouter, createWebHistory } from 'vue-router';

import PublicLayout from '@/layouts/PublicLayout.vue';
import DiscoverPage from '@/pages/DiscoverPage.vue';
import EstablishmentDetailsPage from '@/pages/EstablishmentDetailsPage.vue';
import HomePage from '@/pages/HomePage.vue';
import NotFoundPage from '@/pages/NotFoundPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', name: 'home', component: HomePage },
        { path: 'discover', name: 'discover', component: DiscoverPage },
        {
          path: 'establishments/:id',
          name: 'establishment-details',
          component: EstablishmentDetailsPage,
          props: true,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }

    return { top: 0 };
  },
});

export default router;
