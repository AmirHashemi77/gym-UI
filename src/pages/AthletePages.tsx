import { Activity, Bell, Bookmark, BookmarkCheck, BookOpen, CheckCircle2, ChevronLeft, Clock, Dumbbell, Heart, MessageCircle, NotebookText, Play, Search, UtensilsCrossed, Waves, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage, getMediaUrl } from "../api/http";
import { notificationsService } from "../api/notifications.service";
import type { MealType, NutritionMeal, NutritionPlan, Program } from "../api/types";
import { requestNotificationPermission, subscribeToPush } from "../services/pushNotification";
import { Button, Card, EmptyState, ScrollLoader, SearchBox, Textarea } from "../components/ui";
import { HomeFoodCategoriesWidget } from "./FoodDatabasePages";
import { useAuth } from "../features/auth";
import { useBookmarkExercise, useExercise, useInfiniteExercises, useUnbookmarkExercise } from "../hooks/exercises";
import { useMyNutritionPlan, useUpdateMealReminder } from "../hooks/nutrition";
import { useScrollSentinel } from "../hooks/useScrollSentinel";
import { useActiveProgramStats, useProgram, usePrograms } from "../hooks/programs";
import { useCreateQuestion, useQuestions } from "../hooks/questions";
import { formatPersianDate } from "../utils/date";
import { truncateText } from "../utils/text";

// ─── Home Page ────────────────────────────────────────────────────────────────

const HOME_CATEGORIES = [
  { label: "کاردیو", icon: Activity, className: "bg-orange-500/15 text-orange-400" },
  { label: "قدرتی", icon: Dumbbell, className: "bg-blue-500/15 text-blue-400" },
  { label: "هایت", icon: Zap, className: "bg-yellow-500/15 text-yellow-400" },
  { label: "یوگا", icon: Heart, className: "bg-pink-500/15 text-pink-400" },
  { label: "کشش", icon: Waves, className: "bg-cyan-500/15 text-cyan-400" },
] as const;

