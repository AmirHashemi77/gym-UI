# اجرای لوکال فرانت‌اند

این راهنما برای اجرای رابط کاربری React و Vite در محیط توسعه است.

## پیش‌نیازها

- Node.js نسخه 20 LTS
- npm
- بک‌اند در حال اجرا روی `http://localhost:3000`

راهنمای بک‌اند در `../gym-backend/README-LOCAL.md` قرار دارد.

## راه‌اندازی اولیه

```bash
cd /Users/amirhashemi/Desktop/gym/gym-UI
npm install
```

برای اتصال به بک‌اند لوکال، فایل `.env.local` را در پوشه فرانت‌اند بسازید:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

فایل `.env.local` مخصوص محیط توسعه است و نباید commit شود.

## اجرای برنامه

```bash
npm run dev
```

سپس `http://localhost:5173` را در مرورگر باز کنید.

بدون ساخت `.env.local` نیز می‌توانید برنامه را این‌طور اجرا کنید:

```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1 npm run dev
```

## ورود آزمایشی

```text
شماره موبایل: 09122222222
رمز عبور: Password123!
```

## بررسی اتصال به بک‌اند

قبل از اجرای فرانت، `http://localhost:3000/api/v1/health` باید پاسخ موفق بدهد.

اگر درخواست‌ها خطای شبکه یا `404` داشتند، در DevTools مرورگر بررسی کنید که مقصد آن‌ها با آدرس زیر شروع شود:

```text
http://localhost:3000/api/v1
```

پس از تغییر `.env.local`، سرور Vite را متوقف و دوباره اجرا کنید.

## بررسی build

```bash
npm run build
```

خروجی build در پوشه `dist` قرار می‌گیرد.

