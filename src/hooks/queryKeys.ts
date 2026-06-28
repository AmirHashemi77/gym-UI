import type { PaginationQuery, ProgramsQuery } from '../api/types';

export const queryKeys = {
  coach: {
    dashboard: ['coach', 'dashboard'] as const,
  },
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  students: {
    all: ['students'] as const,
    list: (query?: PaginationQuery) => ['students', 'list', query ?? {}] as const,
    infinite: (query?: PaginationQuery) => ['students', 'infinite', query ?? {}] as const,
    detail: (id: string) => ['students', 'detail', id] as const,
  },
  exercises: {
    all: ['exercises'] as const,
    list: (query?: PaginationQuery) => ['exercises', 'list', query ?? {}] as const,
    infinite: (query?: PaginationQuery) => ['exercises', 'infinite', query ?? {}] as const,
    detail: (id: string) => ['exercises', 'detail', id] as const,
    popular: (limit: number) => ['exercises', 'popular', limit] as const,
  },
  programs: {
    all: ['programs'] as const,
    list: (query?: ProgramsQuery) => ['programs', 'list', query ?? {}] as const,
    detail: (id: string) => ['programs', 'detail', id] as const,
    activeStats: ['programs', 'active-stats'] as const,
    expiredStudents: ['programs', 'expired-students'] as const,
  },
  questions: {
    all: ['questions'] as const,
    list: (query?: PaginationQuery) => ['questions', 'list', query ?? {}] as const,
  },
  nutrition: {
    all: ['nutrition'] as const,
    myPlan: ['nutrition', 'my-plan'] as const,
    studentPlan: (studentId: string) => ['nutrition', 'student-plan', studentId] as const,
  },
};