export function AthleteHomePage() {
  const { user } = useAuth();
  const { data: statsRes, isLoading: statsLoading } = useActiveProgramStats();
  const { data: nutritionRes } = useMyNutritionPlan();

  const stats = statsRes?.data ?? null;
  const { data: programRes } = useProgram(stats?.programId ?? '');

  const activeProgram = programRes?.data ?? null;
  const nutritionPlan = nutritionRes?.data ?? null;

  return (
    <section className="space-y-6 pb-4">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-white/40">سلام</p>
          <h1 className="text-2xl font-black">{user?.fullName}!</h1>
        </div>
        <img
          src={user?.avatar ?? (user?.gender === 'FEMALE' ? '/images/women.png' : '/images/men.png')}
          alt={user?.fullName}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-yellow/30"
        />
      </motion.div>

      {/* Search bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <Link to="/athlete/exercises" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.07]">
          <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-white/30" />
          <span className="text-sm text-slate-400 dark:text-white/30">جستجوی حرکت...</span>
        </Link>
      </motion.div>

      {/* Categories */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">دسته‌بندی‌ها</h2>
          <Link to="/athlete/exercises" className="text-xs font-semibold text-surface-dark dark:text-brand-yellow">مشاهده همه</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
          {HOME_CATEGORIES.map((cat, i) => (
            <motion.div key={cat.label} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 + i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="shrink-0">
              <Link to="/athlete/exercises" className="flex flex-col items-center gap-2">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl ${cat.className}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-white/60">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Program Progress Card */}
      {!statsLoading && (stats ? (
        <ProgramProgressCard
          programTitle={stats.programTitle}
          remainingDays={stats.remainingDays}
          totalDays={stats.totalDays}
          completedDays={stats.completedDays}
          durationDays={stats.durationDays}
          calendarRemainingDays={stats.calendarRemainingDays}
        />
      ) : <NoProgramCard />)}

      {/* Food database */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h2 className="font-bold">بانک غذایی</h2>
          </div>
          <Link to="/athlete/foods" className="text-xs font-semibold text-teal-600 dark:text-teal-400">مشاهده همه</Link>
        </div>
        <HomeFoodCategoriesWidget />
      </motion.div>

      {/* Active program detail */}
      {activeProgram ? <ActiveProgramHomeCard program={activeProgram} /> : null}

      {/* Nutrition plan */}
      {nutritionPlan ? <NutritionPlanHomeCard plan={nutritionPlan} /> : null}
    </section>
  );
}

function ActiveProgramHomeCard({ program }: { program: Program }) {
  const sortedDays = [...program.days].sort((a, b) => a.dayNumber - b.dayNumber);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full min-w-0"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookText className="h-4 w-4 text-surface-dark dark:text-brand-yellow" />
          <h2 className="font-bold">روزهای تمرین</h2>
        </div>
        <Link to={`/athlete/programs/${program.id}`} className="text-xs font-semibold text-surface-dark dark:text-brand-yellow">
          مشاهده کامل
        </Link>
      </div>
      <Link to={`/athlete/programs/${program.id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-surface-dark p-4 text-white transition-opacity hover:opacity-90">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-brand-yellow/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-brand-yellow/10 blur-2xl" />
          <p className="relative mb-0.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">برنامه فعال</p>
          <p className="relative mb-4 line-clamp-1 text-base font-black">{program.title}</p>
          <div className="relative grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(sortedDays.length, 4)}, 1fr)` }}>
            {sortedDays.map((day) => {
              const exerciseCount = day.blocks.reduce((sum, b) => sum + b.items.length, 0);
              return (
                <div key={day.id} className="rounded-2xl bg-white/[0.08] py-3 text-center ring-1 ring-white/10">
                  <p className="text-[10px] font-semibold text-white/40">روز</p>
                  <p className="text-xl font-black leading-none text-brand-yellow">{day.dayNumber}</p>
                  <p className="mt-1.5 text-[10px] text-white/40">{exerciseCount} حرکت</p>
                </div>
              );
            })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function NutritionPlanHomeCard({ plan }: { plan: NutritionPlan }) {
  const sortedMeals = [...plan.meals].sort((a, b) => a.order - b.order);
  const visible = sortedMeals.slice(0, 5);
  const hiddenCount = sortedMeals.length - visible.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full min-w-0"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold">برنامه تغذیه</h2>
        </div>
        <Link to="/athlete/nutrition" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">مشاهده کامل</Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.07]">
        {visible.map((meal, i) => (
          <div
            key={meal.id}
            className={`flex min-w-0 items-start gap-3 px-4 py-3 ${i < visible.length - 1 || hiddenCount > 0 ? 'border-b border-slate-100 dark:border-white/[0.06]' : ''}`}
          >
            <span className={`mt-0.5 shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-bold ${athleteMealColors[meal.type]}`}>
              {meal.label}
            </span>
            <p className="min-w-0 flex-1 truncate text-sm text-slate-600 dark:text-white/60">{meal.description}</p>
            {meal.reminderTime ? (
              <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-white/30">{meal.reminderTime}</span>
            ) : null}
          </div>
        ))}
        {hiddenCount > 0 ? (
          <Link to="/athlete/nutrition" className="block py-2.5 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            و {hiddenCount} وعده دیگر ←
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}

function NoProgramCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md dark:border-white/10"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-white/40">برنامه تمرینی</p>
          <h3 className="mt-1 text-base font-black text-slate-700 dark:text-white">برنامه فعالی ندارید</h3>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-white/40">برای شروع تمرین از مربی خود درخواست برنامه دهید.</p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-brand-yellow/40 px-4 py-2 text-sm font-bold text-brand-yellow transition hover:bg-brand-yellow/10"
          >
            درخواست برنامه
          </button>
        </div>
        <div className="relative shrink-0 opacity-25">
          <svg width="96" height="96" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="9" className="text-slate-300 dark:text-white" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="9" strokeDasharray="251" strokeDashoffset="251" className="text-slate-400 dark:text-white" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black leading-none text-slate-400 dark:text-white/50">—</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProgramProgressCard({
  programTitle,
  remainingDays,
  totalDays,
  completedDays,
  durationDays,
  calendarRemainingDays,
}: {
  programTitle: string;
  remainingDays: number;
  totalDays: number;
  completedDays: number;
  durationDays: number | null;
  calendarRemainingDays: number | null;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const displayDays = calendarRemainingDays !== null ? calendarRemainingDays : remainingDays;
  const progress =
    durationDays && calendarRemainingDays !== null
      ? calendarRemainingDays / durationDays
      : totalDays > 0
        ? completedDays / totalDays
        : 0;
  const safeProgress = Math.min(1, Math.max(0, progress));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className="rounded-2xl bg-brand-yellow p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-surface-dark/60">آخرین برنامه فعال</p>
          <h3 className="mt-1 line-clamp-1 text-base font-black text-surface-dark">{programTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-surface-dark/75">{remainingDays > 0 ? `${remainingDays} روز باقی‌مانده از برنامه‌ات` : "آفرین! برنامه‌ات تموم شد 🎉"}</p>
          <Link to="/athlete/programs" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface-dark px-4 py-2 text-sm font-bold text-white transition hover:bg-surface-mid">
            <Play className="h-3.5 w-3.5 fill-current" />
            مشاهده برنامه
          </Link>
        </div>

        {/* Circular Progress */}
        <div className="relative shrink-0">
          <svg width="96" height="96" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(70,52,78,0.18)" strokeWidth="9" />
            <g transform="rotate(-90, 50, 50)">
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#46344E"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - safeProgress) }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              />
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black leading-none text-surface-dark">{displayDays}</span>
            <span className="mt-0.5 text-[10px] font-bold text-surface-dark/60">روز</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Block Labels ──────────────────────────────────────────────────────────────

const blockLabels = {
  NORMAL: "معمولی",
  SUPERSET: "سوپرست",
  TRISET: "تری ست",
};

export function ExerciseSearchPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteExercises({ search });
  const exercises = data?.pages.flatMap((p) => p.data.items) ?? [];
  const sentinelRef = useScrollSentinel(fetchNextPage, hasNextPage && !isFetchingNextPage);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">جستجوی حرکات</h1>
        <p className="text-sm text-slate-500 dark:text-white/40">حرکت را پیدا کنید و آموزش آن را ببینید.</p>
      </div>
      <SearchBox placeholder="جستجو بر اساس نام حرکت" value={search} onChange={(event) => setSearch(event.target.value)} />
      {isError ? <EmptyState title={getApiErrorMessage(error)} /> : null}
      {isLoading ? <EmptyState title="در حال دریافت حرکات..." /> : null}
      {!isLoading && exercises.length === 0 ? <EmptyState title="حرکتی پیدا نشد" /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {exercises.map((exercise) => (
          <Link key={exercise.id} to={`/athlete/exercises/${exercise.id}`}>
            <Card className="h-full">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-bold">{exercise.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-white/40">{truncateText(exercise.description, 120) || "توضیحاتی ثبت نشده است."}</p>
                </div>
                <ChevronLeft className="h-5 w-5 text-slate-400" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <div ref={sentinelRef} />
      {isFetchingNextPage ? <ScrollLoader /> : null}
    </section>
  );
}

export function ExerciseDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const { data: response, isLoading, isError, error } = useExercise(id);
  const createQuestion = useCreateQuestion();
  const bookmarkExercise = useBookmarkExercise();
  const unbookmarkExercise = useUnbookmarkExercise();
  const [question, setQuestion] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const exercise = response?.data;

  const handleQuestionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) return;

    createQuestion.mutate(
      { exerciseId: exercise?.id, question },
      {
        onSuccess: () => setQuestion(""),
      },
    );
  };

  const handleBookmark = () => {
    if (!exercise) return;

    const mutation = bookmarked ? unbookmarkExercise : bookmarkExercise;
    mutation.mutate(exercise.id, {
      onSuccess: () => setBookmarked((current) => !current),
    });
  };

  if (isLoading) return <EmptyState title="در حال دریافت حرکت..." />;
  if (isError) return <EmptyState title={getApiErrorMessage(error)} />;
  if (!exercise) return <EmptyState title="حرکت پیدا نشد" />;

  const mediaUrl = getMediaUrl(exercise.videoUrl);
  const isGif = exercise.videoUrl?.toLowerCase().endsWith('.gif') ?? false;

  return (
    <section className="space-y-4">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">{exercise.title}</h1>
            <p className="text-sm text-slate-500 dark:text-white/40">{exercise.slug}</p>
          </div>
          {user?.role === "STUDENT" ? (
            <Button variant="secondary" className="h-12 w-12 px-0" disabled={bookmarkExercise.isPending || unbookmarkExercise.isPending} onClick={handleBookmark}>
              {bookmarked ? <BookmarkCheck className="h-7 w-7 text-green-700 dark:text-brand-yellow" /> : <Bookmark className="h-7 w-7" />}
            </Button>
          ) : null}
        </div>
        {mediaUrl ? (
          isGif ? (
            <img src={mediaUrl} alt={exercise.title} className="w-full rounded-xl object-cover" />
          ) : (
            <video className="aspect-video w-full rounded-xl bg-slate-950 dark:bg-surface-dark object-contain" src={mediaUrl} controls poster={getMediaUrl(exercise.thumbnailUrl) ?? undefined} />
          )
        ) : null}
        {exercise.description ? <p className="leading-8 text-slate-700 dark:text-white/70">{exercise.description}</p> : null}
      </Card>

      {user?.role === "STUDENT" ? (
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 font-bold">
            <MessageCircle className="h-5 w-5 text-green-700 dark:text-brand-yellow" />
            ثبت سوال درباره این حرکت
          </h2>
          <form className="space-y-3" onSubmit={handleQuestionSubmit}>
            <Textarea rows={4} placeholder="سوال خود را بنویسید" value={question} onChange={(event) => setQuestion(event.target.value)} />
            {createQuestion.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(createQuestion.error)}</p> : null}
            {createQuestion.data?.message ? <p className="text-sm text-emerald-600">{createQuestion.data.message}</p> : null}
            <Button disabled={!question.trim() || createQuestion.isPending}>{createQuestion.isPending ? "در حال ثبت..." : "ثبت سوال"}</Button>
          </form>
        </Card>
      ) : null}
    </section>
  );
}

export function MyQuestionsPage() {
  const { data: response, isLoading, isError, error } = useQuestions();
  const questions = response?.data.items ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-black">پرسش های من</h1>
      {isLoading ? <EmptyState title="در حال دریافت سوال ها..." /> : null}
      {isError ? <EmptyState title={getApiErrorMessage(error)} /> : null}
      {!isLoading && questions.length === 0 ? <EmptyState title="هنوز سوالی ثبت نکرده اید" /> : null}
      {questions.map((item) => (
        <Card key={item.id} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">{item.exercise?.title ?? "سوال عمومی"}</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "ANSWERED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400"}`}
            >
              {item.status === "ANSWERED" ? "پاسخ داده شده" : "در انتظار پاسخ"}
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700 dark:text-white/70">{item.question}</p>
          {item.answer ? <p className="rounded-xl bg-slate-100 p-3 text-sm leading-7 dark:bg-white/[0.07]">{item.answer}</p> : null}
        </Card>
      ))}
    </section>
  );
}

export function MyProgramsPage() {
  const { data: response, isLoading, isError, error } = usePrograms();
  const programs = response?.data.items ?? [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-black">برنامه های من</h1>
      {isLoading ? <EmptyState title="در حال دریافت برنامه ها..." /> : null}
      {isError ? <EmptyState title={getApiErrorMessage(error)} /> : null}
      {!isLoading && programs.length === 0 ? <EmptyState title="برنامه ای ثبت نشده است" /> : null}
      {programs.map((program) => (
        <Link key={program.id} to={`/athlete/programs/${program.id}`}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">{program.title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-white/40">
                  {formatPersianDate(program.createdAt)} - {program.days.length} روز تمرین
                </p>
              </div>
              <ChevronLeft className="h-5 w-5 text-slate-400" />
            </div>
          </Card>
        </Link>
      ))}
    </section>
  );
}

// ─── Nutrition Page ───────────────────────────────────────────────────────────

const athleteMealColors: Record<MealType, string> = {
  BREAKFAST: 'bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400',
  LUNCH: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400',
  DINNER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400',
  SNACK: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400',
};

export function NutritionPage() {
  const { data, isLoading } = useMyNutritionPlan();
  const updateReminder = useUpdateMealReminder();
  const [reminderTimes, setReminderTimes] = useState<Record<string, string>>({});
  const [savedMeals, setSavedMeals] = useState<Set<string>>(new Set());
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  );

  const plan = data?.data ?? null;

  // Populate reminder times from server data
  const prevPlanId = useState<string | null>(null);
  if (plan && plan.id !== prevPlanId[0]) {
    prevPlanId[1](plan.id);
    const init: Record<string, string> = {};
    for (const meal of plan.meals) {
      if (meal.reminderTime) init[meal.id] = meal.reminderTime;
    }
    setReminderTimes(init);
    setSavedMeals(new Set(plan.meals.filter((m) => m.reminderTime).map((m) => m.id)));
  }

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotifPermission(permission);
    if (permission !== 'granted') return;
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!vapidKey) return;
    const sub = await subscribeToPush(vapidKey);
    if (!sub) return;
    const json = sub.toJSON();
    if (!json.endpoint || !json.keys) return;
    await notificationsService.subscribePush({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys['p256dh'], auth: json.keys['auth'] },
    });
  };

  const handleSaveReminder = (meal: NutritionMeal) => {
    if (!plan) return;
    updateReminder.mutate(
      { planId: plan.id, mealId: meal.id, data: { reminderTime: reminderTimes[meal.id] || null } },
      {
        onSuccess: () => setSavedMeals((prev) => new Set([...prev, meal.id])),
      },
    );
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">برنامه تغذیه</h1>
        <p className="text-sm text-slate-500 dark:text-white/40">برنامه غذایی اختصاصی شما از مربی.</p>
      </div>

      {/* Notification permission banner */}
      {notifPermission !== 'granted' ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
          <div className="flex min-w-0 items-center gap-3">
            <Bell className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="truncate text-sm font-semibold text-amber-800 dark:text-amber-300">
              {notifPermission === 'denied'
                ? 'اجازه نوتیفیکیشن داده نشده؛ از تنظیمات مرورگر فعال کنید.'
                : 'برای یادآوری وعده‌ها اعلان را فعال کنید.'}
            </p>
          </div>
          {notifPermission === 'default' ? (
            <button
              onClick={handleEnableNotifications}
              className="shrink-0 rounded-xl border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-200 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 dark:hover:bg-amber-400/20"
            >
              فعال‌سازی
            </button>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">اعلان‌های یادآوری فعال است.</p>
        </div>
      )}

      {isLoading ? <EmptyState title="در حال دریافت برنامه تغذیه..." /> : null}
      {!isLoading && !plan ? (
        <EmptyState title="برنامه تغذیه‌ای دریافت نکرده‌اید" caption="برنامه غذایی شما توسط مربی ایجاد خواهد شد." />
      ) : null}

      {plan ? (
        <div className="space-y-3">
          {[...plan.meals].sort((a, b) => a.order - b.order).map((meal) => (
            <Card key={meal.id} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-xl px-3 py-1 text-xs font-bold ${athleteMealColors[meal.type]}`}>
                  {meal.label}
                </span>
                {savedMeals.has(meal.id) ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    ذخیره شد
                  </span>
                ) : null}
              </div>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-white/70">
                {meal.description}
              </p>
              {notifPermission === 'granted' ? (
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/[0.07]">
                  <Clock className="h-4 w-4 shrink-0 text-slate-400 dark:text-white/30" />
                  <input
                    type="time"
                    value={reminderTimes[meal.id] ?? ''}
                    onChange={(e) => {
                      setSavedMeals((prev) => {
                        const next = new Set(prev);
                        next.delete(meal.id);
                        return next;
                      });
                      setReminderTimes((prev) => ({ ...prev, [meal.id]: e.target.value }));
                    }}
                    className="min-h-9 flex-1 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm outline-none transition-all duration-200 focus:border-brand-yellow/60 focus:ring-4 focus:ring-brand-yellow/10 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:backdrop-blur-md"
                  />
                  <button
                    disabled={updateReminder.isPending}
                    onClick={() => handleSaveReminder(meal)}
                    className="shrink-0 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:hover:bg-white/[0.12]"
                  >
                    ذخیره
                  </button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ProgramDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error } = useProgram(id);
  const program = response?.data;

  if (isLoading) return <EmptyState title="در حال دریافت برنامه..." />;
  if (isError) return <EmptyState title={getApiErrorMessage(error)} />;
  if (!program) return <EmptyState title="برنامه پیدا نشد" />;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">{program.title}</h1>
        <p className="text-sm text-slate-500 dark:text-white/40">{formatPersianDate(program.createdAt)}</p>
      </div>
      {program.days.map((day) => (
        <Card key={day.id} className="space-y-3">
          <h2 className="font-bold">روز {day.dayNumber}</h2>
          {day.blocks.map((block) => (
            <div key={block.id} className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.05]">
              <p className="mb-2 text-xs font-bold text-green-700 dark:text-brand-yellow">{blockLabels[block.type]}</p>
              {block.note ? <p className="mb-2 text-sm text-slate-500">{block.note}</p> : null}
              <div className="space-y-2">
                {block.items.map((item) => (
                  <button
                    key={item.id}
                    className="w-full rounded-xl bg-white p-3 text-right transition hover:bg-slate-50 dark:bg-white/[0.07] dark:hover:bg-white/[0.10]"
                    onClick={() => navigate(`/athlete/exercises/${item.exerciseId}`)}
                  >
                    <span className="block font-semibold">{item.exercise.title}</span>
                    <span className="mt-1 block text-sm text-slate-500">
                      ست: {item.sets} | تکرار: {item.reps}
                    </span>
                    {item.rest ? <span className="mt-1 block text-sm text-slate-600 dark:text-white/60">استراحت: {item.rest}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Card>
      ))}
    </section>
  );
}
