import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../api/users.service';
import type { CreateStudentRequest, PaginationQuery, UpdateStudentRequest } from '../../api/types';
import { queryKeys } from '../queryKeys';

export const useStudents = (query?: PaginationQuery) =>
  useQuery({
    queryKey: queryKeys.students.list(query),
    queryFn: () => usersService.getStudents(query),
  });

export const useInfiniteStudents = (query?: Omit<PaginationQuery, 'page'>) =>
  useInfiniteQuery({
    queryKey: queryKeys.students.infinite(query),
    queryFn: ({ pageParam }) => usersService.getStudents({ ...query, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.meta;
      return page < totalPages ? page + 1 : undefined;
    },
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
