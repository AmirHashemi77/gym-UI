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

type CategoryTone = Omit<CategoryStyle, 'icon'>;

const FOOD_CATEGORY_TONES: Record<'crimson' | 'burgundy' | 'ember' | 'amber' | 'forest' | 'ocean' | 'teal' | 'violet', CategoryTone> = {
  crimson: {
    gradient: 'from-red-700 to-red-950 dark:from-brand-red-strong dark:to-red-950',
    iconBg: 'bg-brand-red',
    ring: 'ring-red-500/50 dark:ring-brand-red/70',
    calBadge: 'bg-brand-red/15 text-brand-red-strong dark:bg-brand-red/25 dark:text-brand-red-text',
  },
  burgundy: {
    gradient: 'from-rose-800 to-brand-metallic dark:from-rose-950 dark:to-brand-metallic',
    iconBg: 'bg-brand-metallic',
    ring: 'ring-rose-500/40 dark:ring-rose-700/60',
    calBadge: 'bg-brand-metallic/15 text-brand-metallic dark:bg-brand-metallic/35 dark:text-red-300',
  },
  ember: {
    gradient: 'from-orange-700 to-red-950 dark:from-orange-900 dark:to-red-950',
    iconBg: 'bg-orange-700',
    ring: 'ring-orange-500/45 dark:ring-orange-700/60',
    calBadge: 'bg-brand-red-strong/15 text-brand-red-strong dark:bg-brand-red/20 dark:text-brand-red-text',
  },
  amber: {
    gradient: 'from-amber-600 to-orange-900 dark:from-amber-800 dark:to-orange-950',
    iconBg: 'bg-amber-700',
    ring: 'ring-amber-500/50 dark:ring-amber-700/60',
    calBadge: 'bg-amber-700/15 text-amber-900 dark:bg-amber-700/30 dark:text-amber-300',
  },
  forest: {
    gradient: 'from-emerald-700 to-green-950 dark:from-emerald-900 dark:to-green-950',
    iconBg: 'bg-emerald-700',
    ring: 'ring-emerald-500/45 dark:ring-emerald-700/60',
    calBadge: 'bg-emerald-700/15 text-emerald-900 dark:bg-emerald-700/30 dark:text-emerald-300',
  },
  ocean: {
    gradient: 'from-blue-700 to-blue-950 dark:from-blue-900 dark:to-blue-950',
    iconBg: 'bg-blue-700',
    ring: 'ring-blue-500/45 dark:ring-blue-700/60',
    calBadge: 'bg-blue-700/15 text-blue-900 dark:bg-blue-700/30 dark:text-blue-300',
  },
  teal: {
    gradient: 'from-teal-700 to-emerald-950 dark:from-teal-900 dark:to-emerald-950',
    iconBg: 'bg-teal-700',
    ring: 'ring-teal-500/45 dark:ring-teal-700/60',
    calBadge: 'bg-teal-700/15 text-teal-900 dark:bg-teal-700/30 dark:text-teal-300',
  },
  violet: {
    gradient: 'from-violet-700 to-purple-950 dark:from-violet-900 dark:to-purple-950',
    iconBg: 'bg-violet-700',
    ring: 'ring-violet-500/45 dark:ring-violet-700/60',
    calBadge: 'bg-violet-700/15 text-violet-900 dark:bg-violet-700/30 dark:text-violet-300',
  },
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'grains-and-starches': {
    ...FOOD_CATEGORY_TONES.amber,
    icon: Wheat,
  },
  breads: {
    ...FOOD_CATEGORY_TONES.ember,
    icon: Layers,
  },
  legumes: {
    ...FOOD_CATEGORY_TONES.forest,
    icon: CircleDot,
  },
  meats: {
    ...FOOD_CATEGORY_TONES.crimson,
    icon: Beef,
  },
  poultry: {
    ...FOOD_CATEGORY_TONES.ember,
    icon: Feather,
  },
  'eggs-and-dairy': {
    ...FOOD_CATEGORY_TONES.ocean,
    icon: Egg,
  },
  'fish-and-seafood': {
    ...FOOD_CATEGORY_TONES.teal,
    icon: Fish,
  },
  'oils-and-fats': {
    ...FOOD_CATEGORY_TONES.amber,
    icon: Droplets,
  },
  fruits: {
    ...FOOD_CATEGORY_TONES.burgundy,
    icon: Apple,
  },
  vegetables: {
    ...FOOD_CATEGORY_TONES.forest,
    icon: Leaf,
  },
  'nuts-and-dried-fruits': {
    ...FOOD_CATEGORY_TONES.amber,
    icon: Nut,
  },
  'sugars-and-sweeteners': {
    ...FOOD_CATEGORY_TONES.violet,
    icon: Cookie,
  },
  'seasonings-and-spices': {
    ...FOOD_CATEGORY_TONES.crimson,
    icon: FlaskConical,
  },
  beverages: {
    ...FOOD_CATEGORY_TONES.ocean,
    icon: Coffee,
  },
};

