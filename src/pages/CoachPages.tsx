import { Bell, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, Edit, MessageSquare, NotebookText, Plus, Send, Trash2, UserPlus, Users, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getApiErrorMessage } from '../api/http';
import type {
  CreateExerciseRequest,
  CreateNutritionMealRequest,
  CreateProgramDayRequest,
  CreateStudentRequest,
  DecimalLike,
  Exercise,
  ExerciseBlockType,
  Gender,
  MealType,
  MuscleGroup,
  Student,
  UpdateStudentRequest,
} from '../api/types';
import { ExercisePicker } from '../components/ExercisePicker';
import { Button, Card, EmptyState, Input, Modal, PasswordInput, ScrollLoader, SearchBox, Select, Textarea } from '../components/ui';
import { useAuth } from '../features/auth';
import { useCreateExercise, useDeleteExercise, useInfiniteExercises, useUpdateExercise } from '../hooks/exercises';
import { useScrollSentinel } from '../hooks/useScrollSentinel';
import { useSendNotification } from '../hooks/notifications';
import { useCreateProgram, useExpiredProgramStudents, useProgram, usePrograms } from '../hooks/programs';
import { useCoachDashboard } from '../hooks/stats';
import { useAnswerQuestion, useQuestions } from '../hooks/questions';
import { useUploadImage, useUploadVideo } from '../hooks/upload';
import { useCreateNutritionPlan, useStudentNutritionPlan } from '../hooks/nutrition';
import { useCreateStudent, useDeleteStudent, useInfiniteStudents, useStudent, useStudents, useUpdateStudent } from '../hooks/users';
import { formatPersianDate } from '../utils/date';
import { truncateText } from '../utils/text';

const muscleGroupLabels: Record<MuscleGroup, string> = {
  CHEST: 'سینه',
  BACK: 'پشت',
  SHOULDERS: 'شانه',
  BICEPS: 'دو سر',
  TRICEPS: 'سه سر',
  FOREARMS: 'ساعد',
  CORE: 'شکم و هسته',
  GLUTES: 'سرینی',
  QUADRICEPS: 'چهار سر ران',
  HAMSTRINGS: 'همسترینگ',
  CALVES: 'ساق پا',
  FULL_BODY: 'تمام بدن',
  CARDIO: 'کاردیو',
};

const blockLabels: Record<ExerciseBlockType, string> = {
  NORMAL: 'معمولی',
  SUPERSET: 'سوپرست',
  TRISET: 'تری ست',
};

type DraftProgramExerciseItem = {
  exerciseId: string;
  sets: string;
  reps: string;
  rest: string;
};

type DraftProgramBlock = {
  id: string;
  type: ExerciseBlockType;
  note: string;
  items: DraftProgramExerciseItem[];
};

type DraftProgramDay = {
  id: string;
  dayNumber: number;
  blocks: DraftProgramBlock[];
};

const todayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function useCountUp(target: number, enabled: boolean, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    setValue(0);
    if (target === 0) { setValue(0); return; }
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      setValue(Math.round((1 - (1 - p) ** 3) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, duration]);

  return value;
}

export function CoachHomePage() {
  const { user } = useAuth();
  const [creatingStudent, setCreatingStudent] = useState(false);
  const { data, isLoading } = useCoachDashboard();
  const stats = data?.data;
  const today = todayFormatter.format(new Date());

  const statCards = [
    {
      label: 'کل شاگردان',
      value: stats?.totalStudents ?? 0,
      icon: Users,
      colorClass: 'bg-brand-red/10 text-brand-red-strong dark:bg-brand-red/20 dark:text-brand-red-text',
    },
    {
      label: 'شاگرد جدید این ماه',
      value: stats?.newStudentsThisMonth ?? 0,
      icon: UserPlus,
      colorClass: 'bg-status-success/15 text-green-800 dark:bg-status-success/20 dark:text-green-300',
    },
    {
      label: 'برنامه این ماه',
      value: stats?.programsThisMonth ?? 0,
      icon: NotebookText,
      colorClass: 'bg-status-info/15 text-blue-800 dark:bg-status-info/20 dark:text-blue-300',
    },
    {
      label: 'سوال بی‌پاسخ',
      value: stats?.unansweredQuestions ?? 0,
      icon: MessageSquare,
      colorClass: 'bg-status-error/15 text-red-800 dark:bg-status-error/20 dark:text-red-300',
    },
  ] as const;

  return (
    <section className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-br from-brand-charcoal to-brand-carbon p-5 text-brand-text-main shadow-card"
      >
        <div className="pointer-events-none absolute -left-8 -top-8 h-36 w-36 rounded-full bg-brand-red/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-6 h-44 w-44 rounded-full bg-brand-metallic/20 blur-3xl" />
        <div className="relative">
          <p className="text-sm text-white/50">{today}</p>
          <h1 className="mt-1 text-2xl font-black">
            سلام،{' '}
            <span className="text-brand-red-text">{user?.fullName}</span>!
          </h1>
          <p className="mt-1 text-sm text-white/55">به پنل مربی خوش آمدید.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <DashStatCard key={card.label} {...card} index={i} loading={isLoading} />
        ))}
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-brand-text-muted">دسترسی سریع</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickActionLink to="/coach/athletes" icon={Users} label="ورزشکاران" />
          <QuickActionButton icon={UserPlus} label="ورزشکار جدید" onClick={() => setCreatingStudent(true)} />
          <QuickActionLink to="/coach/questions" icon={MessageSquare} label="سوالات" />
          <QuickActionLink to="/coach/notifications" icon={Bell} label="ارسال اعلان" />
        </div>
      </div>

      {creatingStudent ? <StudentForm onClose={() => setCreatingStudent(false)} /> : null}
    </section>
  );
}

function DashStatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  index,
  loading,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  index: number;
  loading: boolean;
}) {
  const count = useCountUp(value, !loading);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="space-y-3">
        <span className={`inline-flex rounded-xl p-2.5 ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        {loading ? (
          <div className="h-9 w-14 animate-pulse rounded-lg bg-slate-200 dark:bg-brand-carbon" />
        ) : (
          <p className="text-3xl font-black tabular-nums">{count.toLocaleString('fa-IR')}</p>
        )}
        <p className="text-sm text-slate-500 dark:text-brand-text-muted">{label}</p>
      </Card>
    </motion.div>
  );
}

function QuickActionLink({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 p-4 text-center transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 dark:border-brand-border dark:bg-brand-surface-2 dark:hover:bg-brand-carbon">
      <Icon className="h-6 w-6 text-slate-600 dark:text-brand-text-soft" />
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 p-4 text-center transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 dark:border-brand-border dark:bg-brand-surface-2 dark:hover:bg-brand-carbon"
    >
      <Icon className="h-6 w-6 text-slate-600 dark:text-brand-text-soft" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

export function AthletesPage() {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteStudents({ search });
  const { data: expiredResponse, isLoading: expiredLoading } = useExpiredProgramStudents();
  const students = data?.pages.flatMap((p) => p.data.items) ?? [];
  const expiredStudents = expiredResponse?.data ?? [];
  const sentinelRef = useScrollSentinel(fetchNextPage, hasNextPage && !isFetchingNextPage);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">لیست ورزشکاران</h1>
          <p className="text-sm text-slate-500 dark:text-brand-text-muted">برای دیدن جزئیات و ساخت برنامه وارد پروفایل شوید.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-5 w-5" />
          ورزشکار جدید
        </Button>
      </div>

      <div className="rounded-2xl border border-status-warning/30 bg-status-warning/10 p-4 dark:border-status-warning/40 dark:bg-status-warning/10">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-status-warning dark:text-orange-300" />
          <h2 className="font-bold text-orange-900 dark:text-orange-300">برنامه منقضی‌شده</h2>
          {!expiredLoading && expiredStudents.length > 0 ? (
            <span className="mr-auto rounded-full bg-status-warning/20 px-2.5 py-0.5 text-xs font-bold text-orange-900 dark:bg-status-warning/25 dark:text-orange-300">
              {expiredStudents.length} نفر
            </span>
          ) : null}
        </div>
        {expiredLoading ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">در حال دریافت...</p>
        ) : expiredStudents.length === 0 ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">همه ورزشکاران برنامه فعال دارند.</p>
        ) : (
          <div className="space-y-2">
            {expiredStudents.map((item) => (
              <Link key={item.studentId} to={`/coach/athletes/${item.studentId}`}>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white p-3 transition hover:bg-amber-50 dark:bg-brand-surface-2 dark:hover:bg-brand-carbon">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-brand-text-main">{item.studentName}</p>
                    <p className="truncate text-sm text-slate-500 dark:text-brand-text-muted">{item.lastProgramTitle}</p>
                  </div>
                  <div className="shrink-0 text-left">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">منقضی شده</p>
                    <p className="text-xs text-slate-400 dark:text-brand-text-muted">{formatPersianDate(item.expiredAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <SearchBox placeholder="جستجو در ورزشکاران" value={search} onChange={(event) => setSearch(event.target.value)} />
      {isLoading ? <EmptyState title="در حال دریافت ورزشکاران..." /> : null}
      {isError ? <EmptyState title={getApiErrorMessage(error)} /> : null}
      {!isLoading && students.length === 0 ? <EmptyState title="ورزشکاری پیدا نشد" /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {students.map((student) => (
          <Link key={student.id} to={`/coach/athletes/${student.id}`}>
            <Card className="h-full space-y-2">
              <h2 className="font-bold">{student.fullName}</h2>
              <p className="text-sm text-slate-500 dark:text-brand-text-muted">{student.phone}</p>
              {student.studentProfile?.goal ? (
                <span className="inline-flex rounded-full bg-brand-red/15 px-3 py-1 text-xs font-bold text-brand-red-strong dark:text-brand-red-text">
                  {student.studentProfile.goal}
                </span>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} />
      {isFetchingNextPage ? <ScrollLoader /> : null}
      {creating ? <StudentForm onClose={() => setCreating(false)} /> : null}
    </section>
  );
}

export function AthleteDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const selectedStudentId = id.trim();

  const { data: response, isLoading, isError, error } = useStudent(id);
  const { data: programsResponse } = usePrograms(selectedStudentId ? { studentId: selectedStudentId } : undefined);
  const { data: nutritionRes } = useStudentNutritionPlan(selectedStudentId);
  const { data: programDetailRes, isLoading: programDetailLoading } = useProgram(selectedProgramId ?? '');

  const deleteStudent = useDeleteStudent();
  const student = response?.data;
  const programs = programsResponse?.data.items ?? [];
  const nutritionPlan = nutritionRes?.data ?? null;
  const programDetail = programDetailRes?.data ?? null;

  const latestProgram = programs.length > 0
    ? [...programs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  const getProgramStatus = (program: NonNullable<typeof latestProgram>) => {
    if (!program.durationDays) return { remaining: null, isExpired: false };
    const expiry = new Date(program.createdAt);
    expiry.setDate(expiry.getDate() + program.durationDays);
    const remaining = Math.ceil((expiry.getTime() - Date.now()) / 86400000);
    return { remaining, isExpired: remaining <= 0, expiryDate: expiry.toISOString() };
  };

  if (isLoading) return <EmptyState title="در حال دریافت ورزشکار..." />;
  if (isError) return <EmptyState title={getApiErrorMessage(error)} />;
  if (!student) return <EmptyState title="ورزشکار پیدا نشد" />;

  return (
    <section className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">{student.fullName}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-brand-text-muted">{student.phone}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/coach/athletes/${student.id}/new-program`}>
              <Button>
                <Plus className="h-5 w-5" />
                برنامه جدید
              </Button>
            </Link>
            <Button variant="secondary" className="h-11 w-11 px-0" onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="danger"
              className="h-11 w-11 px-0"
              disabled={deleteStudent.isPending}
              onClick={() => {
                deleteStudent.mutate(student.id, {
                  onSuccess: () => navigate('/coach/athletes'),
                });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="ایمیل" value={student.email ?? '-'} />
          <Info label="هدف" value={student.studentProfile?.goal ?? '-'} />
          <Info label="سن" value={student.studentProfile?.age ?? '-'} />
          <Info label="قد" value={student.studentProfile?.height ?? '-'} />
          <Info label="وزن" value={student.studentProfile?.weight ?? '-'} />
        </div>
        {deleteStudent.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(deleteStudent.error)}</p> : null}
      </Card>

      {/* Active plan widgets */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Training program widget */}
        {latestProgram ? (() => {
          const status = getProgramStatus(latestProgram);
          return (
            <button
              onClick={() => setSelectedProgramId(latestProgram.id)}
              className="group relative overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-br from-brand-charcoal to-brand-carbon p-4 text-right text-brand-text-main transition-all hover:border-brand-red/50 active:scale-[0.98]"
            >
              <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-brand-red/25 blur-2xl" />
              <div className="relative flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <NotebookText className="h-4 w-4 text-brand-red-text" />
                    <span className="text-xs font-bold text-white/60">برنامه تمرینی</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-white/40 transition group-hover:text-white/70" />
                </div>
                <div>
                  <p className="line-clamp-1 font-bold">{latestProgram.title}</p>
                  <p className="mt-1 text-xs text-white/50">
                    {status.remaining === null
                      ? 'بدون تاریخ انقضا'
                      : status.isExpired
                        ? `منقضی شده — ${formatPersianDate(status.expiryDate!)}`
                        : `${status.remaining} روز مانده`}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    status.isExpired
                      ? 'bg-rose-400/20 text-rose-300'
                      : 'bg-brand-red/20 text-brand-red-text'
                  }`}
                >
                  {status.isExpired ? 'منقضی' : 'فعال'}
                </span>
              </div>
            </button>
          );
        })() : (
          <Link
            to={`/coach/athletes/${id}/new-program`}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center transition hover:border-slate-300 dark:border-brand-border dark:hover:border-white/20"
          >
            <NotebookText className="h-7 w-7 text-slate-300 dark:text-brand-text-muted" />
            <p className="text-sm font-semibold text-slate-500 dark:text-brand-text-muted">برنامه تمرینی ندارد</p>
            <span className="text-xs font-bold text-brand-red-text">+ برنامه جدید</span>
          </Link>
        )}

        {/* Nutrition widget */}
        {nutritionPlan ? (
          <button
            onClick={() => setShowNutritionModal(true)}
            className="group relative overflow-hidden rounded-2xl border border-status-success/35 bg-gradient-to-br from-brand-charcoal to-green-950/70 p-4 text-right text-brand-text-main transition-all hover:border-status-success/60 active:scale-[0.98]"
          >
            <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-emerald-200" />
                  <span className="text-xs font-bold text-white/60">برنامه تغذیه</span>
                </div>
                <ChevronLeft className="h-4 w-4 text-white/40 transition group-hover:text-white/70" />
              </div>
              <div>
                <p className="font-bold">{nutritionPlan.meals.length} وعده غذایی</p>
                <p className="mt-1 text-xs text-white/50">
                  آخرین به‌روزرسانی: {formatPersianDate(nutritionPlan.updatedAt)}
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white">
                فعال
              </span>
            </div>
          </button>
        ) : (
          <Link
            to="/coach/nutrition"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-center transition hover:border-slate-300 dark:border-brand-border dark:hover:border-white/20"
          >
            <UtensilsCrossed className="h-7 w-7 text-slate-300 dark:text-brand-text-muted" />
            <p className="text-sm font-semibold text-slate-500 dark:text-brand-text-muted">برنامه تغذیه ندارد</p>
            <span className="text-xs font-bold text-emerald-500">+ برنامه تغذیه</span>
          </Link>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-bold">برنامه های قبلی</h2>
        {programs.length === 0 ? <EmptyState title="برنامه ای ثبت نشده است" /> : null}
        {programs.map((program) => (
          <Card key={program.id}>
            <h3 className="font-bold">{program.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-brand-text-muted">
              {formatPersianDate(program.createdAt)} - {program.days.length} روز
              {program.durationDays ? ` | اعتبار: ${program.durationDays} روز` : ''}
            </p>
          </Card>
        ))}
      </div>

      {editing ? <StudentForm student={student} onClose={() => setEditing(false)} /> : null}

      {/* Program detail modal */}
      {selectedProgramId ? (
        <Modal title="جزئیات برنامه تمرینی" onClose={() => setSelectedProgramId(null)}>
          {programDetailLoading ? (
            <EmptyState title="در حال دریافت برنامه..." />
          ) : !programDetail ? (
            <EmptyState title="برنامه یافت نشد" />
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black">{programDetail.title}</h3>
                <p className="text-sm text-slate-500 dark:text-brand-text-muted">
                  {formatPersianDate(programDetail.createdAt)}
                  {programDetail.durationDays ? ` · اعتبار ${programDetail.durationDays} روز` : ''}
                </p>
              </div>
              {programDetail.days.map((day) => (
                <div key={day.id} className="rounded-xl border border-slate-200 p-3 dark:border-brand-border">
                  <p className="mb-2 font-bold">روز {day.dayNumber}</p>
                  {day.blocks.map((block) => (
                    <div key={block.id} className="mb-2 rounded-xl bg-slate-50 p-3 dark:bg-brand-surface-2">
                      <p className="mb-2 text-xs font-bold text-brand-red-text">{blockLabels[block.type]}</p>
                      {block.note ? <p className="mb-2 text-xs text-slate-500">{block.note}</p> : null}
                      <div className="space-y-1.5">
                        {block.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 dark:bg-brand-surface-2">
                            <span className="text-sm font-semibold">{item.exercise.title}</span>
                            <span className="text-xs text-slate-500 dark:text-brand-text-muted">
                              {item.sets} ست · {item.reps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Modal>
      ) : null}

      {/* Nutrition detail modal */}
      {showNutritionModal && nutritionPlan ? (
        <Modal title="برنامه تغذیه" onClose={() => setShowNutritionModal(false)}>
          <div className="space-y-3">
            {[...nutritionPlan.meals]
              .sort((a, b) => a.order - b.order)
              .map((meal) => (
                <div key={meal.id} className="rounded-xl border border-slate-200 p-3 dark:border-brand-border">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`rounded-xl px-3 py-1 text-xs font-bold ${nutritionMealColors[meal.type]}`}>
                      {meal.label}
                    </span>
                    {meal.reminderTime ? (
                      <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-brand-text-muted">
                        <Clock className="h-3 w-3" />
                        {meal.reminderTime}
                      </span>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-brand-text-soft">
                    {meal.description}
                  </p>
                </div>
              ))}
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

function isDecimalLike(value: unknown): value is DecimalLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as DecimalLike).s === 'number' &&
    typeof (value as DecimalLike).e === 'number' &&
    Array.isArray((value as DecimalLike).d)
  );
}

function decimalLikeToString(value: DecimalLike) {
  if (!value.d.length || value.s === 0) return '0';

  const digits = value.d.map((part, index) => (index === 0 ? String(part) : String(part).padStart(7, '0'))).join('');
  const pointIndex = value.e + 1;
  let result: string;

  if (pointIndex <= 0) {
    result = `0.${'0'.repeat(Math.abs(pointIndex))}${digits}`;
  } else if (pointIndex >= digits.length) {
    result = `${digits}${'0'.repeat(pointIndex - digits.length)}`;
  } else {
    result = `${digits.slice(0, pointIndex)}.${digits.slice(pointIndex)}`;
  }

  result = result.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');

  return value.s < 0 && result !== '0' ? `-${result}` : result;
}

function toDisplayText(value: unknown, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (isDecimalLike(value)) return decimalLikeToString(value);

  return fallback;
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-brand-surface-2">
      <span className="block text-xs text-slate-500 dark:text-brand-text-muted">{label}</span>
      <strong className="mt-1 block">{toDisplayText(value)}</strong>
    </div>
  );
}

function StudentForm({ student, onClose }: { student?: Student; onClose: () => void }) {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const profile = student?.studentProfile;
  const [form, setForm] = useState({
    fullName: student?.fullName ?? '',
    phone: student?.phone ?? '',
    email: student?.email ?? '',
    password: '',
    avatar: student?.avatar ?? '',
    age: profile?.age?.toString() ?? '',
    weight: toDisplayText(profile?.weight, ''),
    height: toDisplayText(profile?.height, ''),
    goal: profile?.goal ?? '',
    gender: (profile?.gender ?? '') as Gender | '',
  });
  const mutation = student ? updateStudent : createStudent;

  const toOptionalNumber = (value: string) => (value.trim() ? Number(value) : undefined);
  const toOptionalString = (value: string) => (value.trim() ? value.trim() : undefined);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const basePayload = {
      fullName: form.fullName,
      phone: form.phone,
      email: toOptionalString(form.email),
      avatar: toOptionalString(form.avatar),
      age: toOptionalNumber(form.age),
      weight: toOptionalNumber(form.weight),
      height: toOptionalNumber(form.height),
      goal: toOptionalString(form.goal),
      gender: form.gender || undefined,
    };

    if (student) {
      const payload: UpdateStudentRequest = basePayload;
      updateStudent.mutate({ id: student.id, payload }, { onSuccess: onClose });
      return;
    }

    const payload: CreateStudentRequest = {
      ...basePayload,
      password: form.password,
    };
    createStudent.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Modal title={student ? 'ویرایش ورزشکار' : 'افزودن ورزشکار'} onClose={onClose}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input placeholder="نام کامل" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
        <Input placeholder="شماره موبایل" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
        <Input placeholder="ایمیل" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        {!student ? (
          <PasswordInput placeholder="رمز عبور" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        ) : null}
        <Input placeholder="آواتار" value={form.avatar} onChange={(event) => setForm({ ...form, avatar: event.target.value })} />
        <div className="grid gap-2 sm:grid-cols-3">
          <Input placeholder="سن" inputMode="numeric" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
          <Input placeholder="وزن" inputMode="decimal" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} />
          <Input placeholder="قد" inputMode="decimal" value={form.height} onChange={(event) => setForm({ ...form, height: event.target.value })} />
        </div>
        <div className="flex gap-3">
          {(['MALE', 'FEMALE'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm({ ...form, gender: g })}
              className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200 ${
                form.gender === g
                  ? 'border-brand-red bg-brand-red text-white dark:border-brand-red-bright dark:bg-brand-red dark:text-brand-text-main'
                  : 'border-stone-300 bg-stone-50/80 text-slate-600 hover:border-brand-red/40 dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-soft dark:hover:border-brand-red/40 dark:hover:bg-brand-carbon'
              }`}
            >
              <img
                src={g === 'MALE' ? '/images/men.png' : '/images/women.png'}
                alt={g === 'MALE' ? 'مرد' : 'زن'}
                className="h-6 w-6 rounded-full object-cover"
              />
              {g === 'MALE' ? 'مرد' : 'زن'}
            </button>
          ))}
        </div>
        <Textarea rows={3} placeholder="هدف" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} />
        {mutation.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(mutation.error)}</p> : null}
        {mutation.data?.message ? <p className="text-sm text-status-success dark:text-green-300">{mutation.data.message}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" disabled={mutation.isPending || !form.fullName.trim() || !form.phone.trim()}>
            {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function NewProgramPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: studentResponse } = useStudent(id);
  const createProgram = useCreateProgram();
  const [daysCount, setDaysCount] = useState(3);
  const [durationDays, setDurationDays] = useState(30);
  const [days, setDays] = useState<DraftProgramDay[]>(makeDays(3));
  const [activeDay, setActiveDay] = useState<DraftProgramDay | null>(null);

  const resetDays = (count: number) => {
    setDaysCount(count);
    setDays(makeDays(count));
  };

  const updateDay = (day: DraftProgramDay) => {
    setDays((current) => current.map((item) => (item.id === day.id ? day : item)));
    setActiveDay(null);
  };

  const buildDaysPayload = (): CreateProgramDayRequest[] =>
    days.map((day) => ({
      dayNumber: day.dayNumber,
      blocks: day.blocks.map((block) => ({
        type: block.type,
        note: block.note.trim() || undefined,
        items: block.items
          .filter((item) => item.exerciseId)
          .map((item, index) => ({
            exerciseId: item.exerciseId,
            sets: Number(item.sets) || 0,
            reps: item.reps,
            rest: item.rest.trim() || undefined,
            order: index + 1,
          })),
      })),
    }));

  const handleSubmit = () => {
    createProgram.mutate(
      {
        title: `برنامه ${formatPersianDate(new Date())}`,
        studentId: id,
        durationDays,
        days: buildDaysPayload(),
      },
      {
        onSuccess: () => navigate(`/coach/athletes/${id}`),
      },
    );
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">ساخت برنامه تمرینی جدید</h1>
        <p className="text-sm text-slate-500 dark:text-brand-text-muted">{studentResponse?.data.fullName}</p>
      </div>
      <Card className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold">تعداد روزهای تمرین در هفته</label>
          <Select value={daysCount} onChange={(event) => resetDays(Number(event.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((count) => (
              <option key={count} value={count}>
                {count} روز
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold">مدت اعتبار برنامه</label>
          <Select value={durationDays} onChange={(event) => setDurationDays(Number(event.target.value))}>
            {[14, 21, 30, 45, 60, 90].map((days) => (
              <option key={days} value={days}>
                {days} روز
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {days.map((day) => (
            <button
              key={day.id}
              className="rounded-xl border border-stone-300 bg-stone-100/80 p-4 text-right transition hover:border-brand-red/50 dark:border-brand-border dark:bg-brand-surface dark:hover:border-brand-red-bright/50"
              onClick={() => setActiveDay(day)}
            >
              <span className="block font-bold">روز {day.dayNumber}</span>
              <span className="mt-1 block text-sm text-slate-500">{day.blocks.length} بلوک تمرینی</span>
            </button>
          ))}
        </div>
        {createProgram.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(createProgram.error)}</p> : null}
        {createProgram.data?.message ? <p className="text-sm text-status-success dark:text-green-300">{createProgram.data.message}</p> : null}
        <Button className="w-full" disabled={createProgram.isPending} onClick={handleSubmit}>
          {createProgram.isPending ? 'در حال ذخیره...' : 'ذخیره برنامه'}
        </Button>
      </Card>
      {activeDay ? <DayExerciseModal day={activeDay} onSave={updateDay} onClose={() => setActiveDay(null)} /> : null}
    </section>
  );
}

function makeDays(count: number): DraftProgramDay[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `day-${index + 1}`,
    dayNumber: index + 1,
    blocks: [],
  }));
}

function DayExerciseModal({ day, onSave, onClose }: { day: DraftProgramDay; onSave: (day: DraftProgramDay) => void; onClose: () => void }) {
  const [blocks, setBlocks] = useState<DraftProgramBlock[]>(day.blocks);

  const addBlock = () => {
    setBlocks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        type: 'NORMAL',
        note: '',
        items: [emptyItem()],
      },
    ]);
  };

  const updateBlockType = (blockId: string, type: ExerciseBlockType) => {
    const length = type === 'NORMAL' ? 1 : type === 'SUPERSET' ? 2 : 3;
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? {
              ...block,
              type,
              items: Array.from({ length }, (_, index) => block.items[index] ?? emptyItem()),
            }
          : block,
      ),
    );
  };

  const updateBlockNote = (blockId: string, note: string) => {
    setBlocks((current) => current.map((block) => (block.id === blockId ? { ...block, note } : block)));
  };

  const updateItem = (blockId: string, index: number, patch: Partial<DraftProgramExerciseItem>) => {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? {
              ...block,
              items: block.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
            }
          : block,
      ),
    );
  };

  return (
    <Modal title={`افزودن حرکات روز ${day.dayNumber}`} onClose={onClose}>
      <div className="space-y-4">
        {blocks.length === 0 ? <EmptyState title="هنوز حرکتی اضافه نشده است" /> : null}
        {blocks.map((block, blockIndex) => (
          <div key={block.id} className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-brand-border">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold">بلوک {blockIndex + 1}</span>
              <Select className="max-w-36" value={block.type} onChange={(event) => updateBlockType(block.id, event.target.value as ExerciseBlockType)}>
                {Object.entries(blockLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <Textarea rows={2} placeholder="یادداشت این بلوک" value={block.note} onChange={(event) => updateBlockNote(block.id, event.target.value)} />
            {block.items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-xl bg-slate-50 p-3 dark:bg-brand-surface-2 sm:grid-cols-[1fr_90px_110px_110px]">
                <ExercisePicker value={item.exerciseId} onChange={(exerciseId) => updateItem(block.id, index, { exerciseId })} />
                <Input placeholder="ست" inputMode="numeric" value={item.sets} onChange={(event) => updateItem(block.id, index, { sets: event.target.value })} />
                <Input placeholder="تکرار" value={item.reps} onChange={(event) => updateItem(block.id, index, { reps: event.target.value })} />
                <Input placeholder="استراحت" value={item.rest} onChange={(event) => updateItem(block.id, index, { rest: event.target.value })} />
              </div>
            ))}
          </div>
        ))}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" onClick={addBlock}>
            <Plus className="h-5 w-5" />
            افزودن بلوک
          </Button>
          <Button className="flex-1" onClick={() => onSave({ ...day, blocks })}>
            ثبت حرکات
          </Button>
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function emptyItem(): DraftProgramExerciseItem {
  return { exerciseId: '', sets: '3', reps: '', rest: '' };
}

export function ExerciseManagementPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Exercise | null>(null);
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteExercises({ search });
  const deleteExercise = useDeleteExercise();
  const exercises = data?.pages.flatMap((p) => p.data.items) ?? [];
  const canManage = user?.role === 'ADMIN' || user?.role === 'COACH';
  const sentinelRef = useScrollSentinel(fetchNextPage, hasNextPage && !isFetchingNextPage);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">مدیریت حرکات</h1>
          <p className="text-sm text-slate-500 dark:text-brand-text-muted">افزودن، ویرایش و حذف حرکات آموزشی.</p>
        </div>
        {canManage ? (
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-5 w-5" />
            حرکت جدید
          </Button>
        ) : null}
      </div>
      <SearchBox placeholder="جستجو در حرکات" value={search} onChange={(event) => setSearch(event.target.value)} />
      {isLoading ? <EmptyState title="در حال دریافت حرکات..." /> : null}
      {isError ? <EmptyState title={getApiErrorMessage(error)} /> : null}
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <Card key={exercise.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-bold">{exercise.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-brand-text-muted">
                  {truncateText(exercise.description, 120) || 'توضیحاتی ثبت نشده است.'}
                </p>
              </div>
              {canManage ? (
                <div className="flex gap-2">
                  <Button variant="secondary" className="h-11 w-11 px-0" onClick={() => setEditing(exercise)}>
                    <Edit className="h-6 w-6" />
                  </Button>
                  <Button variant="danger" className="h-11 w-11 px-0" onClick={() => setConfirmDelete(exercise)}>
                    <Trash2 className="h-6 w-6" />
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
      <div ref={sentinelRef} />
      {isFetchingNextPage ? <ScrollLoader /> : null}
      {deleteExercise.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(deleteExercise.error)}</p> : null}
      {deleteExercise.data?.message ? <p className="text-sm text-status-success dark:text-green-300">{deleteExercise.data.message}</p> : null}
      {creating ? <ExerciseForm onClose={() => setCreating(false)} /> : null}
      {editing ? <ExerciseForm exercise={editing} onClose={() => setEditing(null)} /> : null}
      {confirmDelete ? (
        <Modal title="حذف حرکت" onClose={() => setConfirmDelete(null)}>
          <p className="mb-5 text-slate-600 dark:text-brand-text-soft">
            آیا از حذف حرکت <span className="font-bold text-slate-800 dark:text-brand-text-main">«{confirmDelete.title}»</span> مطمئن هستید؟ این عمل قابل بازگشت نیست.
          </p>
          {deleteExercise.isError ? <p className="mb-3 text-sm text-status-error dark:text-red-300">{getApiErrorMessage(deleteExercise.error)}</p> : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="danger"
              className="flex-1"
              disabled={deleteExercise.isPending}
              onClick={() => deleteExercise.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })}
            >
              {deleteExercise.isPending ? 'در حال حذف...' : 'بله، حذف شود'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(null)}>
              انصراف
            </Button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

function ExerciseForm({ exercise, onClose }: { exercise?: Exercise; onClose: () => void }) {
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();
  const uploadVideo = useUploadVideo();
  const uploadImage = useUploadImage();
  const [form, setForm] = useState<CreateExerciseRequest>({
    title: exercise?.title ?? '',
    description: exercise?.description ?? '',
    videoUrl: exercise?.videoUrl ?? '',
    thumbnailUrl: exercise?.thumbnailUrl ?? '',
    imageUrl: exercise?.imageUrl ?? '',
    muscleGroup: exercise?.muscleGroup ?? undefined,
  });
  const mutation = exercise ? updateExercise : createExercise;

  const toPayload = (): CreateExerciseRequest => ({
    title: form.title,
    description: form.description?.trim() || undefined,
    videoUrl: form.videoUrl?.trim() || undefined,
    thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
    imageUrl: form.imageUrl?.trim() || undefined,
    muscleGroup: form.muscleGroup || undefined,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (exercise) {
      updateExercise.mutate({ id: exercise.id, payload: toPayload() }, { onSuccess: onClose });
      return;
    }
    createExercise.mutate(toPayload(), { onSuccess: onClose });
  };

  const handleVideoChange = (file?: File) => {
    if (!file) return;
    uploadVideo.mutate(file, {
      onSuccess: (response) => {
        setForm((current) => ({
          ...current,
          videoUrl: response.data.url,
          thumbnailUrl: response.data.thumbnailUrl ?? '',
        }));
      },
    });
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;
    uploadImage.mutate(file, {
      onSuccess: (response) => {
        setForm((current) => ({ ...current, imageUrl: response.data.url }));
      },
    });
  };

  const isUploading = uploadVideo.isPending || uploadImage.isPending;

  return (
    <Modal title={exercise ? 'ویرایش حرکت' : 'افزودن حرکت'} onClose={onClose}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input placeholder="نام حرکت" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <Select value={form.muscleGroup ?? ''} onChange={(event) => setForm({ ...form, muscleGroup: (event.target.value as MuscleGroup) || undefined })}>
          <option value="">عضله هدف را انتخاب کنید</option>
          {(Object.keys(muscleGroupLabels) as MuscleGroup[]).map((key) => (
            <option key={key} value={key}>{muscleGroupLabels[key]}</option>
          ))}
        </Select>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600 dark:text-brand-text-soft">ویدیو حرکت</p>
          <Input placeholder="آدرس ویدیو" value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} />
          <input
            className="block w-full text-sm text-slate-500 dark:text-brand-text-muted file:ml-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-3 file:text-sm file:font-bold dark:file:bg-brand-carbon dark:file:text-brand-text-main"
            type="file"
            accept="video/*"
            onChange={(event) => handleVideoChange(event.target.files?.[0])}
          />
          {uploadVideo.isPending ? <p className="text-sm text-slate-500">در حال آپلود ویدیو...</p> : null}
          {uploadVideo.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(uploadVideo.error)}</p> : null}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600 dark:text-brand-text-soft">تصویر حرکت</p>
          <Input placeholder="آدرس تصویر" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
          <input
            className="block w-full text-sm text-slate-500 dark:text-brand-text-muted file:ml-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-3 file:text-sm file:font-bold dark:file:bg-brand-carbon dark:file:text-brand-text-main"
            type="file"
            accept="image/*"
            onChange={(event) => handleImageChange(event.target.files?.[0])}
          />
          {uploadImage.isPending ? <p className="text-sm text-slate-500">در حال آپلود تصویر...</p> : null}
          {uploadImage.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(uploadImage.error)}</p> : null}
        </div>
        <Textarea rows={4} placeholder="توضیحات حرکت" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        {mutation.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(mutation.error)}</p> : null}
        {mutation.data?.message ? <p className="text-sm text-status-success dark:text-green-300">{mutation.data.message}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" disabled={mutation.isPending || isUploading || !form.title.trim()}>
            {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function QuestionsManagementPage() {
  const { data: response, isLoading, isError, error } = useQuestions();
  const questions = response?.data.items ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-black">سوال های ورزشکاران</h1>
      {isLoading ? <EmptyState title="در حال دریافت سوال ها..." /> : null}
      {isError ? <EmptyState title={getApiErrorMessage(error)} /> : null}
      {!isLoading && questions.length === 0 ? <EmptyState title="سوالی ثبت نشده است" /> : null}
      {questions.map((question) => (
        <Card key={question.id} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold">{question.student?.fullName ?? 'ورزشکار'}</h2>
              <p className="text-xs text-slate-500">{question.exercise?.title ?? 'سوال عمومی'}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${question.status === 'ANSWERED' ? 'bg-status-success/15 text-green-800 dark:bg-status-success/20 dark:text-green-300' : 'bg-status-warning/15 text-orange-900 dark:bg-status-warning/20 dark:text-orange-300'}`}>
              {question.status === 'ANSWERED' ? 'پاسخ داده شده' : 'در انتظار پاسخ'}
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700 dark:text-brand-text-soft">{question.question}</p>
          {question.answer ? <p className="rounded-xl bg-slate-100 p-3 text-sm leading-7 dark:bg-brand-surface-2">{question.answer}</p> : null}
          <AnswerQuestionForm id={question.id} />
        </Card>
      ))}
    </section>
  );
}

function AnswerQuestionForm({ id }: { id: string }) {
  const answerQuestion = useAnswerQuestion();
  const [answer, setAnswer] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!answer.trim()) return;

    answerQuestion.mutate(
      { id, payload: { answer } },
      {
        onSuccess: () => setAnswer(''),
      },
    );
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <Textarea rows={3} placeholder="پاسخ مربی" value={answer} onChange={(event) => setAnswer(event.target.value)} />
      {answerQuestion.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(answerQuestion.error)}</p> : null}
      {answerQuestion.data?.message ? <p className="text-sm text-status-success dark:text-green-300">{answerQuestion.data.message}</p> : null}
      <Button disabled={answerQuestion.isPending || !answer.trim()}>
        <Send className="h-4 w-4" />
        {answerQuestion.isPending ? 'در حال ارسال...' : 'ارسال پاسخ'}
      </Button>
    </form>
  );
}

// ─── Nutrition Plan Page ──────────────────────────────────────────────────────

type NutritionMealDraft = {
  type: MealType;
  label: string;
  description: string;
  order: number;
};

type NutritionStep = 'setup' | 'fill' | 'preview';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toPersianNum = (n: number) =>
  String(n)
    .split('')
    .map((d) => PERSIAN_DIGITS[+d])
    .join('');

const MAIN_MEALS = [
  { key: 'breakfast' as const, label: 'صبحانه', type: 'BREAKFAST' as MealType },
  { key: 'lunch' as const, label: 'ناهار', type: 'LUNCH' as MealType },
  { key: 'dinner' as const, label: 'شام', type: 'DINNER' as MealType },
];

type SelectedMeals = { breakfast: boolean; lunch: boolean; dinner: boolean };

function buildMeals(selected: SelectedMeals, snackCounts: Record<string, number>): NutritionMealDraft[] {
  const active = MAIN_MEALS.filter((m) => selected[m.key]);
  const result: Omit<NutritionMealDraft, 'order'>[] = [];
  let snackCounter = 0;

  for (let i = 0; i < active.length; i++) {
    result.push({ type: active[i].type, label: active[i].label, description: '' });
    if (i < active.length - 1) {
      const gapKey = `${active[i].key}-${active[i + 1].key}`;
      const count = snackCounts[gapKey] ?? 0;
      for (let j = 0; j < count; j++) {
        snackCounter++;
        result.push({ type: 'SNACK', label: `میان‌وعده ${toPersianNum(snackCounter)}`, description: '' });
      }
    }
  }

  return result.map((m, i) => ({ ...m, order: i + 1 }));
}

const nutritionMealColors: Record<MealType, string> = {
  BREAKFAST: 'bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400',
  LUNCH: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400',
  DINNER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400',
  SNACK: 'bg-status-success/15 text-green-800 dark:bg-status-success/20 dark:text-green-300',
};

const STEP_LABELS = ['انتخاب وعده‌ها', 'محتوای وعده‌ها', 'پیش‌نمایش'] as const;
const stepIndex = (step: NutritionStep) => (step === 'setup' ? 0 : step === 'fill' ? 1 : 2);

export function NutritionPlanPage() {
  const [step, setStep] = useState<NutritionStep>('setup');
  const [studentId, setStudentId] = useState('');
  const [selected, setSelected] = useState<SelectedMeals>({ breakfast: true, lunch: true, dinner: true });
  const [snackCounts, setSnackCounts] = useState<Record<string, number>>({});
  const [meals, setMeals] = useState<NutritionMealDraft[]>([]);
  const [done, setDone] = useState(false);

  const { data: studentsRes } = useStudents({ limit: 100 });
  const students = studentsRes?.data.items ?? [];
  const { mutate: create, isPending, isError, error } = useCreateNutritionPlan();

  const activeMeals = MAIN_MEALS.filter((m) => selected[m.key]);
  const gaps = activeMeals.slice(0, -1).map((m, i) => ({
    key: `${m.key}-${activeMeals[i + 1].key}`,
    label: `میان‌وعده بین ${m.label} و ${activeMeals[i + 1].label}`,
  }));

  const goToFill = () => {
    setMeals(buildMeals(selected, snackCounts));
    setStep('fill');
  };

  const submit = () => {
    const payload: CreateNutritionMealRequest[] = meals.map(({ type, label, description, order }) => ({
      type,
      label,
      description,
      order,
    }));
    create({ studentId, meals: payload }, { onSuccess: () => setDone(true) });
  };

  const resetForm = () => {
    setDone(false);
    setStep('setup');
    setStudentId('');
    setSelected({ breakfast: true, lunch: true, dinner: true });
    setSnackCounts({});
    setMeals([]);
  };

  if (done) {
    return (
      <section className="space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-status-success/30 bg-status-success/10 p-8 text-center dark:border-status-success/40 dark:bg-status-success/10"
        >
          <CheckCircle2 className="h-12 w-12 text-status-success" />
          <div>
            <h2 className="text-xl font-black text-green-900 dark:text-green-300">برنامه تغذیه ثبت شد</h2>
            <p className="mt-1 text-sm text-status-success dark:text-green-300">برنامه غذایی با موفقیت برای ورزشکار ایجاد شد.</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/coach/athletes/${studentId}`}>
              <Button variant="secondary">پروفایل ورزشکار</Button>
            </Link>
            <Button onClick={resetForm}>برنامه جدید</Button>
          </div>
        </motion.div>
      </section>
    );
  }

  const idx = stepIndex(step);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">ایجاد برنامه تغذیه</h1>
        <p className="text-sm text-slate-500 dark:text-brand-text-muted">برنامه غذایی اختصاصی برای ورزشکار بسازید.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < idx
                  ? 'bg-brand-red text-white dark:bg-brand-red dark:text-brand-text-main'
                  : i === idx
                    ? 'bg-brand-red text-white dark:bg-brand-red dark:text-brand-text-main'
                    : 'bg-stone-300 text-slate-500 dark:bg-brand-carbon dark:text-brand-text-muted'
              }`}
            >
              {i < idx ? <Check className="h-3.5 w-3.5" /> : toPersianNum(i + 1)}
            </div>
            <span
              className={`hidden text-xs font-semibold sm:block ${
                i === idx ? 'text-slate-800 dark:text-brand-text-main' : 'text-slate-400 dark:text-brand-text-muted'
              }`}
            >
              {label}
            </span>
            {i < STEP_LABELS.length - 1 ? (
              <div className={`mx-1 h-px w-6 shrink-0 sm:w-10 ${i < idx ? 'bg-brand-red dark:bg-brand-red-bright' : 'bg-stone-300 dark:bg-brand-border'}`} />
            ) : null}
          </div>
        ))}
      </div>

      {/* Step 1: Setup */}
      {step === 'setup' ? (
        <Card className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-bold">ورزشکار</label>
            <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">انتخاب ورزشکار</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.phone})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold">وعده‌های اصلی</label>
            <div className="flex gap-3">
              {MAIN_MEALS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all duration-200 ${
                    selected[key]
                      ? 'border-brand-red bg-brand-red text-white dark:border-brand-red-bright dark:bg-brand-red dark:text-brand-text-main'
                      : 'border-stone-300 bg-stone-50/80 text-slate-600 hover:border-brand-red/40 dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-soft'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {gaps.map((gap) => (
            <NutritionSnackPicker
              key={gap.key}
              label={gap.label}
              value={snackCounts[gap.key] ?? 0}
              onChange={(n) => setSnackCounts((prev) => ({ ...prev, [gap.key]: n }))}
            />
          ))}

          <Button
            className="w-full"
            disabled={!studentId || activeMeals.length === 0}
            onClick={goToFill}
          >
            مرحله بعد
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Card>
      ) : null}

      {/* Step 2: Fill descriptions */}
      {step === 'fill' ? (
        <div className="space-y-4">
          {meals.map((meal, i) => (
            <Card key={i} className="space-y-3">
              <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${nutritionMealColors[meal.type]}`}>
                {meal.label}
              </span>
              <Textarea
                rows={4}
                placeholder={`محتوای ${meal.label} را وارد کنید...`}
                value={meal.description}
                onChange={(e) => {
                  const updated = [...meals];
                  updated[i] = { ...meal, description: e.target.value };
                  setMeals(updated);
                }}
              />
            </Card>
          ))}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('setup')}>
              <ChevronRight className="h-4 w-4" />
              قبلی
            </Button>
            <Button
              className="flex-1"
              disabled={meals.some((m) => !m.description.trim())}
              onClick={() => setStep('preview')}
            >
              پیش‌نمایش
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      {/* Step 3: Preview */}
      {step === 'preview' ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {meals.map((meal, i) => (
              <Card key={i} className="space-y-2">
                <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${nutritionMealColors[meal.type]}`}>
                  {meal.label}
                </span>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-brand-text-soft">{meal.description}</p>
              </Card>
            ))}
          </div>
          {isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(error)}</p> : null}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setStep('fill')}>
              <ChevronRight className="h-4 w-4" />
              ویرایش
            </Button>
            <Button className="flex-1" disabled={isPending} onClick={submit}>
              {isPending ? 'در حال ثبت...' : 'تأیید و ثبت برنامه'}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function NutritionSnackPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold">{label}</label>
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-10 flex-1 rounded-xl border text-sm font-bold transition-all duration-200 ${
              value === n
                ? 'border-brand-red bg-brand-red text-white dark:border-brand-red-bright dark:bg-brand-red dark:text-brand-text-main'
                : 'border-stone-300 bg-stone-50/80 text-slate-600 hover:border-brand-red/40 dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-soft'
            }`}
          >
            {toPersianNum(n)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const sendNotification = useSendNotification();
  const [form, setForm] = useState({ userId: '', title: '', body: '' });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendNotification.mutate({
      userId: form.userId.trim() || undefined,
      title: form.title,
      body: form.body,
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">ارسال اعلان</h1>
        <p className="text-sm text-slate-500 dark:text-brand-text-muted">payload برای push، sms و email آماده ارسال است.</p>
      </div>
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input placeholder="شناسه کاربر (اختیاری)" value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} />
          <Input placeholder="عنوان" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <Textarea rows={4} placeholder="متن پیام" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} required />
          {sendNotification.isError ? <p className="text-sm text-status-error dark:text-red-300">{getApiErrorMessage(sendNotification.error)}</p> : null}
          {sendNotification.data?.message ? <p className="text-sm text-status-success dark:text-green-300">{sendNotification.data.message}</p> : null}
          <Button disabled={sendNotification.isPending || !form.title.trim() || !form.body.trim()}>
            <Send className="h-4 w-4" />
            {sendNotification.isPending ? 'در حال ارسال...' : 'ارسال'}
          </Button>
        </form>
      </Card>
    </section>
  );
}
