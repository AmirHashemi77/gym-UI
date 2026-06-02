import { http, unwrapResponse } from './http';
import type {
  ApiResponse,
  CreateStudentRequest,
  PaginatedResponse,
  PaginationQuery,
  Student,
  UpdateStudentRequest,
} from './types';

export const usersService = {
  createStudent: async (payload: CreateStudentRequest): Promise<ApiResponse<Student>> => {
    const response = await http.post<ApiResponse<Student>>('/users/students', payload);
    return unwrapResponse(response);
  },

  getStudents: async (query?: PaginationQuery): Promise<ApiResponse<PaginatedResponse<Student>>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Student>>>('/users/students', { params: query });
    return unwrapResponse(response);
  },

  getStudent: async (id: string): Promise<ApiResponse<Student>> => {
    const response = await http.get<ApiResponse<Student>>(`/users/students/${id}`);
    return unwrapResponse(response);
  },

  updateStudent: async (id: string, payload: UpdateStudentRequest): Promise<ApiResponse<Student>> => {
    const response = await http.patch<ApiResponse<Student>>(`/users/students/${id}`, payload);
    return unwrapResponse(response);
  },

  deleteStudent: async (id: string): Promise<ApiResponse<null>> => {
    const response = await http.delete<ApiResponse<null>>(`/users/students/${id}`);
    return unwrapResponse(response);
  },
};
