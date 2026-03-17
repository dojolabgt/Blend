'use client';

import { cn } from '@/lib/utils';

export interface FilterOption<T extends string = string> {
    label: string;
    value: T | undefined;
}

interface AppFilterTabsProps<T extends string = string> {
    options: FilterOption<T>[];
    value: T | undefined;
    onChange: (value: T | undefined) => void;
    className?: string;
}

export function AppFilterTabs<T extends string = string>({
    options,
    value,
    onChange,
    className,
}: AppFilterTabsProps<T>) {
    return (
        <div className={cn('flex items-center gap-1 flex-wrap', className)}>
            {options.map((opt) => {
                const isActive = opt.value === value;
                return (
                    <button
                        key={opt.value ?? '__all__'}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            'h-7 px-3 rounded-lg text-xs font-medium transition-colors',
                            isActive
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                                : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
