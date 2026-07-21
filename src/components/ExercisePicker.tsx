import { useMemo, useState } from 'react';
import { useExercises } from '../hooks/exercises';
import { useDebounce } from '../hooks/useDebounce';
import { truncateText } from '../utils/text';
import { Input } from './ui';

export function ExercisePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebounce(term);
  const { data: response } = useExercises({ search: debouncedTerm });
  const exercises = response?.data.items ?? [];
  const selected = useMemo(() => exercises.find((item) => item.id === value), [exercises, value]);

  return (
    <div className="space-y-2">
      <Input placeholder="نام حرکت را تایپ کنید" value={selected?.title ?? term} onChange={(event) => setTerm(event.target.value)} />
      {term ? (
        <div className="max-h-40 overflow-y-auto rounded-xl border border-stone-300 bg-stone-50 p-1 dark:border-brand-border dark:bg-brand-surface dark:backdrop-blur-md">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              className="block w-full rounded-lg px-3 py-2 text-right text-sm transition hover:bg-brand-red/10 hover:text-brand-red-strong dark:hover:bg-brand-red/15 dark:hover:text-brand-red-text"
              onClick={() => {
                onChange(exercise.id);
                setTerm('');
              }}
            >
              <span className="block font-medium">{exercise.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-brand-text-muted">{truncateText(exercise.description, 80) || 'توضیحاتی ثبت نشده است.'}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
