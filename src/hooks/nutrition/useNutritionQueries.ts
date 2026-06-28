import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nutritionService } from '../../api/nutrition.service';
import type { CreateNutritionPlanRequest, UpdateMealReminderRequest } from '../../api/types';
import { queryKeys } from '../queryKeys';

export const useMyNutritionPlan = () =>
  useQuery({
    queryKey: queryKeys.nutrition.myPlan,
    queryFn: nutritionService.getMyPlan,
  });

export const useStudentNutritionPlan = (studentId: string) =>
  useQuery({
    queryKey: queryKeys.nutrition.studentPlan(studentId),
    queryFn: () => nutritionService.getStudentPlan(studentId),
    enabled: Boolean(studentId),
  });

export const useCreateNutritionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNutritionPlanRequest) => nutritionService.createPlan(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.studentPlan(variables.studentId) });
    },
  });
};

export const useUpdateMealReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, mealId, data }: { planId: string; mealId: string; data: UpdateMealReminderRequest }) =>
      nutritionService.updateMealReminder(planId, mealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.myPlan });
    },
  });
};
