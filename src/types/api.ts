export type EstablishmentCategory =
  | 'tourist_spot'
  | 'restaurant'
  | 'clinic_hospital'
  | 'mall'
  | 'other';

export type ListingStatus = 'pending' | 'verified' | 'rejected';
export type BusinessStatus = 'open' | 'closed' | 'temporarily_closed';

export interface Establishment {
  id: string;
  ownerUserId: string | null;
  city: string;
  name: string;
  category: EstablishmentCategory;
  address: string;
  description: string | null;
  services: string | null;
  contactNumber: string | null;
  email: string | null;
  opensAt: string | null;
  closesAt: string | null;
  isOpenNow: boolean;
  coverPhotoUrl: string | null;
  listingStatus: ListingStatus;
  businessStatus: BusinessStatus;
  statusNote: string | null;
  verifiedByUserId: string | null;
  verifiedAt: string | null;
  latitude?: string | null;
  longitude?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface Announcement {
  id: string;
  city: string;
  title: string;
  content: string;
  publishedByUserId: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportPayload {
  establishmentId: string;
  reason: string;
  details?: string;
}

export interface ReviewItem {
  id: string;
  establishmentId: string;
  reviewerName: string | null;
  reviewerAlias: string | null;
  displayName: string;
  isAnonymous: boolean;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsSummary {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewsResponse extends PaginatedResponse<ReviewItem> {
  summary: ReviewsSummary;
}

export interface CreateReviewPayload {
  establishmentId: string;
  rating: number;
  comment: string;
  reviewerName?: string;
  isAnonymous?: boolean;
  reviewerAlias?: string;
}

export interface GuestMessageItem {
  id: string;
  establishmentId: string;
  senderRole: 'tourist' | 'establishment';
  userId: string | null;
  guestFullName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  message: string;
  createdAt: string;
}

export interface SendGuestMessagePayload {
  establishmentId: string;
  fullName: string;
  email?: string;
  phone?: string;
  message: string;
  clientRequestId?: string;
}

export interface SendGuestMessageResponse {
  message: GuestMessageItem;
  conversationToken: string;
}

export interface GuestThreadResponse extends PaginatedResponse<GuestMessageItem> {
  conversation: {
    establishmentId: string;
    guestEmail: string | null;
    guestPhone: string | null;
  };
}

export interface GuestIdentity {
  fullName: string;
  email?: string;
  phone?: string;
}

export interface ReviewSummaryMap {
  [establishmentId: string]: ReviewsSummary;
}
