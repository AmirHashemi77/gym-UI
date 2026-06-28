import { http, unwrapResponse } from './http';
import type { ApiResponse, PushSubscriptionBody, SendNotificationRequest, SendNotificationResponse } from './types';

export const notificationsService = {
  send: async (payload: SendNotificationRequest): Promise<ApiResponse<SendNotificationResponse>> => {
    const response = await http.post<ApiResponse<SendNotificationResponse>>('/notifications/send', payload);
    return unwrapResponse(response);
  },

  subscribePush: async (payload: PushSubscriptionBody): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await http.post<ApiResponse<{ success: boolean }>>('/notifications/push-subscribe', payload);
    return unwrapResponse(response);
  },

  unsubscribePush: async (endpoint: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await http.delete<ApiResponse<{ success: boolean }>>('/notifications/push-subscribe', {
      data: { endpoint },
    });
    return unwrapResponse(response);
  },
};
