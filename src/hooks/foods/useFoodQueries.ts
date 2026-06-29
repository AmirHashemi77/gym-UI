import { useQuery } from '@tanstack/react-query';
import { foodsService } from '../../api/foods.service';
import { queryKeys } from '../queryKeys';

export const useFoodCategories = () =>
  useQuery({
    queryKey: queryKeys.foods.categories,
    queryFn: foodsService.getCategories,
  });

export const useFoodsByCategory = (categoryId: string) =>
  useQuery({
    queryKey: queryKeys.foods.byCategory(categoryId),
    queryFn: () => foodsService.getFoodsByCategory(categoryId),
    enabled: !!categoryId,
  });

export const useFood = (id: string) =>
  useQuery({
    queryKey: queryKeys.foods.detail(id),
    queryFn: () => foodsService.getFood(id),
    enabled: !!id,
  });

