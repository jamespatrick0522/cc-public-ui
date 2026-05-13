import { http } from './http';
import type { StartGuestCallPayload, VoiceCallResponse } from '@/types/api';

export async function startGuestCall(payload: StartGuestCallPayload): Promise<VoiceCallResponse> {
  const { data } = await http.post<VoiceCallResponse>('/calls/guest/start', payload);
  return data;
}

export async function getGuestCall(callId: string): Promise<VoiceCallResponse> {
  const { data } = await http.get<VoiceCallResponse>(`/calls/guest/${callId}`);
  return data;
}

export async function endGuestCall(callId: string): Promise<VoiceCallResponse> {
  const { data } = await http.post<VoiceCallResponse>(`/calls/guest/${callId}/end`, {});
  return data;
}
