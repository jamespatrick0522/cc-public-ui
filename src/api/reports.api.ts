import { http } from './http';
import type { ReportPayload } from '@/types/api';

export async function createReport(payload: ReportPayload) {
  const { data } = await http.post('/reports', payload);
  return data;
}
