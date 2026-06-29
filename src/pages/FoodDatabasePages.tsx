import {
  Apple, Beef, BookOpen, ChevronLeft, ChevronRight, CircleDot, Coffee,
  Cookie, Droplets, Egg, Feather, Fish, FlaskConical,
  Layers, Leaf, Nut, ShieldCheck, Wheat, TreePine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Food, FoodCategory } from '../api/types';
import { EmptyState, SearchBox } from '../components/ui';
import { useFoodCategories, useFoodsByCategory, useFood } from '../hooks/foods';

// ─── Category Styles ──────────────────────────────────────────────────────────

type CategoryStyle = {
  gradient: string;
  iconBg: string;
  icon: LucideIcon;
  ring: string;
  calBadge: string;
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'grains-and-starches': {
    gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/25 dark:to-orange-900/15',
    iconBg: 'bg-amber-500',
    icon: Wheat,
    ring: 'ring-amber-200 dark:ring-amber-700/40',
    calBadge: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  },
  breads: {
    gradient: 'from-yellow-50 to-amber-50 dark:from-yellow-900/25 dark:to-amber-900/15',
    iconBg: 'bg-yellow-500',
    icon: Layers,
    ring: 'ring-yellow-200 dark:ring-yellow-700/40',
    calBadge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-300',
  },
  legumes: {
    gradient: 'from-green-50 to-emerald-50 dark:from-green-900/25 dark:to-emerald-900/15',
    iconBg: 'bg-green-500',
    icon: CircleDot,
    ring: 'ring-green-200 dark:ring-green-700/40',
    calBadge: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
  },
  meats: {
    gradient: 'from-red-50 to-rose-50 dark:from-red-900/25 dark:to-rose-900/15',
    iconBg: 'bg-red-500',
    icon: Beef,
    ring: 'ring-red-200 dark:ring-red-700/40',
    calBadge: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
  },
  poultry: {
    gradient: 'from-orange-50 to-amber-50 dark:from-orange-900/25 dark:to-amber-900/15',
    iconBg: 'bg-orange-500',
    icon: Feather,
    ring: 'ring-orange-200 dark:ring-orange-700/40',
    calBadge: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
  },
  'eggs-and-dairy': {
    gradient: 'from-sky-50 to-blue-50 dark:from-sky-900/25 dark:to-blue-900/15',
    iconBg: 'bg-sky-500',
    icon: Egg,
    ring: 'ring-sky-200 dark:ring-sky-700/40',
    calBadge: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
  },
  'fish-and-seafood': {
    gradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/25 dark:to-cyan-900/15',
    iconBg: 'bg-blue-500',
    icon: Fish,
    ring: 'ring-blue-200 dark:ring-blue-700/40',
    calBadge: 'bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300',
  },
  'oils-and-fats': {
    gradient: 'from-lime-50 to-yellow-50 dark:from-lime-900/25 dark:to-yellow-900/15',
    iconBg: 'bg-lime-500',
    icon: Droplets,
    ring: 'ring-lime-200 dark:ring-lime-700/40',
    calBadge: 'bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-300',
  },
  fruits: {
    gradient: 'from-pink-50 to-rose-50 dark:from-pink-900/25 dark:to-rose-900/15',
    iconBg: 'bg-pink-500',
    icon: Apple,
    ring: 'ring-pink-200 dark:ring-pink-700/40',
    calBadge: 'bg-pink-100 text-pink-700 dark:bg-pink-400/15 dark:text-pink-300',
  },
  vegetables: {
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/25 dark:to-teal-900/15',
    iconBg: 'bg-emerald-500',
    icon: Leaf,
    ring: 'ring-emerald-200 dark:ring-emerald-700/40',
    calBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  },
  'nuts-and-dried-fruits': {
    gradient: 'from-amber-50 to-yellow-50 dark:from-amber-900/25 dark:to-yellow-900/15',
    iconBg: 'bg-amber-700',
    icon: Nut,
    ring: 'ring-amber-300 dark:ring-amber-600/40',
    calBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300',
  },
  'sugars-and-sweeteners': {
    gradient: 'from-purple-50 to-violet-50 dark:from-purple-900/25 dark:to-violet-900/15',
    iconBg: 'bg-purple-500',
    icon: Cookie,
    ring: 'ring-purple-200 dark:ring-purple-700/40',
    calBadge: 'bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300',
  },
  'seasonings-and-spices': {
    gradient: 'from-rose-50 to-orange-50 dark:from-rose-900/25 dark:to-orange-900/15',
    iconBg: 'bg-rose-500',
    icon: FlaskConical,
    ring: 'ring-rose-200 dark:ring-rose-700/40',
    calBadge: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300',
  },
  beverages: {
    gradient: 'from-cyan-50 to-teal-50 dark:from-cyan-900/25 dark:to-teal-900/15',
    iconBg: 'bg-cyan-500',
    icon: Coffee,
    ring: 'ring-cyan-200 dark:ring-cyan-700/40',
    calBadge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300',
  },
};

