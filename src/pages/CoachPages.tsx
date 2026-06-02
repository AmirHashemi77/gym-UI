import { Edit, Plus, Send, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../api/http';
import type {
  CreateExerciseRequest,
  CreateProgramDayRequest,
  CreateStudentRequest,
  DecimalLike,
  Exercise,
  ExerciseBlockType,
  Student,
  UpdateStudentRequest,
} from '../api/types';
import { ExercisePicker } from '../components/ExercisePicker';
import { Button, Card, EmptyState, Input, Modal, SearchBox, Select, Textarea } from '../components/ui';
import { useAuth } from '../features/auth';
import { useCreateExercise, useDeleteExercise, useExercises, useUpdateExercise } from '../hooks/exercises';
import { useSendNotification } from '../hooks/notifications';
import { useCreateProgram, usePrograms } from '../hooks/programs';
import { useAnswerQuestion, useQuestions } from '../hooks/questions';
import { useUploadVideo } from '../hooks/upload';
import { useCreateStudent, useDeleteStudent, useStudent, useStudents, useUpdateStudent } from '../hooks/users';
import { formatPersianDate } from '../utils/date';
import { truncateText } from '../utils/text';

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

export function AthletesPage() {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const { data: response, isLoading, isError, error } = useStudents({ search });
  const students = response?.data.items ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">لیست ورزشکاران</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">برای دیدن جزئیات و ساخت برنامه وارد پروفایل شوید.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-5 w-5" />
          ورزشکار جدید
        </Button>
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
              <p className="text-sm text-slate-500 dark:text-slate-400">{student.phone}</p>
              {student.studentProfile?.goal ? (
                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  {student.studentProfile.goal}
                </span>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
      {creating ? <StudentForm onClose={() => setCreating(false)} /> : null}
    </section>
  );
}

export function AthleteDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const selectedStudentId = id.trim();
  const { data: response, isLoading, isError, error } = useStudent(id);
  const { data: programsResponse } = usePrograms(selectedStudentId ? { studentId: selectedStudentId } : undefined);
  const deleteStudent = useDeleteStudent();
  const student = response?.data;
  const programs = programsResponse?.data.items ?? [];

  if (isLoading) return <EmptyState title="در حال دریافت ورزشکار..." />;
  if (isError) return <EmptyState title={getApiErrorMessage(error)} />;
  if (!student) return <EmptyState title="ورزشکار پیدا نشد" />;

  return (
    <section className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">{student.fullName}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{student.phone}</p>
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
        {deleteStudent.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(deleteStudent.error)}</p> : null}
      </Card>

      <div className="space-y-3">
        <h2 className="font-bold">برنامه های قبلی</h2>
        {programs.length === 0 ? <EmptyState title="برنامه ای ثبت نشده است" /> : null}
        {programs.map((program) => (
          <Card key={program.id}>
            <h3 className="font-bold">{program.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formatPersianDate(program.createdAt)} - {program.days.length} روز
            </p>
          </Card>
        ))}
      </div>
      {editing ? <StudentForm student={student} onClose={() => setEditing(false)} /> : null}
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
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
      <span className="block text-xs text-slate-500">{label}</span>
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
          <Input placeholder="رمز عبور" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        ) : null}
        <Input placeholder="آواتار" value={form.avatar} onChange={(event) => setForm({ ...form, avatar: event.target.value })} />
        <div className="grid gap-2 sm:grid-cols-3">
          <Input placeholder="سن" inputMode="numeric" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
          <Input placeholder="وزن" inputMode="decimal" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} />
          <Input placeholder="قد" inputMode="decimal" value={form.height} onChange={(event) => setForm({ ...form, height: event.target.value })} />
        </div>
        <Textarea rows={3} placeholder="هدف" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} />
        {mutation.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(mutation.error)}</p> : null}
        {mutation.data?.message ? <p className="text-sm text-emerald-600">{mutation.data.message}</p> : null}
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
        <p className="text-sm text-slate-500 dark:text-slate-400">{studentResponse?.data.fullName}</p>
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
        <div className="grid gap-3 sm:grid-cols-2">
          {days.map((day) => (
            <button key={day.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-right transition hover:border-teal-600 dark:border-slate-800 dark:bg-slate-900" onClick={() => setActiveDay(day)}>
              <span className="block font-bold">روز {day.dayNumber}</span>
              <span className="mt-1 block text-sm text-slate-500">{day.blocks.length} بلوک تمرینی</span>
            </button>
          ))}
        </div>
        {createProgram.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(createProgram.error)}</p> : null}
        {createProgram.data?.message ? <p className="text-sm text-emerald-600">{createProgram.data.message}</p> : null}
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
          <div key={block.id} className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
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
              <div key={index} className="grid gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900 sm:grid-cols-[1fr_90px_110px_110px]">
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
  const { data: response, isLoading, isError, error } = useExercises({ search });
  const deleteExercise = useDeleteExercise();
  const exercises = response?.data.items ?? [];
  const canManage = user?.role === 'ADMIN' || user?.role === 'COACH';

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">مدیریت حرکات</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">افزودن، ویرایش و حذف حرکات آموزشی.</p>
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
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {truncateText(exercise.description, 120) || 'توضیحاتی ثبت نشده است.'}
                </p>
              </div>
              {canManage ? (
                <div className="flex gap-2">
                  <Button variant="secondary" className="h-10 w-10 px-0" onClick={() => setEditing(exercise)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="danger" className="h-10 w-10 px-0" disabled={deleteExercise.isPending} onClick={() => deleteExercise.mutate(exercise.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
      {deleteExercise.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(deleteExercise.error)}</p> : null}
      {deleteExercise.data?.message ? <p className="text-sm text-emerald-600">{deleteExercise.data.message}</p> : null}
      {creating ? <ExerciseForm onClose={() => setCreating(false)} /> : null}
      {editing ? <ExerciseForm exercise={editing} onClose={() => setEditing(null)} /> : null}
    </section>
  );
}

function ExerciseForm({ exercise, onClose }: { exercise?: Exercise; onClose: () => void }) {
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();
  const uploadVideo = useUploadVideo();
  const [form, setForm] = useState<CreateExerciseRequest>({
    title: exercise?.title ?? '',
    description: exercise?.description ?? '',
    videoUrl: exercise?.videoUrl ?? '',
    thumbnailUrl: exercise?.thumbnailUrl ?? '',
  });
  const mutation = exercise ? updateExercise : createExercise;

  const toPayload = (): CreateExerciseRequest => ({
    title: form.title,
    description: form.description?.trim() || undefined,
    videoUrl: form.videoUrl?.trim() || undefined,
    thumbnailUrl: form.thumbnailUrl?.trim() || undefined,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (exercise) {
      updateExercise.mutate({ id: exercise.id, payload: toPayload() }, { onSuccess: onClose });
      return;
    }

    createExercise.mutate(toPayload(), { onSuccess: onClose });
  };

  const handleFileChange = (file?: File) => {
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

  return (
    <Modal title={exercise ? 'ویرایش حرکت' : 'افزودن حرکت'} onClose={onClose}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input placeholder="نام حرکت" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <Input placeholder="آدرس ویدیو" value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} />
        <Input placeholder="آدرس تصویر بندانگشتی" value={form.thumbnailUrl} onChange={(event) => setForm({ ...form, thumbnailUrl: event.target.value })} />
        <input
          className="block w-full text-sm text-slate-500 file:ml-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-3 file:text-sm file:font-bold dark:file:bg-slate-800 dark:file:text-slate-100"
          type="file"
          accept="video/*"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
        {uploadVideo.isPending ? <p className="text-sm text-slate-500">در حال آپلود ویدیو...</p> : null}
        {uploadVideo.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(uploadVideo.error)}</p> : null}
        {uploadVideo.data?.message ? <p className="text-sm text-emerald-600">{uploadVideo.data.message}</p> : null}
        <Textarea rows={4} placeholder="توضیحات حرکت" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        {mutation.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(mutation.error)}</p> : null}
        {mutation.data?.message ? <p className="text-sm text-emerald-600">{mutation.data.message}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" disabled={mutation.isPending || uploadVideo.isPending || !form.title.trim()}>
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
            <span className={`rounded-full px-3 py-1 text-xs ${question.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {question.status === 'ANSWERED' ? 'پاسخ داده شده' : 'در انتظار پاسخ'}
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{question.question}</p>
          {question.answer ? <p className="rounded-lg bg-slate-100 p-3 text-sm leading-7 dark:bg-slate-800">{question.answer}</p> : null}
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
      {answerQuestion.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(answerQuestion.error)}</p> : null}
      {answerQuestion.data?.message ? <p className="text-sm text-emerald-600">{answerQuestion.data.message}</p> : null}
      <Button disabled={answerQuestion.isPending || !answer.trim()}>
        <Send className="h-4 w-4" />
        {answerQuestion.isPending ? 'در حال ارسال...' : 'ارسال پاسخ'}
      </Button>
    </form>
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
        <p className="text-sm text-slate-500 dark:text-slate-400">payload برای push، sms و email آماده ارسال است.</p>
      </div>
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input placeholder="شناسه کاربر (اختیاری)" value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} />
          <Input placeholder="عنوان" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <Textarea rows={4} placeholder="متن پیام" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} required />
          {sendNotification.isError ? <p className="text-sm text-rose-600">{getApiErrorMessage(sendNotification.error)}</p> : null}
          {sendNotification.data?.message ? <p className="text-sm text-emerald-600">{sendNotification.data.message}</p> : null}
          <Button disabled={sendNotification.isPending || !form.title.trim() || !form.body.trim()}>
            <Send className="h-4 w-4" />
            {sendNotification.isPending ? 'در حال ارسال...' : 'ارسال'}
          </Button>
        </form>
      </Card>
    </section>
  );
}
