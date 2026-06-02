import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionsService } from '../../api/questions.service';
import type { AnswerQuestionRequest, CreateQuestionRequest, PaginationQuery } from '../../api/types';
import { queryKeys } from '../queryKeys';

export const useQuestions = (query?: PaginationQuery) =>
  useQuery({
    queryKey: queryKeys.questions.list(query),
    queryFn: () => questionsService.getQuestions(query),
  });

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuestionRequest) => questionsService.createQuestion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
};

export const useAnswerQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AnswerQuestionRequest }) =>
      questionsService.answerQuestion(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
};
