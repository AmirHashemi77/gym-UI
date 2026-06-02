import { Bookmark, BookmarkCheck, ChevronLeft, MessageCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/http';
import { Button, Card, EmptyState, SearchBox, Textarea } from '../components/ui';
import { useAuth } from '../features/auth';
import { useBookmarkExercise, useExercise, useExercises, useUnbookmarkExercise } from '../hooks/exercises';
import { useProgram, usePrograms } from '../hooks/programs';
import { useCreateQuestion, useQuestions } from '../hooks/questions';
import { formatPersianDate } from '../utils/date';
import { truncateText } from '../utils/text';

const blockLabels = {
  NORMAL: 'معمولی',
  SUPERSET: 'سوپرست',
  TRISET: 'تری ست',
};

export function ExerciseSearchPage() {
  const [search, setSearch] = useState('');
  const { data: response, isLoading, isError, error } = useExercises({ search });
  const exercises = response?.data.items ?? [];

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">جستجوی حرکات</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">حرکت را پیدا کنید و آموزش آن را ببینید.</p>
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
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {truncateText(exercise.description, 120) || 'توضیحاتی ثبت نشده است.'}
                  </p>
                </div>
                <ChevronLeft className="h-5 w-5 text-slate-400" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ExerciseDetailPage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const { data: response, isLoading, isError, error } = useExercise(id);
  const createQuestion = useCreateQuestion();
  const bookmarkExercise = useBookmarkExercise();
  const unbookmarkExercise = useUnbookmarkExercise();
  const [question, setQuestion] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const exercise = response?.data;

  const handleQuestionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) return;

    createQuestion.mutate(
      { exerciseId: exercise?.id, question },
      {
        onSuccess: () => setQuestion(''),
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

  return (
    <section className="space-y-4">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">{exercise.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{exercise.slug}</p>
          </div>
          {user?.role === 'STUDENT' ? (
            <Button
              variant="secondary"
              className="h-11 w-11 px-0"
              disabled={bookmarkExercise.isPending || unbookmarkExercise.isPending}
              onClick={handleBookmark}
            >
              {bookmarked ? <BookmarkCheck className="h-5 w-5 text-teal-700" /> : <Bookmark className="h-5 w-5" />}
            </Button>
          ) : null}
        </div>
        {exercise.videoUrl ? (
          <video className="aspect-video w-full rounded-lg bg-slate-950 object-cover" src={exercise.videoUrl} controls poster={exercise.thumbnailUrl ?? undefined} />
        ) : null}
        {exercise.description ? <p className="leading-8 text-slate-700 dark:text-slate-200">{exercise.description}</p> : null}
      </Card>

      {user?.role === 'STUDENT' ? (
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 font-bold">
            <MessageCircle className="h-5 w-5 text-teal-700" />
            ثبت سوال درباره این حرکت
          </h2>
          <form className="space-y-3" onSubmit={handleQuestionSubmit}>
            <Textarea rows={4} placeholder="سوال خود را بنویسید" value={question} onChange={(event) => setQuestion(event.target.value)} />
            {createQuestion.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(createQuestion.error)}</p> : null}
            {createQuestion.data?.message ? <p className="text-sm text-emerald-600">{createQuestion.data.message}</p> : null}
            <Button disabled={!question.trim() || createQuestion.isPending}>
              {createQuestion.isPending ? 'در حال ثبت...' : 'ثبت سوال'}
            </Button>
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
            <h2 className="font-bold">{item.exercise?.title ?? 'سوال عمومی'}</h2>
            <span className={`rounded-full px-3 py-1 text-xs ${item.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {item.status === 'ANSWERED' ? 'پاسخ داده شده' : 'در انتظار پاسخ'}
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{item.question}</p>
          {item.answer ? <p className="rounded-lg bg-slate-100 p-3 text-sm leading-7 dark:bg-slate-800">{item.answer}</p> : null}
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
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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

export function ProgramDetailPage() {
  const { id = '' } = useParams();
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
        <p className="text-sm text-slate-500 dark:text-slate-400">{formatPersianDate(program.createdAt)}</p>
      </div>
      {program.days.map((day) => (
        <Card key={day.id} className="space-y-3">
          <h2 className="font-bold">روز {day.dayNumber}</h2>
          {day.blocks.map((block) => (
            <div key={block.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="mb-2 text-xs font-bold text-teal-700 dark:text-teal-300">{blockLabels[block.type]}</p>
              {block.note ? <p className="mb-2 text-sm text-slate-500">{block.note}</p> : null}
              <div className="space-y-2">
                {block.items.map((item) => (
                  <button
                    key={item.id}
                    className="w-full rounded-lg bg-white p-3 text-right dark:bg-slate-900"
                    onClick={() => navigate(`/athlete/exercises/${item.exerciseId}`)}
                  >
                    <span className="block font-semibold">{item.exercise.title}</span>
                    <span className="mt-1 block text-sm text-slate-500">
                      ست: {item.sets} | تکرار: {item.reps}
                    </span>
                    {item.rest ? <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">استراحت: {item.rest}</span> : null}
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
