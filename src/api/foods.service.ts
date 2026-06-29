import { http, unwrapResponse } from './http';
import type { ApiResponse, Food, FoodCategory } from './types';

export const foodsService = {
  getCategories: async (): Promise<ApiResponse<FoodCategory[]>> => {
    const response = await http.get<ApiResponse<FoodCategory[]>>('/foods/categories');
    return unwrapResponse(response);
  },

  getFoodsByCategory: async (categoryId: string): Promise<ApiResponse<Food[]>> => {
    const response = await http.get<ApiResponse<Food[]>>('/foods', {
      params: { category: categoryId },
    });
    return unwrapResponse(response);
  },

  getFood: async (id: string): Promise<ApiResponse<Food | null>> => {
    const response = await http.get<ApiResponse<Food | null>>(`/foods/${id}`);
    return unwrapResponse(response);
  },

};
