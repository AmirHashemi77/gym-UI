import { FormEvent, useState } from 'react';
import { Dumbbell, UserPlus } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/http';
import type { CreateStudentRequest, Gender } from '../api/types';
import { AuthLayout } from '../components/Layout';
import { Button, Card, Input, Textarea } from '../components/ui';
import { useAuth } from '../features/auth';
import { useLogin, useRegisterStudent } from '../hooks/auth';

type StudentRegisterForm = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  weight: string;
  height: string;
  goal: string;
  gender: Gender | '';
};

type StudentRegisterErrors = Partial<Record<keyof StudentRegisterForm, string>>;

const iranMobilePattern = /^09\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const decimalWithTwoDigitsPattern = /^\d+(\.\d{1,2})?$/;

const validateOptionalDecimal = (value: string, min: number, label: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return undefined;
  if (!decimalWithTwoDigitsPattern.test(trimmedValue)) return `${label} باید عددی با حداکثر 2 رقم اعشار باشد.`;

  const numericValue = Number(trimmedValue);

  if (!Number.isFinite(numericValue)) return `${label} باید عدد معتبر باشد.`;
  if (numericValue < min) return `${label} باید حداقل ${min} باشد.`;

  return undefined;
};

const validateStudentRegisterForm = (form: StudentRegisterForm) => {
  const errors: StudentRegisterErrors = {};

  if (typeof form.fullName !== 'string' || !form.fullName.trim()) {
    errors.fullName = 'نام کامل الزامی است و نباید خالی باشد.';
  }

  if (!form.phone.trim()) {
    errors.phone = 'شماره موبایل الزامی است.';
  } else if (!iranMobilePattern.test(form.phone.trim())) {
    errors.phone = 'شماره موبایل باید با فرمت معتبر ایران باشد. مثال: 09123334455';
  }

  if (form.email.trim() && !emailPattern.test(form.email.trim())) {
    errors.email = 'ایمیل واردشده معتبر نیست.';
  }

  if (!form.password) {
    errors.password = 'رمز عبور الزامی است.';
  } else if (form.password.length < 8) {
    errors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'تکرار رمز عبور الزامی است.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'تکرار رمز عبور با رمز عبور یکسان نیست.';
  }

  if (form.age.trim()) {
    const age = Number(form.age.trim());

    if (!/^\d+$/.test(form.age.trim()) || !Number.isInteger(age)) {
      errors.age = 'سن باید عدد صحیح باشد.';
    } else if (age < 5 || age > 100) {
      errors.age = 'سن باید بین 5 تا 100 باشد.';
    }
  }

  const weightError = validateOptionalDecimal(form.weight, 20, 'وزن');
  if (weightError) errors.weight = weightError;

  const heightError = validateOptionalDecimal(form.height, 50, 'قد');
  if (heightError) errors.height = heightError;

  if (typeof form.goal !== 'string') {
    errors.goal = 'هدف تمرینی باید متن باشد.';
  }

  return errors;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-300">{message}</p>;
}

export function LandingPage() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'STUDENT' ? '/athlete' : '/coach/athletes'} replace />;
  }

  return (
    <AuthLayout>
      <Card className="space-y-5">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-yellow shadow-glow-sm">
              <Dumbbell className="h-6 w-6 text-surface-dark" />
            </span>
            <div>
              <h1 className="text-xl font-black">Bahman Coach</h1>
              <p className="text-sm text-slate-500 dark:text-white/40">مدیریت تمرین، ورزشکار و پرسش ها</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          <Link to="/login">
            <Button className="w-full">ورود ورزشکار</Button>
          </Link>
          <Link to="/coach-login">
            <Button variant="secondary" className="w-full">
              ورود مربی / ادمین
            </Button>
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}

export function LoginPage({ mode }: { mode: 'student' | 'staff' }) {
  const login = useLogin();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const isStaff = mode === 'staff';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    login.mutate(
      { phone, password },
      {
        onSuccess: (response) => {
          const user = response.data.user;
          navigate(user.role === 'STUDENT' ? '/athlete' : '/coach/athletes', { replace: true });
        },
      },
    );
  };

  return (
    <AuthLayout>
      <Card className="space-y-5">
        <div>
          <div>
            <h1 className="text-2xl font-black">{isStaff ? 'ورود مربی / ادمین' : 'ورود ورزشکار'}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/40">شماره موبایل و رمز عبور خود را وارد کنید.</p>
          </div>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            placeholder="شماره موبایل"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
          <Input
            placeholder="رمز عبور"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {login.isError ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {getApiErrorMessage(login.error)}
            </p>
          ) : null}
          {login.data?.message ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {login.data.message}
            </p>
          ) : null}
          <Button className="w-full" disabled={login.isPending || !phone.trim() || !password.trim()}>
            {login.isPending ? 'در حال ورود...' : 'ورود'}
          </Button>
        </form>
        {!isStaff ? (
          <div className="border-t border-slate-100 pt-4 text-center text-sm dark:border-white/10">
            <span className="text-slate-500 dark:text-white/40">هنوز حساب ورزشکاری ندارید؟ </span>
            <Link className="font-bold text-green-700 dark:text-brand-yellow" to="/register">
              ثبت نام شاگرد
            </Link>
          </div>
        ) : null}
      </Card>
    </AuthLayout>
  );
}