const fallbackStyle: CategoryStyle = {
  gradient: 'from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-700/20',
  iconBg: 'bg-slate-500',
  icon: BookOpen,
  ring: 'ring-slate-200 dark:ring-slate-600/40',
  calBadge: 'bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300',
};

const getCategoryStyle = (categoryId: string): CategoryStyle =>
  CATEGORY_STYLES[categoryId] ?? fallbackStyle;

// ─── Nutrition Bar ────────────────────────────────────────────────────────────

function NutrientBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 dark:text-white/60">{label}</span>
        <span className="tabular-nums font-bold text-slate-800 dark:text-white">{value} گرم</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
}

// ─── Food Categories Page ─────────────────────────────────────────────────────

export function FoodCategoriesPage() {
  const { data, isLoading } = useFoodCategories();
  const categories = data?.data ?? [];
  const navigate = useNavigate();

  return (
    <section className="space-y-5 pb-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-black">بانک غذایی</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-white/40">
          اطلاعات و ارزش غذایی مواد غذایی رایج
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/[0.07]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const style = getCategoryStyle(cat.categoryId);
            const Icon = style.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/athlete/foods/${cat.categoryId}`)}
                  className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-right ring-1 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${style.gradient} ${style.ring}`}
                >
                  <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${style.iconBg} shadow-sm`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-800 dark:text-white">
                    {cat.name}
                  </p>
                  <ChevronLeft className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/30" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Food List Page ───────────────────────────────────────────────────────────

export function FoodListPage() {
  const { categoryId = '' } = useParams<{ categoryId: string }>();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useFoodsByCategory(categoryId);
  const { data: categoriesData } = useFoodCategories();
  const navigate = useNavigate();

  const style = getCategoryStyle(categoryId);
  const Icon = style.icon;
  const allFoods = data?.data ?? [];

  // نام دسته‌بندی را از cache دسته‌بندی‌ها پیدا می‌کنیم
  const categoryName =
    categoriesData?.data.find((c) => c.categoryId === categoryId)?.name ?? '';

  const foods = search.trim()
    ? allFoods.filter(
        (f) =>
          f.name.includes(search) ||
          f.nameEn.toLowerCase().includes(search.toLowerCase()),
      )
    : allFoods;

  return (
    <section className="space-y-4 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`-mx-4 -mt-5 overflow-hidden rounded-b-3xl bg-gradient-to-br px-4 pb-5 pt-5 sm:-mx-0 sm:mt-0 sm:rounded-2xl ${style.gradient}`}
      >
        <button
          type="button"
          onClick={() => navigate('/athlete/foods')}
          className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-white/50 dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
          بانک غذایی
        </button>
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${style.iconBg} shadow-md`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">{categoryName}</h1>
            <p className="text-sm text-slate-500 dark:text-white/40">{allFoods.length} ماده غذایی</p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <SearchBox
        placeholder="جستجوی ماده غذایی..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <EmptyState title="در حال بارگذاری..." />}
      {!isLoading && foods.length === 0 && <EmptyState title="ماده غذایی پیدا نشد" />}

      {/* Food cards */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {foods.map((food, i) => (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <FoodCard food={food} categoryId={categoryId} style={style} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FoodCard({ food, categoryId, style }: { food: Food; categoryId: string; style: CategoryStyle }) {
  return (
    <Link to={`/athlete/foods/${categoryId}/${food.id}`}>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98] dark:border-white/[0.08] dark:bg-white/[0.06] dark:hover:border-white/20">
        {/* Category icon */}
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${style.ring} bg-slate-100 dark:bg-white/[0.07]`}>
          {(() => { const Icon = style.icon; return <Icon className={`h-5 w-5 ${style.iconBg.replace('bg-', 'text-')}`} />; })()}
        </div>

        {/* Food info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{food.name}</p>
          <p className="truncate text-[11px] text-slate-400 dark:text-white/30">{food.nameEn}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <MacroPill label={`پروتئین ${food.proteinG}g`} color="bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300" />
            <MacroPill label={`کربوهیدرات ${food.carbohydrateG}g`} color="bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300" />
            <MacroPill label={`چربی ${food.fatG}g`} color="bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300" />
          </div>
        </div>

        {/* Calories */}
        <div className="shrink-0 text-left">
          <p className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{food.calories}</p>
          <p className="text-[10px] text-slate-400 dark:text-white/30">کالری</p>
        </div>

        <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300 dark:text-white/20" />
      </div>
    </Link>
  );
}

function MacroPill({ label, color }: { label: string; color: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>{label}</span>
  );
}

// ─── Food Detail Page ─────────────────────────────────────────────────────────

export function FoodDetailPage() {
  const { categoryId = '', foodId = '' } = useParams<{ categoryId: string; foodId: string }>();
  const { data, isLoading } = useFood(foodId);
  const navigate = useNavigate();

  const food = data?.data ?? null;
  const style = getCategoryStyle(categoryId);
  const Icon = style.icon;

  if (isLoading) return <EmptyState title="در حال بارگذاری..." />;
  if (!food) return <EmptyState title="ماده غذایی پیدا نشد" />;

  const totalMacros = food.proteinG + food.carbohydrateG + food.fatG;
  const categoryName = food.category?.name ?? '';

  return (
    <section className="space-y-4 pb-6">
      {/* Back */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        onClick={() => navigate(`/athlete/foods/${categoryId}`)}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-white/40 dark:hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
        {categoryName}
      </motion.button>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 ring-1 ${style.gradient} ${style.ring}`}
      >
        <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, currentColor, transparent)' }} />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${style.calBadge}`}>
              <Icon className="h-3.5 w-3.5" />
              {categoryName}
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">{food.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-white/40">{food.nameEn}</p>
            <p className="mt-2 text-xs text-slate-400 dark:text-white/30">
              به ازای {food.servingAmount} {food.servingUnit}
            </p>
          </div>

          {/* Big calorie display */}
          <div className="shrink-0 rounded-2xl bg-white/60 px-4 py-3 text-center shadow-sm ring-1 ring-white/80 backdrop-blur-sm dark:bg-white/[0.08] dark:ring-white/10">
            <p className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">{food.calories}</p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-white/40">کیلوکالری</p>
          </div>
        </div>

        {/* Quick macro pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: 'پروتئین', value: food.proteinG, color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300' },
            { label: 'کربوهیدرات', value: food.carbohydrateG, color: 'bg-amber-500/20 text-amber-700 dark:text-amber-300' },
            { label: 'چربی', value: food.fatG, color: 'bg-rose-500/20 text-rose-700 dark:text-rose-300' },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl px-3 py-1.5 text-center ${m.color}`}>
              <p className="text-base font-black tabular-nums">{m.value}g</p>
              <p className="text-[10px] font-semibold opacity-80">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Nutrition breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.06]"
      >
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 dark:bg-white/[0.08]">
            <BookOpen className="h-4 w-4 text-slate-600 dark:text-white/60" />
          </div>
          اطلاعات تغذیه‌ای
        </h2>

        <div className="space-y-3.5">
          <NutrientBar label="پروتئین" value={food.proteinG} max={Math.max(totalMacros, 1)} color="bg-blue-500" />
          <NutrientBar label="کربوهیدرات" value={food.carbohydrateG} max={Math.max(totalMacros, 1)} color="bg-amber-500" />
          <NutrientBar label="چربی" value={food.fatG} max={Math.max(totalMacros, 1)} color="bg-rose-500" />
        </div>
      </motion.div>

      {/* Secondary nutrients */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'فیبر', value: `${food.fiberG}g`, color: 'bg-emerald-50 dark:bg-emerald-400/[0.08]', textColor: 'text-emerald-700 dark:text-emerald-300' },
          { label: 'قند', value: `${food.sugarG}g`, color: 'bg-purple-50 dark:bg-purple-400/[0.08]', textColor: 'text-purple-700 dark:text-purple-300' },
          { label: 'سدیم', value: `${food.sodiumMg}mg`, color: 'bg-orange-50 dark:bg-orange-400/[0.08]', textColor: 'text-orange-700 dark:text-orange-300' },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl ${item.color} p-3 text-center`}>
            <p className={`text-lg font-black tabular-nums ${item.textColor}`}>{item.value}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-white/40">{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Macro distribution */}
      {totalMacros > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.06]"
        >
          <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-white/80">توزیع درشت‌مغذی‌ها</h2>
          <div className="flex h-3 overflow-hidden rounded-full">
            <motion.div
              className="bg-blue-500"
              style={{ width: `${(food.proteinG / totalMacros) * 100}%` }}
              initial={{ scaleX: 0, originX: 1 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="bg-amber-500"
              style={{ width: `${(food.carbohydrateG / totalMacros) * 100}%` }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="bg-rose-500"
              style={{ width: `${(food.fatG / totalMacros) * 100}%` }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {[
              { label: 'پروتئین', pct: (food.proteinG / totalMacros) * 100, color: 'bg-blue-500' },
              { label: 'کربوهیدرات', pct: (food.carbohydrateG / totalMacros) * 100, color: 'bg-amber-500' },
              { label: 'چربی', pct: (food.fatG / totalMacros) * 100, color: 'bg-rose-500' },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-1.5 text-xs">
                <div className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                <span className="font-semibold text-slate-600 dark:text-white/60">{m.label}</span>
                <span className="tabular-nums font-bold text-slate-900 dark:text-white">{m.pct.toFixed(0)}٪</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Source */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-white/[0.05] dark:bg-white/[0.04]"
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
        <p className="text-xs text-slate-500 dark:text-white/40">
          منبع: {food.source}
          {food.verified && ' · تأیید شده'}
        </p>
      </motion.div>
    </section>
  );
}

// ─── Home Food Categories Widget ──────────────────────────────────────────────

export function HomeFoodCategoriesWidget() {
  const { data } = useFoodCategories();
  const categories = (data?.data ?? []).slice(0, 8);

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
      {categories.map((cat, i) => {
        const style = getCategoryStyle(cat.categoryId);
        const Icon = style.icon;
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 + i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0"
          >
            <Link to={`/athlete/foods/${cat.categoryId}`} className="flex flex-col items-center gap-2">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ring-1 ${style.gradient} ${style.ring}`}>
                <Icon className={`h-6 w-6 ${style.iconBg.replace('bg-', 'text-')}`} />
              </div>
              <span className="max-w-[56px] text-center text-[10px] font-semibold leading-tight text-slate-600 dark:text-white/60">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
