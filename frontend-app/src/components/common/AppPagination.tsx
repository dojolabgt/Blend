'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function AppPagination({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
    className,
}: AppPaginationProps) {
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = total === 0 ? 0 : Math.min(page * limit, total);

    return (
        <div className={cn('flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400', className)}>
            <span>
                {total === 0 ? '0 resultados' : `${from}–${to} de ${total}`}
            </span>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className={cn(
                        'h-8 w-8 flex items-center justify-center rounded-lg transition-colors',
                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        'disabled:opacity-30 disabled:pointer-events-none',
                    )}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-2 tabular-nums">
                    {page} / {totalPages}
                </span>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className={cn(
                        'h-8 w-8 flex items-center justify-center rounded-lg transition-colors',
                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        'disabled:opacity-30 disabled:pointer-events-none',
                    )}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
