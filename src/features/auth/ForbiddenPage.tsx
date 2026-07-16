import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

export function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 px-4 text-brand-charcoal dark:bg-brand-black dark:text-brand-text-main">
      <Card className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-black">دسترسی غیرمجاز</h1>
        <p className="text-sm leading-7 text-slate-500 dark:text-slate-400">
          نقش کاربری شما اجازه ورود به این بخش را ندارد.
        </p>
        <Link to="/">
          <Button className="w-full">بازگشت</Button>
        </Link>
      </Card>
    </main>
  );
}
