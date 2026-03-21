import { http } from './http';
import type { Establishment, PaginatedResponse } from '@/types/api';

export interface SearchEstablishmentsParams {
  city?: string;
  category?: string;
  search?: string;
  openNow?: boolean;
  page?: number;
  pageSize?: number;
}

export async function searchEstablishments(
  params: SearchEstablishmentsParams = {},
): Promise<PaginatedResponse<Establishment>> {
  const { data } = await http.get<PaginatedResponse<Establishment>>('/establishments', {
    params,
  });

  return data;
}

export async function getEstablishmentById(establishmentId: string): Promise<Establishment> {
  const { data } = await http.get<Establishment>(`/establishments/${establishmentId}`);
  return data;
}
