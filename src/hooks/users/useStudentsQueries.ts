import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../api/users.service';
import type { CreateStudentRequest, PaginationQuery, UpdateStudentRequest } from '../../api/types';
import { queryKeys } from '../queryKeys';

export const useStudents = (query?: PaginationQuery) =>
  useQuery({
    queryKey: queryKeys.students.list(query),
    queryFn: () => usersService.getStudents(query),
  });

export const useStudent = (id = '') =>
  useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => usersService.getStudent(id),
    enabled: Boolean(id),
  });

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStudentRequest) => usersService.createStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudentRequest }) =>
      usersService.updateStudent(id, payload),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(queryKeys.students.detail(variables.id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.deleteStudent(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.students.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });
};
