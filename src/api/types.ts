export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors: string[];
};

export type Role = 'ADMIN' | 'COACH' | 'STUDENT';

export type ExerciseBlockType = 'NORMAL' | 'SUPERSET' | 'TRISET';

export type QuestionStatus = 'PENDING' | 'ANSWERED';

export type PaginationQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type User = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: Role;
  avatar: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type DecimalLike = {
  s: number;
  e: number;
  d: number[];
};

export type DecimalValue = string | number | DecimalLike;

export type Gender = 'MALE' | 'FEMALE';

export type StudentProfile = {
  id: string;
  userId: string;
  coachId: string | null;
  age: number | null;
  weight: DecimalValue | null;
  height: DecimalValue | null;
  goal: string | null;
  gender: Gender | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type Student = User & {
  studentProfile: StudentProfile | null;
};

export type LoginRequest = {
  phone: string;
  password: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: Role;
  avatar: string | null;
  gender: Gender | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type CreateStudentRequest = {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  avatar?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  gender?: Gender;
};

export type UpdateStudentRequest = Partial<Omit<CreateStudentRequest, 'password'>>;

export type Exercise = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  creator?: {
    id: string;
    fullName: string;
  };
};

export type CreateExerciseRequest = {
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
};

export type UpdateExerciseRequest = Partial<CreateExerciseRequest>;

export type ExerciseBookmark = {
  id: string;
  studentId: string;
  exerciseId: string;
  createdAt: string;
};

export type ExerciseBlockItem = {
  id: string;
  blockId: string;
  exerciseId: string;
  sets: number;
  reps: string;
  rest: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  exercise: Exercise;
};

export type ExerciseBlock = {
  id: string;
  dayId: string;
  type: ExerciseBlockType;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: ExerciseBlockItem[];
};

export type ProgramDay = {
  id: string;
  programId: string;
  dayNumber: number;
  createdAt: string;
  updatedAt: string;
  blocks: ExerciseBlock[];
};

export type Program = {
  id: string;
  title: string;
  studentId: string;
  coachId: string;
  durationDays: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  student?: {
    id: string;
    fullName: string;
    phone: string;
  };
  coach?: {
    id: string;
    fullName: string;
  };
  days: ProgramDay[];
};

export type ActiveProgramStats = {
  programId: string;
  programTitle: string;
  totalDays: number;
  completedDays: number;
  remainingDays: number;
};

export type CreateExerciseBlockItemRequest = {
  exerciseId: string;
  sets: number;
  reps: string;
  rest?: string;
  order: number;
};

export type CreateExerciseBlockRequest = {
  type: ExerciseBlockType;
  note?: string;
  items: CreateExerciseBlockItemRequest[];
};

export type CreateProgramDayRequest = {
  dayNumber: number;
  blocks: CreateExerciseBlockRequest[];
};

export type CreateProgramRequest = {
  title: string;
  studentId: string;
  durationDays?: number;
  days: CreateProgramDayRequest[];
};

export type UpdateProgramRequest = Partial<CreateProgramRequest>;

export type ProgramsQuery = PaginationQuery & {
  studentId?: string;
};

export type Question = {
  id: string;
  studentId: string;
  exerciseId: string | null;
  question: string;
  answer: string | null;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  exercise?: Exercise | null;
  student?: {
    id: string;
    fullName: string;
    phone?: string;
  };
};

export type CreateQuestionRequest = {
  exerciseId?: string;
  question: string;
};

export type AnswerQuestionRequest = {
  answer: string;
};

export type UploadVideoResponse = {
  url: string;
  thumbnailUrl: string | null;
  key: string;
  mimeType: string;
  size: number;
};

export type SendNotificationRequest = {
  userId?: string;
  title: string;
  body: string;
};

export type SendNotificationResponse = {
  channelStatus: {
    push: 'READY';
    sms: 'READY';
    email: 'READY';
  };
  payload: SendNotificationRequest;
};
