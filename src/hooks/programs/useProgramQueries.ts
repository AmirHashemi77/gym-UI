import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { programsService } from '../../api/programs.service';
import type { CreateProgramRequest, ProgramsQuery, UpdateProgramRequest } from '../../api/types';
import { useToastStore } from '../../stores/useToastStore';
import { queryKeys } from '../queryKeys';

export const usePrograms = (query?: ProgramsQuery) =>
  useQuery({
    queryKey: queryKeys.programs.list(query),
    queryFn: () => programsService.getPrograms(query),
  });

export const useProgram = (id = '') =>
  useQuery({
    queryKey: queryKeys.programs.detail(id),
    queryFn: () => programsService.getProgram(id),
    enabled: Boolean(id),
  });

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProgramRequest) => programsService.createProgram(payload),
    onSuccess: (response) => {
      useToastStore.getState().showSuccess(response.message || 'برنامه تمرینی با موفقیت ثبت شد.');
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProgramRequest }) =>
      programsService.updateProgram(id, payload),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.programs.detail(variables.id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => programsService.deleteProgram(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.programs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
    },
  });
};

export const useActiveProgramStats = () =>
  useQuery({
    queryKey: queryKeys.programs.activeStats,
    queryFn: () => programsService.getActiveStats(),
  });

export const useExpiredProgramStudents = () =>
  useQuery({
    queryKey: queryKeys.programs.expiredStudents,
    queryFn: () => programsService.getExpiredProgramStudents(),
  });
