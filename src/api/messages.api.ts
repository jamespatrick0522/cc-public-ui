import { http } from './http';
import type { GuestThreadResponse, SendGuestMessagePayload, SendGuestMessageResponse } from '@/types/api';

export interface GetGuestThreadParams {
  conversationToken: string;
  page?: number;
  pageSize?: number;
}

export async function sendGuestMessage(
  payload: SendGuestMessagePayload,
): Promise<SendGuestMessageResponse> {
  const { data } = await http.post<SendGuestMessageResponse>('/messages/guest', payload);
  return data;
}

export async function getGuestThread(
  params: GetGuestThreadParams,
): Promise<GuestThreadResponse> {
  const { data } = await http.get<GuestThreadResponse>('/messages/guest-thread', {
    params,
  });

  return data;
}
