# راهنمای Deploy فرانت و Nginx روی Ubuntu

فرانت React/Vite در یک build چندمرحله‌ای ساخته می‌شود و خروجی static آن داخل image رسمی Nginx قرار می‌گیرد. در production:

- Nginx داخل container روی پورت `80` اجرا می‌شود.
- routeهای React با fallback به `index.html` کار می‌کنند.
- درخواست‌های `/api/` و `/uploads/` از Nginx به سرویس Docker با نام `backend:3000` proxy می‌شوند.
- آدرس API داخل build فرانت `/api/v1` است؛ بنابراین browser مستقیماً به پورت 3000 وابسته نیست.
- image روی سیستم توسعه ساخته می‌شود و سورس روی سرور کپی نمی‌شود.

فایل‌های مرتبط:

- `gym-UI/Dockerfile`: build فرانت و image نهایی Nginx
- `gym-UI/nginx.conf`: static hosting و reverse proxy
- `docker-compose.server.yml`: اجرای production روی سرور
- `.env`: تنظیمات runtime سرور و tag مشترک release

## ۱. بررسی build فرانت روی سیستم توسعه

روی Mac و در ریشه repository:

```bash
cd /Users/amirhashemi/Desktop/gym
npm --prefix gym-UI ci
npm --prefix gym-UI run build
test -f gym-UI/dist/index.html && echo "Frontend build is valid"
```

هشدار بزرگ بودن JavaScript chunk مانع deploy نیست؛ build زمانی ناموفق است که command با error تمام شود.

## ۲. متغیرهای build فرانت

متغیرهای Vite هنگام build داخل assetها قرار می‌گیرند، نه هنگام اجرای container:

```text
VITE_API_BASE_URL=/api/v1
VITE_VAPID_PUBLIC_KEY=<public-key-if-used>
```

مقدار `VITE_API_BASE_URL` باید `/api/v1` باقی بماند تا درخواست‌ها از Nginx همین سایت عبور کنند. هیچ secret مانند `JWT_*`، `POSTGRES_PASSWORD` یا `VAPID_PRIVATE_KEY` نباید به عنوان build argument فرانت استفاده شود.

## ۳. ساخت Docker image فرانت

نسخه بدون Web Push:

```bash
cd /Users/amirhashemi/Desktop/gym
docker buildx build \
  --platform linux/amd64 \
  --load \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  -t bahman-fitness-frontend:1.0.0 \
  ./gym-UI
```

نسخه دارای Web Push:

```bash
docker buildx build \
  --platform linux/amd64 \
  --load \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  --build-arg VITE_VAPID_PUBLIC_KEY="YOUR_PUBLIC_VAPID_KEY" \
  -t bahman-fitness-frontend:1.0.0 \
  ./gym-UI
```

بررسی image:

```bash
docker image ls bahman-fitness-frontend:1.0.0
docker run --rm \
  --entrypoint sh \
  bahman-fitness-frontend:1.0.0 \
  -c 'test -f /usr/share/nginx/html/index.html && nginx -t'
```

تست محلی اختیاری؛ پورت `8080` سیستم توسعه به پورت 80 container متصل می‌شود:

```bash
docker run --rm -d \
  --name bahman-frontend-test \
  -p 8080:80 \
  bahman-fitness-frontend:1.0.0
curl -I http://127.0.0.1:8080
docker rm -f bahman-frontend-test
```

در این تست محلی proxy API کار نمی‌کند، مگر container بک‌اند در همان شبکه و با نام `backend` وجود داشته باشد. هدف تست فقط بررسی static frontend/Nginx است.

## ۴. تبدیل image به archive

برای انتقال بدون Registry:

```bash
docker save bahman-fitness-frontend:1.0.0 \
  | gzip > bahman-fitness-frontend-1.0.0.tar.gz
ls -lh bahman-fitness-frontend-1.0.0.tar.gz
```

از `docker save` استفاده کنید، نه `docker export`.

## ۵. انتقال image به سرور

```bash
ssh ubuntu@185.226.116.18 "mkdir -p /home/ubuntu/bahman-fitness"
scp \
  /Users/amirhashemi/Desktop/gym/bahman-fitness-frontend-1.0.0.tar.gz \
  ubuntu@185.226.116.18:/home/ubuntu/bahman-fitness/
```

در deploy اولیه، Compose و env example را هم منتقل کنید:

```bash
scp \
  /Users/amirhashemi/Desktop/gym/docker-compose.server.yml \
  /Users/amirhashemi/Desktop/gym/.env.example \
  ubuntu@185.226.116.18:/home/ubuntu/bahman-fitness/
```

اگر مقصد permission نداشت:

```bash
ssh ubuntu@185.226.116.18
sudo chown -R ubuntu:ubuntu /home/ubuntu/bahman-fitness
exit
```

## ۶. load و اجرای فرانت روی سرور

```bash
ssh ubuntu@185.226.116.18
cd /home/ubuntu/bahman-fitness
docker load -i bahman-fitness-frontend-1.0.0.tar.gz
docker image ls | grep bahman-fitness-frontend
```