const fallbackStyle: CategoryStyle = {
  ...FOOD_CATEGORY_TONES.crimson,
  icon: BookOpen,
};

const getCategoryStyle = (categoryId: string): CategoryStyle =>
  CATEGORY_STYLES[categoryId] ?? fallbackStyle;

const getCategoryIconColor = (iconBg: string) => {
  if (iconBg === 'bg-brand-red') return 'text-brand-red-strong dark:text-brand-red-text';
  if (iconBg === 'bg-brand-red-strong') return 'text-brand-red-strong dark:text-brand-red-text';
  if (iconBg === 'bg-brand-metallic') return 'text-red-300';
  if (iconBg === 'bg-brand-charcoal') return 'text-brand-charcoal dark:text-brand-text-soft';
  if (iconBg === 'bg-brand-stone') return 'text-brand-text-soft';

  return iconBg.replace('bg-', 'text-').replace(/-(700|800)$/, '-300');
};

// ─── Nutrition Bar ────────────────────────────────────────────────────────────

function NutrientBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 dark:text-brand-text-soft">{label}</span>
        <span className="tabular-nums font-bold text-slate-800 dark:text-brand-text-main">{value} گرم</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-brand-carbon">
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
        <p className="mt-1 text-sm text-slate-500 dark:text-brand-text-muted">
          اطلاعات و ارزش غذایی مواد غذایی رایج
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-300 dark:bg-brand-carbon" />
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
                  className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-right ring-1 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 hover:shadow-lg active:scale-[0.98] ${style.gradient} ${style.ring}`}
                >
                  <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 ${style.iconBg} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="line-clamp-2 text-sm font-black leading-snug text-white">
                    {cat.name}
                  </p>
                  <ChevronLeft className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70 opacity-0 transition-opacity group-hover:opacity-100" />
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
          className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-brand-text-muted dark:hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
          بانک غذایی
        </button>
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${style.iconBg} shadow-md`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-brand-text-main">{categoryName}</h1>
            <p className="text-sm text-slate-500 dark:text-brand-text-muted">{allFoods.length} ماده غذایی</p>
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
      <div className="flex items-center gap-3 rounded-2xl border border-stone-300 bg-stone-50/90 p-3.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-brand-red/40 hover:shadow-md active:scale-[0.98] dark:border-brand-border dark:bg-brand-surface-2/90 dark:hover:border-brand-red/50">
        {/* Category icon */}
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-stone-200 ring-1 dark:bg-brand-carbon ${style.ring}`}>
          {(() => { const Icon = style.icon; return <Icon className={`h-5 w-5 ${getCategoryIconColor(style.iconBg)}`} />; })()}
        </div>

        {/* Food info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800 dark:text-brand-text-main">{food.name}</p>
          <p className="truncate text-[11px] text-slate-400 dark:text-brand-text-muted">{food.nameEn}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <MacroPill label={`پروتئین ${food.proteinG}g`} color="bg-status-info/15 text-blue-900 dark:bg-status-info/25 dark:text-blue-300" />
            <MacroPill label={`کربوهیدرات ${food.carbohydrateG}g`} color="bg-status-warning/15 text-orange-900 dark:bg-status-warning/25 dark:text-orange-300" />
            <MacroPill label={`چربی ${food.fatG}g`} color="bg-brand-metallic/15 text-rose-900 dark:bg-brand-metallic/35 dark:text-rose-300" />
          </div>
        </div>

        {/* Calories */}
        <div className="shrink-0 text-left">
          <p className="text-lg font-black tabular-nums text-slate-900 dark:text-brand-text-main">{food.calories}</p>
          <p className="text-[10px] text-slate-400 dark:text-brand-text-muted">کالری</p>
        </div>

        <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300 dark:text-brand-text-muted" />
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
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900 dark:text-brand-text-muted dark:hover:text-white"
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
            <h1 className="text-xl font-black text-slate-900 dark:text-brand-text-main">{food.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-brand-text-muted">{food.nameEn}</p>
            <p className="mt-2 text-xs text-slate-400 dark:text-brand-text-muted">
              به ازای {food.servingAmount} {food.servingUnit}
            </p>
          </div>

          {/* Big calorie display */}
          <div className="shrink-0 rounded-2xl bg-stone-50/80 px-4 py-3 text-center shadow-sm ring-1 ring-stone-300 backdrop-blur-sm dark:bg-brand-surface/80 dark:ring-brand-border">
            <p className="text-3xl font-black tabular-nums text-slate-900 dark:text-brand-text-main">{food.calories}</p>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-brand-text-muted">کیلوکالری</p>
          </div>
        </div>

        {/* Quick macro pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: 'پروتئین', value: food.proteinG, color: 'bg-status-info/20 text-blue-900 dark:text-blue-300' },
            { label: 'کربوهیدرات', value: food.carbohydrateG, color: 'bg-status-warning/20 text-orange-900 dark:text-orange-300' },
            { label: 'چربی', value: food.fatG, color: 'bg-brand-metallic/20 text-rose-900 dark:text-rose-300' },
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
        className="rounded-2xl border border-stone-300 bg-stone-50/90 p-5 backdrop-blur-sm dark:border-brand-border dark:bg-brand-surface-2/90"
      >
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 dark:bg-brand-carbon">
            <BookOpen className="h-4 w-4 text-slate-600 dark:text-brand-text-soft" />
          </div>
          اطلاعات تغذیه‌ای
        </h2>

        <div className="space-y-3.5">
          <NutrientBar label="پروتئین" value={food.proteinG} max={Math.max(totalMacros, 1)} color="bg-status-info" />
          <NutrientBar label="کربوهیدرات" value={food.carbohydrateG} max={Math.max(totalMacros, 1)} color="bg-status-warning" />
          <NutrientBar label="چربی" value={food.fatG} max={Math.max(totalMacros, 1)} color="bg-brand-metallic" />
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
          { label: 'فیبر', value: `${food.fiberG}g`, color: 'bg-status-success/10 dark:bg-status-success/15', textColor: 'text-green-800 dark:text-green-300' },
          { label: 'قند', value: `${food.sugarG}g`, color: 'bg-brand-metallic/10 dark:bg-brand-metallic/30', textColor: 'text-brand-metallic dark:text-red-300' },
          { label: 'سدیم', value: `${food.sodiumMg}mg`, color: 'bg-status-warning/10 dark:bg-status-warning/15', textColor: 'text-orange-900 dark:text-orange-300' },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl ${item.color} p-3 text-center`}>
            <p className={`text-lg font-black tabular-nums ${item.textColor}`}>{item.value}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-brand-text-muted">{item.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Macro distribution */}
      {totalMacros > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-stone-300 bg-stone-50/90 p-5 backdrop-blur-sm dark:border-brand-border dark:bg-brand-surface-2/90"
        >
          <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-brand-text-main">توزیع درشت‌مغذی‌ها</h2>
          <div className="flex h-3 overflow-hidden rounded-full">
            <motion.div
              className="bg-status-info"
              style={{ width: `${(food.proteinG / totalMacros) * 100}%` }}
              initial={{ scaleX: 0, originX: 1 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="bg-status-warning"
              style={{ width: `${(food.carbohydrateG / totalMacros) * 100}%` }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="bg-brand-metallic"
              style={{ width: `${(food.fatG / totalMacros) * 100}%` }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {[
              { label: 'پروتئین', pct: (food.proteinG / totalMacros) * 100, color: 'bg-status-info' },
              { label: 'کربوهیدرات', pct: (food.carbohydrateG / totalMacros) * 100, color: 'bg-status-warning' },
              { label: 'چربی', pct: (food.fatG / totalMacros) * 100, color: 'bg-brand-metallic' },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-1.5 text-xs">
                <div className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                <span className="font-semibold text-slate-600 dark:text-brand-text-soft">{m.label}</span>
                <span className="tabular-nums font-bold text-slate-900 dark:text-brand-text-main">{m.pct.toFixed(0)}٪</span>
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
        className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-brand-border dark:bg-brand-surface-2"
      >
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
        <p className="text-xs text-slate-500 dark:text-brand-text-muted">
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
    <div className="flex min-h-[108px] items-start gap-3 overflow-x-auto px-1 py-2 no-scrollbar">
      {categories.map((cat, i) => {
        const style = getCategoryStyle(cat.categoryId);
        const Icon = style.icon;
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 + i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 shrink-0"
          >
            <Link to={`/athlete/foods/${cat.categoryId}`} className="flex min-h-[88px] flex-col items-center gap-2">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ring-1 ${style.gradient} ${style.ring}`}>
                <Icon className={`h-6 w-6 ${getCategoryIconColor(style.iconBg)}`} />
              </div>
              <span className="max-w-[56px] text-center text-[10px] font-semibold leading-tight text-slate-600 dark:text-brand-text-soft">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
