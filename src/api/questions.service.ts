import { http, unwrapResponse } from './http';
import type {
  AnswerQuestionRequest,
  ApiResponse,
  CreateQuestionRequest,
  PaginatedResponse,
  PaginationQuery,
  Question,
} from './types';

export const questionsService = {
  createQuestion: async (payload: CreateQuestionRequest): Promise<ApiResponse<Question>> => {
    const response = await http.post<ApiResponse<Question>>('/questions', payload);
    return unwrapResponse(response);
  },

  getQuestions: async (query?: PaginationQuery): Promise<ApiResponse<PaginatedResponse<Question>>> => {
    const response = await http.get<ApiResponse<PaginatedResponse<Question>>>('/questions', { params: query });
    return unwrapResponse(response);
  },

  answerQuestion: async (id: string, payload: AnswerQuestionRequest): Promise<ApiResponse<Question>> => {
    const response = await http.patch<ApiResponse<Question>>(`/questions/${id}/answer`, payload);
    return unwrapResponse(response);
  },
};
