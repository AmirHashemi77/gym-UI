import { FormEvent, useState } from 'react';
import { Dumbbell, UserPlus } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/http';
import type { CreateStudentRequest, Gender } from '../api/types';
import { AuthLayout } from '../components/Layout';
import { Button, Card, Input, PasswordInput, Textarea } from '../components/ui';
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
type RestrictedRegisterField = 'phone' | 'password' | 'confirmPassword' | 'age' | 'weight' | 'height';

const iranMobilePattern = /^09\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const decimalWithTwoDigitsPattern = /^\d+(\.\d{1,2})?$/;
const englishDigitsPattern = /^[0-9]*$/;
const englishDecimalPattern = /^[0-9.]*$/;
const englishKeyboardPattern = /^[\x20-\x7E]*$/;
const englishKeyboardHint = 'لطفاً زبان کیبورد را انگلیسی کنید.';

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

  return <p className="mt-1 text-xs font-medium text-status-error dark:text-red-300">{message}</p>;
}

function KeyboardLanguageHint({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return <p className="mt-1 text-xs font-medium text-status-warning dark:text-orange-300">{englishKeyboardHint}</p>;
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
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-brand-red-bright/40 bg-brand-red shadow-glow-sm">
              <Dumbbell className="h-6 w-6 text-brand-text-main" />
            </span>
            <div>
              <h1 className="text-xl font-black">Bahman Coach</h1>
            <p className="text-sm text-slate-500 dark:text-brand-text-muted">مدیریت تمرین، ورزشکار و پرسش ها</p>
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
  const [keyboardHintField, setKeyboardHintField] = useState<'phone' | 'password' | null>(null);
  const isStaff = mode === 'staff';

  const handleRestrictedChange = (
    field: 'phone' | 'password',
    value: string,
    pattern: RegExp,
    updateValue: (nextValue: string) => void,
  ) => {
    if (!pattern.test(value)) {
      setKeyboardHintField(field);
      return;
    }

    updateValue(value);
    setKeyboardHintField((current) => (current === field ? null : current));
  };

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
            <p className="mt-1 text-sm text-slate-500 dark:text-brand-text-muted">شماره موبایل و رمز عبور خود را وارد کنید.</p>
          </div>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <Input
              placeholder="شماره موبایل"
              inputMode="tel"
              value={phone}
              onChange={(event) => handleRestrictedChange('phone', event.target.value, englishDigitsPattern, setPhone)}
              required
            />
            <KeyboardLanguageHint visible={keyboardHintField === 'phone'} />
          </div>
          <div>
            <PasswordInput
              placeholder="رمز عبور"
              value={password}
              onChange={(event) => handleRestrictedChange('password', event.target.value, englishKeyboardPattern, setPassword)}
              required
            />
            <KeyboardLanguageHint visible={keyboardHintField === 'password'} />
          </div>
          {login.isError ? (
            <p className="rounded-lg border border-status-error/20 bg-status-error/10 px-3 py-2 text-sm text-red-800 dark:border-status-error/30 dark:bg-status-error/10 dark:text-red-300">
              {getApiErrorMessage(login.error)}
            </p>
          ) : null}
          {login.data?.message ? (
            <p className="rounded-lg border border-status-success/20 bg-status-success/10 px-3 py-2 text-sm text-green-800 dark:border-status-success/30 dark:bg-status-success/10 dark:text-green-300">
              {login.data.message}
            </p>
          ) : null}
          <Button className="w-full" disabled={login.isPending || !phone.trim() || !password.trim()}>
            {login.isPending ? 'در حال ورود...' : 'ورود'}
          </Button>
        </form>
        {!isStaff ? (
          <div className="border-t border-stone-300 pt-4 text-center text-sm dark:border-brand-border">
            <span className="text-slate-500 dark:text-brand-text-muted">هنوز حساب ورزشکاری ندارید؟ </span>
            <Link className="font-bold text-brand-red-strong dark:text-brand-red-text" to="/register">
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
  const [keyboardHintField, setKeyboardHintField] = useState<RestrictedRegisterField | null>(null);
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

  const handleRestrictedChange = (field: RestrictedRegisterField, value: string, pattern: RegExp) => {
    if (!pattern.test(value)) {
      setKeyboardHintField(field);
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
    setKeyboardHintField((current) => (current === field ? null : current));
  };

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
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-brand-red-bright/40 bg-brand-red shadow-glow-sm">
              <UserPlus className="h-6 w-6 text-brand-text-main" />
            </span>
            <div>
              <h1 className="text-2xl font-black">ثبت نام شاگرد</h1>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-brand-text-muted">
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
                onChange={(event) => handleRestrictedChange('phone', event.target.value, englishDigitsPattern)}
                aria-invalid={Boolean(visibleErrors.phone)}
              />
              <KeyboardLanguageHint visible={keyboardHintField === 'phone'} />
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
              <PasswordInput
                placeholder="رمز عبور"
                value={form.password}
                onChange={(event) => handleRestrictedChange('password', event.target.value, englishKeyboardPattern)}
                aria-invalid={Boolean(visibleErrors.password)}
              />
              <KeyboardLanguageHint visible={keyboardHintField === 'password'} />
              <FieldError message={visibleErrors.password} />
            </div>
            <div>
              <PasswordInput
                placeholder="تکرار رمز عبور"
                value={form.confirmPassword}
                onChange={(event) => handleRestrictedChange('confirmPassword', event.target.value, englishKeyboardPattern)}
                aria-invalid={Boolean(visibleErrors.confirmPassword)}
              />
              <KeyboardLanguageHint visible={keyboardHintField === 'confirmPassword'} />
              <FieldError message={visibleErrors.confirmPassword} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Input
                placeholder="سن"
                inputMode="numeric"
                value={form.age}
                onChange={(event) => handleRestrictedChange('age', event.target.value, englishDigitsPattern)}
                aria-invalid={Boolean(visibleErrors.age)}
              />
              <KeyboardLanguageHint visible={keyboardHintField === 'age'} />
              <FieldError message={visibleErrors.age} />
            </div>
            <div>
              <Input
                placeholder="وزن"
                inputMode="decimal"
                value={form.weight}
                onChange={(event) => handleRestrictedChange('weight', event.target.value, englishDecimalPattern)}
                aria-invalid={Boolean(visibleErrors.weight)}
              />
              <KeyboardLanguageHint visible={keyboardHintField === 'weight'} />
              <FieldError message={visibleErrors.weight} />
            </div>
            <div>
              <Input
                placeholder="قد"
                inputMode="decimal"
                value={form.height}
                onChange={(event) => handleRestrictedChange('height', event.target.value, englishDecimalPattern)}
                aria-invalid={Boolean(visibleErrors.height)}
              />
              <KeyboardLanguageHint visible={keyboardHintField === 'height'} />
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
                    ? 'border-brand-red bg-brand-red text-white dark:border-brand-red-bright dark:bg-brand-red dark:text-brand-text-main'
                    : 'border-stone-300 bg-stone-50/80 text-slate-600 hover:border-brand-red/40 dark:border-brand-border dark:bg-brand-surface dark:text-brand-text-soft dark:hover:border-brand-red/40 dark:hover:bg-brand-carbon'
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
            <p className="rounded-lg border border-status-error/20 bg-status-error/10 px-3 py-2 text-sm text-red-800 dark:border-status-error/30 dark:bg-status-error/10 dark:text-red-300">
              {getApiErrorMessage(registerStudent.error)}
            </p>
          ) : null}
          {registerStudent.data?.message ? (
            <p className="rounded-lg border border-status-success/20 bg-status-success/10 px-3 py-2 text-sm text-green-800 dark:border-status-success/30 dark:bg-status-success/10 dark:text-green-300">
              {registerStudent.data.message}
            </p>
          ) : null}
          <Button className="w-full" disabled={registerStudent.isPending}>
            {registerStudent.isPending ? 'در حال ثبت نام...' : 'ثبت نام شاگرد'}
          </Button>
        </form>

        <div className="border-t border-stone-300 pt-4 text-center text-sm dark:border-brand-border">
          <span className="text-slate-500 dark:text-brand-text-muted">قبلا ثبت نام کرده اید؟ </span>
          <Link className="font-bold text-brand-red-strong dark:text-brand-red-text" to="/login">
            ورود ورزشکار
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
