import { http, unwrapResponse } from './http';
import type {
  ApiResponse,
  CreateExerciseRequest,
  Exercise,
  ExerciseBookmark,
  MuscleGroupStat,
  PaginatedResponse,
  PaginationQuery,
  UpdateExerciseRequest,
} from './types';

export const exercisesService = {
  createExercise: async (payload: CreateExerciseRequest): Promise<ApiResponse<Exercise>> => {
    const response = await http.post<ApiResponse<Exercise>>('/exercises', payload);
    return unwrapResponse(response);
  },

  getExercises: async (query?: PaginationQuery): Promise<ApiResponse<PaginatedResponse<Exercise>>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Exercise>>>('/exercises', { params: query });
    return unwrapResponse(response);
  },

  getExercise: async (id: string): Promise<ApiResponse<Exercise>> => {
    const response = await http.get<ApiResponse<Exercise>>(`/exercises/${id}`);
    return unwrapResponse(response);
  },

  updateExercise: async (id: string, payload: UpdateExerciseRequest): Promise<ApiResponse<Exercise>> => {
    const response = await http.patch<ApiResponse<Exercise>>(`/exercises/${id}`, payload);
    return unwrapResponse(response);
  },

  deleteExercise: async (id: string): Promise<ApiResponse<null>> => {
    const response = await http.delete<ApiResponse<null>>(`/exercises/${id}`);
    return unwrapResponse(response);
  },

  bookmarkExercise: async (id: string): Promise<ApiResponse<ExerciseBookmark>> => {
    const response = await http.post<ApiResponse<ExerciseBookmark>>(`/exercises/${id}/bookmark`);
    return unwrapResponse(response);
  },

  removeExerciseBookmark: async (id: string): Promise<ApiResponse<null>> => {
    const response = await http.delete<ApiResponse<null>>(`/exercises/${id}/bookmark`);
    return unwrapResponse(response);
  },

  getPopular: async (limit = 4): Promise<ApiResponse<Exercise[]>> => {
    const response = await http.get<ApiResponse<Exercise[]>>('/exercises/popular', { params: { limit } });
    return unwrapResponse(response);
  },

  getMuscleGroups: async (): Promise<ApiResponse<MuscleGroupStat[]>> => {
    const response = await http.get<ApiResponse<MuscleGroupStat[]>>('/exercises/muscle-groups');
    return unwrapResponse(response);
  },
};
