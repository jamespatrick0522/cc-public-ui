# City Connect Public UI

Tourist and public-facing frontend for discovering establishments, checking advisories, reading reviews, and sending guest inquiries.

## Stack

- Vue 3 + TypeScript
- Vue Router + Pinia
- Axios API service layer
- Tailwind CSS + shadcn-vue UI primitives
- Polling-based guest chat thread refresh

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Env

- `VITE_API_BASE_URL=http://localhost:3000/api/v1`
- `VITE_CITY_NAME=Sindangan, Zamboanga del Norte`
- `VITE_CITY_TAGLINE=Discover trusted places, services, and local favorites.`

## Public Pages

- Home page
- Discover / listing page
- Establishment details page
- Guest inquiry chat panel
- Review submission UI
- Report submission dialog

## Folder Structure

```text
src/
  api/
    announcements.api.ts
    establishments.api.ts
    http.ts
    messages.api.ts
    reports.api.ts
    reviews.api.ts
  components/
    public/
      CategoryQuickLinks.vue
      EstablishmentCard.vue
      FiltersBar.vue
      GuestChatPanel.vue
      HeroSearch.vue
      ListingSkeleton.vue
      PublicFooter.vue
      PublicNavbar.vue
      ReportDialog.vue
      ReviewForm.vue
      ReviewList.vue
      ReviewSummary.vue
    ui/
  layouts/
    PublicLayout.vue
  pages/
    DiscoverPage.vue
    EstablishmentDetailsPage.vue
    HomePage.vue
    NotFoundPage.vue
  router/
    index.ts
  stores/
    public.ts
  types/
    api.ts
```

## Public API Mapping

- `GET /establishments`
  - Home featured cards
  - Discover page listing/filter source
- `GET /establishments/:id`
  - Establishment details page
- `GET /announcements`
  - Home advisories
  - Details page city advisories
- `POST /messages/guest`
  - Guest sends inquiry
- `GET /messages/guest-thread`
  - Guest conversation polling using signed conversation token
- `POST /reports`
  - Public report submission dialog
- `GET /reviews`
  - Listing card rating summary
  - Establishment review list and summary
- `POST /reviews`
  - Public review submission

## Assumptions

- Public listings should default to verified establishments only.
- Guest users can chat without login using full name plus email or phone.
- Favorites are local-only in this UI because the backend favorites flow currently expects a user id.
- Home page �featured� items currently use the newest verified establishments because there is no dedicated featured endpoint.

## Current Backend Gaps / Notes

- Public websocket chat is still not available for tourists, so the UI uses polling via `GET /messages/guest-thread` every 5 seconds.
- Structured barangay/district filtering is not available yet in the API schema, so the location filter currently matches against address/city text.
- Server-side sorting for rating/location is not available yet, so some Tourist UI sorting/filtering is performed client-side after fetching the public listing set.
