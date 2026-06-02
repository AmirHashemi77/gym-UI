import { http, unwrapResponse } from './http';
import type { ApiResponse, SendNotificationRequest, SendNotificationResponse } from './types';

export const notificationsService = {
  send: async (payload: SendNotificationRequest): Promise<ApiResponse<SendNotificationResponse>> => {
    const response = await http.post<ApiResponse<SendNotificationResponse>>('/notifications/send', payload);
    return unwrapResponse(response);
  },
};
