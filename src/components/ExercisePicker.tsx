import { useMemo, useState } from 'react';
import { useExercises } from '../hooks/exercises';
import { truncateText } from '../utils/text';
import { Input } from './ui';

export function ExercisePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [term, setTerm] = useState('');
  const { data: response } = useExercises({ search: term });
  const exercises = response?.data.items ?? [];
  const selected = useMemo(() => exercises.find((item) => item.id === value), [exercises, value]);

  return (
    <div className="space-y-2">
      <Input placeholder="نام حرکت را تایپ کنید" value={selected?.title ?? term} onChange={(event) => setTerm(event.target.value)} />
      {term ? (
        <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              className="block w-full rounded-md px-3 py-2 text-right text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => {
                onChange(exercise.id);
                setTerm('');
              }}
            >
              <span className="block font-medium">{exercise.title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{truncateText(exercise.description, 80) || 'توضیحاتی ثبت نشده است.'}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
