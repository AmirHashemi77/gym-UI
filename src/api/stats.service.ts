import { http, unwrapResponse } from './http';
import type { ApiResponse, CoachDashboardStats } from './types';

export const statsService = {
  getCoachDashboard: async (): Promise<ApiResponse<CoachDashboardStats>> => {
    const response = await http.get<ApiResponse<CoachDashboardStats>>('/coach/dashboard');
    return unwrapResponse(response);
  },
};
