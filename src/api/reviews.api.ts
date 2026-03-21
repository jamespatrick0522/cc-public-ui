import { http } from './http';
import type { CreateReviewPayload, ReviewsResponse } from '@/types/api';

export interface GetReviewsParams {
  establishmentId: string;
  sort?: 'recent' | 'highest' | 'lowest';
  page?: number;
  pageSize?: number;
}

export async function getReviews(params: GetReviewsParams): Promise<ReviewsResponse> {
  const { data } = await http.get<ReviewsResponse>('/reviews', {
    params: {
      establishmentId: params.establishmentId,
      sort: params.sort ?? 'recent',
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
    },
  });

  return data;
}

export async function createReview(payload: CreateReviewPayload) {
  const { data } = await http.post('/reviews', payload);
  return data;
}
