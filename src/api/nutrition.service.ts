import { http, unwrapResponse } from './http';
import type { ApiResponse, CreateNutritionPlanRequest, NutritionMeal, NutritionPlan, UpdateMealReminderRequest } from './types';

export const nutritionService = {
  createPlan: async (data: CreateNutritionPlanRequest): Promise<ApiResponse<NutritionPlan>> => {
    const response = await http.post<ApiResponse<NutritionPlan>>('/nutrition/plans', data);
    return unwrapResponse(response);
  },

  getStudentPlan: async (studentId: string): Promise<ApiResponse<NutritionPlan | null>> => {
    const response = await http.get<ApiResponse<NutritionPlan | null>>(`/nutrition/plans/student/${studentId}`);
    return unwrapResponse(response);
  },

  getMyPlan: async (): Promise<ApiResponse<NutritionPlan | null>> => {
    const response = await http.get<ApiResponse<NutritionPlan | null>>('/nutrition/plans/my');
    return unwrapResponse(response);
  },

  updateMealReminder: async (
    planId: string,
    mealId: string,
    data: UpdateMealReminderRequest,
  ): Promise<ApiResponse<NutritionMeal>> => {
    const response = await http.patch<ApiResponse<NutritionMeal>>(
      `/nutrition/plans/${planId}/meals/${mealId}/reminder`,
      data,
    );
    return unwrapResponse(response);
  },
};