export function StudentRegisterPage() {
  const { user, isAuthenticated } = useAuth();
  const registerStudent = useRegisterStudent();
  const navigate = useNavigate();
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [form, setForm] = useState<StudentRegisterForm>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    weight: '',
    height: '',
    goal: '',
    gender: '',
  });

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'STUDENT' ? '/athlete' : '/coach/athletes'} replace />;
  }

  const validationErrors = validateStudentRegisterForm(form);
  const visibleErrors = showValidationErrors ? validationErrors : {};

  const toOptionalNumber = (value: string) => (value.trim() ? Number(value) : undefined);
  const toOptionalString = (value: string) => (value.trim() ? value.trim() : undefined);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowValidationErrors(true);

    if (Object.keys(validationErrors).length > 0) return;

    const payload: CreateStudentRequest = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: toOptionalString(form.email),
      password: form.password,
      age: toOptionalNumber(form.age),
      weight: toOptionalNumber(form.weight),
      height: toOptionalNumber(form.height),
      goal: toOptionalString(form.goal),
      gender: form.gender || undefined,
    };

    registerStudent.mutate(payload, {
      onSuccess: () => navigate('/login', { replace: true }),
    });
  };

  return (
    <AuthLayout size="wide">
      <Card className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-yellow shadow-glow-sm">
              <UserPlus className="h-6 w-6 text-surface-dark" />
            </span>
            <div>
              <h1 className="text-2xl font-black">ثبت نام شاگرد</h1>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-white/40">
                اطلاعات اولیه خود را وارد کنید تا حساب ورزشکاری شما ساخته شود.
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                placeholder="نام کامل"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                aria-invalid={Boolean(visibleErrors.fullName)}
              />
              <FieldError message={visibleErrors.fullName} />
            </div>
            <div>
              <Input
                placeholder="شماره موبایل"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                aria-invalid={Boolean(visibleErrors.phone)}
              />
              <FieldError message={visibleErrors.phone} />
            </div>
          </div>
          <div>
            <Input
              placeholder="ایمیل اختیاری"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              aria-invalid={Boolean(visibleErrors.email)}
            />
            <FieldError message={visibleErrors.email} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                placeholder="رمز عبور"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                aria-invalid={Boolean(visibleErrors.password)}
              />
              <FieldError message={visibleErrors.password} />
            </div>
            <div>
              <Input
                placeholder="تکرار رمز عبور"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                aria-invalid={Boolean(visibleErrors.confirmPassword)}
              />
              <FieldError message={visibleErrors.confirmPassword} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Input
                placeholder="سن"
                inputMode="numeric"
                value={form.age}
                onChange={(event) => setForm({ ...form, age: event.target.value })}
                aria-invalid={Boolean(visibleErrors.age)}
              />
              <FieldError message={visibleErrors.age} />
            </div>
            <div>
              <Input
                placeholder="وزن"
                inputMode="decimal"
                value={form.weight}
                onChange={(event) => setForm({ ...form, weight: event.target.value })}
                aria-invalid={Boolean(visibleErrors.weight)}
              />
              <FieldError message={visibleErrors.weight} />
            </div>
            <div>
              <Input
                placeholder="قد"
                inputMode="decimal"
                value={form.height}
                onChange={(event) => setForm({ ...form, height: event.target.value })}
                aria-invalid={Boolean(visibleErrors.height)}
              />
              <FieldError message={visibleErrors.height} />
            </div>
          </div>
          {/* Gender */}
          <div className="flex gap-3">
            {(['MALE', 'FEMALE'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm({ ...form, gender: g })}
                className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl border py-3 text-sm font-semibold transition-all duration-200 ${
                  form.gender === g
                    ? 'border-surface-dark bg-surface-dark text-white dark:border-brand-yellow dark:bg-brand-yellow dark:text-surface-dark'
                    : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/[0.09]'
                }`}
              >
                <img
                  src={g === 'MALE' ? '/images/men.png' : '/images/women.png'}
                  alt={g === 'MALE' ? 'مرد' : 'زن'}
                  className="h-7 w-7 rounded-full object-cover"
                />
                {g === 'MALE' ? 'مرد' : 'زن'}
              </button>
            ))}
          </div>

          <div>
            <Textarea
              rows={3}
              placeholder="هدف تمرینی"
              value={form.goal}
              onChange={(event) => setForm({ ...form, goal: event.target.value })}
              aria-invalid={Boolean(visibleErrors.goal)}
            />
            <FieldError message={visibleErrors.goal} />
          </div>
          {registerStudent.isError ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {getApiErrorMessage(registerStudent.error)}
            </p>
          ) : null}
          {registerStudent.data?.message ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {registerStudent.data.message}
            </p>
          ) : null}
          <Button className="w-full" disabled={registerStudent.isPending}>
            {registerStudent.isPending ? 'در حال ثبت نام...' : 'ثبت نام شاگرد'}
          </Button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-sm dark:border-white/10">
          <span className="text-slate-500 dark:text-white/40">قبلا ثبت نام کرده اید؟ </span>
          <Link className="font-bold text-green-700 dark:text-brand-yellow" to="/login">
            ورود ورزشکار
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