فایل `.env` باید وجود داشته و tag آن با image یکی باشد:

```bash
grep '^IMAGE_TAG=' .env
```

خروجی مورد انتظار:

```text
IMAGE_TAG=1.0.0
```

بک‌اند باید ابتدا healthy باشد، چون فرانت در Compose به سلامت آن وابسته است:

```bash
docker compose -f docker-compose.server.yml ps
curl http://127.0.0.1:3000/api/v1/health
```

اجرای فرانت:

```bash
docker compose -f docker-compose.server.yml up -d frontend
sleep 10
docker compose -f docker-compose.server.yml ps
```

وضعیت مطلوب:

```text
frontend   Up ... (healthy)
backend    Up ... (healthy)
postgres   Up ... (healthy)
```

## ۷. بررسی Nginx و سایت

روی سرور:

```bash
curl -I http://127.0.0.1/
curl http://127.0.0.1/api/v1/health
docker compose -f docker-compose.server.yml logs frontend --tail=100
```

در browser:

```text
http://185.226.116.18
```

بررسی proxy آپلودها، با جایگزین کردن یک مسیر واقعی:

```bash
curl -I http://127.0.0.1/uploads/EXAMPLE_FILE
```

## ۸. firewall پورت 80

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
sudo ufw status
```

برای معماری فعلی، browser از پورت 80 به API متصل می‌شود؛ بنابراین پورت 3000 لازم نیست در firewall عمومی باز باشد.

## ۹. انتشار نسخه جدید فرانت

مثال برای نسخه `1.0.1`:

```bash
cd /Users/amirhashemi/Desktop/gym
docker buildx build \
  --platform linux/amd64 \
  --load \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  -t bahman-fitness-frontend:1.0.1 \
  ./gym-UI
docker save bahman-fitness-frontend:1.0.1 \
  | gzip > bahman-fitness-frontend-1.0.1.tar.gz
scp bahman-fitness-frontend-1.0.1.tar.gz \
  ubuntu@185.226.116.18:/home/ubuntu/bahman-fitness/
```

روی سرور:

```bash
cd /home/ubuntu/bahman-fitness
docker load -i bahman-fitness-frontend-1.0.1.tar.gz
nano .env
```

مقدار زیر را قرار دهید:

```env
IMAGE_TAG=1.0.1
```

Compose از tag مشترک برای فرانت و بک‌اند استفاده می‌کند. اگر بک‌اند تغییر نکرده است، قبل از تغییر `IMAGE_TAG`، image قبلی بک‌اند را با tag جدید هم ثبت کنید:

```bash
docker tag bahman-fitness-backend:1.0.0 bahman-fitness-backend:1.0.1
```

سپس فقط فرانت را recreate کنید:

```bash
docker compose -f docker-compose.server.yml up -d --force-recreate frontend
sleep 10
docker compose -f docker-compose.server.yml ps
```

اگر فرانت و بک‌اند هم‌زمان release شده‌اند، هر دو archive را load کنید و کل stack را اجرا کنید:

```bash
docker compose -f docker-compose.server.yml up -d
```

## ۱۰. cache مرورگر و Service Worker

فرانت PWA است و ممکن است browser نسخه قبلی را cache کند. بعد از deploy:

1. یک بار Hard Refresh انجام دهید.
2. در DevTools بخش Application، Service Worker و Cache Storage را بررسی کنید.
3. اگر نسخه قبلی باقی مانده، Service Worker را unregister و داده سایت را پاک کنید.

برای بررسی اینکه container واقعاً image جدید را اجرا می‌کند:

```bash
docker inspect bahman-fitness-frontend-1 \
  --format '{{.Config.Image}} {{.Image}}'
```

## ۱۱. عیب‌یابی

وضعیت و لاگ‌ها:

```bash
docker compose -f docker-compose.server.yml ps -a
docker compose -f docker-compose.server.yml logs frontend --tail=200
docker exec bahman-fitness-frontend-1 nginx -t
docker exec bahman-fitness-frontend-1 wget -qO- http://backend:3000/api/v1/health
```

اگر پورت 80 اشغال است:

```bash
sudo ss -lntp | grep ':80 '
```

اگر Nginx پاسخ می‌دهد ولی API خطای `502` دارد، ابتدا backend را بررسی کنید:

```bash
docker compose -f docker-compose.server.yml ps backend
docker compose -f docker-compose.server.yml logs backend --tail=200
```

restart فرانت:

```bash
docker compose -f docker-compose.server.yml restart frontend
```

پس از موفقیت deploy، archive قابل حذف است و image داخل Docker باقی می‌ماند:

```bash
rm bahman-fitness-frontend-1.0.0.tar.gz
```

توقف stack بدون حذف volumeهای دیتابیس و upload:

```bash
docker compose -f docker-compose.server.yml down
```

از `down -v` استفاده نکنید؛ این گزینه volumeهای persistent را حذف می‌کند.
