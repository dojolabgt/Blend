'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function AppSearch({
    value,
    onChange,
    placeholder = 'Buscar...',
    className,
}: AppSearchProps) {
    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    'h-9 w-full rounded-xl border border-zinc-200 dark:border-zinc-800',
                    'bg-zinc-50/50 dark:bg-zinc-900/50',
                    'pl-9 pr-8 text-sm text-zinc-900 dark:text-white',
                    'placeholder:text-zinc-400',
                    'outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-transparent',
                    'transition-colors',
                )}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
