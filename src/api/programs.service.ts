import { getAccessTokenPayload, http, unwrapResponse } from './http';
import type {
  ActiveProgramStats,
  ApiResponse,
  CreateProgramRequest,
  ExpiredProgramStudent,
  PaginatedResponse,
  Program,
  ProgramsQuery,
  UpdateProgramRequest,
} from './types';

type ProgramsParams = Record<string, string | number>;

const hasValidQueryValue = (value: unknown): value is string | number => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return Number.isFinite(value);

  return false;
};

const setParam = (params: ProgramsParams, key: string, value: unknown) => {
  if (!hasValidQueryValue(value)) return;

  params[key] = typeof value === 'string' ? value.trim() : value;
};

const buildProgramsParams = (query?: ProgramsQuery): ProgramsParams | undefined => {
  const params: ProgramsParams = {};
  const role = getAccessTokenPayload()?.role;

  setParam(params, 'page', query?.page);
  setParam(params, 'limit', query?.limit);
  setParam(params, 'search', query?.search);
  setParam(params, 'sortBy', query?.sortBy);
  setParam(params, 'sortOrder', query?.sortOrder);

  if (role === 'COACH' || role === 'ADMIN') {
    setParam(params, 'studentId', query?.studentId);
  }

  return Object.keys(params).length > 0 ? params : undefined;
};

export const programsService = {
  createProgram: async (payload: CreateProgramRequest): Promise<ApiResponse<Program>> => {
    const response = await http.post<ApiResponse<Program>>('/programs', payload);
    return unwrapResponse(response);
  },

  getPrograms: async (query?: ProgramsQuery): Promise<ApiResponse<PaginatedResponse<Program>>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Program>>>('/programs', {
      params: buildProgramsParams(query),
    });
    return unwrapResponse(response);
  },

  getProgram: async (id: string): Promise<ApiResponse<Program>> => {
    const response = await http.get<ApiResponse<Program>>(`/programs/${id}`);
    return unwrapResponse(response);
  },

  updateProgram: async (id: string, payload: UpdateProgramRequest): Promise<ApiResponse<Program>> => {
    const response = await http.patch<ApiResponse<Program>>(`/programs/${id}`, payload);
    return unwrapResponse(response);
  },

  deleteProgram: async (id: string): Promise<ApiResponse<null>> => {
    const response = await http.delete<ApiResponse<null>>(`/programs/${id}`);
    return unwrapResponse(response);
  },

  getActiveStats: async (): Promise<ApiResponse<ActiveProgramStats | null>> => {
    const response = await http.get<ApiResponse<ActiveProgramStats | null>>('/programs/active/stats');
    return unwrapResponse(response);
  },

  getExpiredProgramStudents: async (): Promise<ApiResponse<ExpiredProgramStudent[]>> => {
    const response = await http.get<ApiResponse<ExpiredProgramStudent[]>>('/programs/students/expired');
    return unwrapResponse(response);
  },
};
