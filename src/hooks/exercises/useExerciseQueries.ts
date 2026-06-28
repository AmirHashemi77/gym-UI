import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { exercisesService } from '../../api/exercises.service';
import type { CreateExerciseRequest, PaginationQuery, UpdateExerciseRequest } from '../../api/types';
import { queryKeys } from '../queryKeys';

export const useExercises = (query?: PaginationQuery) =>
  useQuery({
    queryKey: queryKeys.exercises.list(query),
    queryFn: () => exercisesService.getExercises(query),
  });

export const useInfiniteExercises = (query?: Omit<PaginationQuery, 'page'>) =>
  useInfiniteQuery({
    queryKey: queryKeys.exercises.infinite(query),
    queryFn: ({ pageParam }) => exercisesService.getExercises({ ...query, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });

export const useExercise = (id = '') =>
  useQuery({
    queryKey: queryKeys.exercises.detail(id),
    queryFn: () => exercisesService.getExercise(id),
    enabled: Boolean(id),
  });

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExerciseRequest) => exercisesService.createExercise(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExerciseRequest }) =>
      exercisesService.updateExercise(id, payload),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.exercises.detail(variables.id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => exercisesService.deleteExercise(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.exercises.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.exercises.all });
    },
  });
};

export const useBookmarkExercise = () =>
  useMutation({
    mutationFn: (id: string) => exercisesService.bookmarkExercise(id),
  });

export const useUnbookmarkExercise = () =>
  useMutation({
    mutationFn: (id: string) => exercisesService.removeExerciseBookmark(id),
  });

export const usePopularExercises = (limit = 4) =>
  useQuery({
    queryKey: queryKeys.exercises.popular(limit),
    queryFn: () => exercisesService.getPopular(limit),
  });
