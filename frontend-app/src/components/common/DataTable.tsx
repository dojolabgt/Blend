'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Column Definition ─────────────────────────────────────────────────────

export interface ColumnDef<T> {
    key: string;
    header: string;
    /** Extra className for both <TableHead> and <TableCell> */
    className?: string;
    render: (row: T) => React.ReactNode;
}

// ─── Action Item ────────────────────────────────────────────────────────────

export interface ActionItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    /** Renders the item in destructive (red) style */
    destructive?: boolean;
}

// ─── Props ──────────────────────────────────────────────────────────────────

export interface DataTableProps<T extends { id: string }> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    /** Number of skeleton rows while loading */
    skeletonRows?: number;

    // Empty state
    emptyIcon?: React.ReactNode;
    emptyTitle: string;
    emptyDescription?: string;
    emptyAction?: React.ReactNode;

    // Per-row actions rendered in a ⋯ dropdown
    actions?: (row: T) => ActionItem[];

    /** Navigate / open a detail view on row click */
    onRowClick?: (row: T) => void;

    /** Rendered above the table (search, filters) — visible even during loading/empty states */
    toolbar?: React.ReactNode;

    /** Rendered below the table (pagination) — only visible when there is data */
    footer?: React.ReactNode;

    className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DataTable<T extends { id: string }>({
    data,
    columns,
    isLoading = false,
    skeletonRows = 3,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    emptyAction,
    actions,
    onRowClick,
    toolbar,
    footer,
    className,
}: DataTableProps<T>) {
    const hasActions = !!actions;

    const toolbarSlot = toolbar ? (
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 flex-wrap">
            {toolbar}
        </div>
    ) : null;

    const footerSlot = footer ? (
        <div className="px-5 py-3 border-t border-border/50">
            {footer}
        </div>
    ) : null;

    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className={cn('bg-card border rounded-2xl overflow-hidden shadow-sm', className)}>
                {toolbarSlot}
                <div className="p-8 space-y-4">
                    {Array.from({ length: skeletonRows }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                </div>
                {footerSlot}
            </div>
        );
    }

    // ── Empty state ────────────────────────────────────────────────────────
    if (data.length === 0) {
        return (
            <div className={cn('bg-card border rounded-2xl overflow-hidden shadow-sm', className)}>
                {toolbarSlot}
                <div className="flex flex-col items-center justify-center p-20 text-center">
                    {emptyIcon && (
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                            {emptyIcon}
                        </div>
                    )}
                    <h3 className="text-lg font-semibold">{emptyTitle}</h3>
                    {emptyDescription && (
                        <p className="text-muted-foreground max-w-xs mt-1 mb-6">{emptyDescription}</p>
                    )}
                    {emptyAction && !emptyDescription && <div className="mt-6">{emptyAction}</div>}
                    {emptyAction && emptyDescription && <div>{emptyAction}</div>}
                </div>
                {footerSlot}
            </div>
        );
    }

    // ── Table ──────────────────────────────────────────────────────────────
    return (
        <div className={cn(
            'bg-card border rounded-2xl overflow-hidden shadow-sm',
            '[&_th]:px-5 [&_th]:py-3 [&_td]:px-5 [&_td]:py-3',
            className
        )}>
            {toolbarSlot}

            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.key} className={col.className}>
                                {col.header}
                            </TableHead>
                        ))}
                        {hasActions && <TableHead className="w-14" />}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((row) => (
                        <TableRow
                            key={row.id}
                            className={cn(
                                'hover:bg-muted/30 transition-colors group',
                                onRowClick && 'cursor-pointer'
                            )}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                        >
                            {columns.map((col) => (
                                <TableCell key={col.key} className={col.className}>
                                    {col.render(row)}
                                </TableCell>
                            ))}

                            {hasActions && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full h-8 w-8"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="rounded-xl border-zinc-200 shadow-xl"
                                        >
                                            {actions!(row).map((action, idx) => (
                                                <DropdownMenuItem
                                                    key={idx}
                                                    onClick={action.onClick}
                                                    className={cn(
                                                        'flex items-center cursor-pointer',
                                                        action.destructive &&
                                                        'text-destructive focus:bg-destructive/10 focus:text-destructive'
                                                    )}
                                                >
                                                    {action.icon && (
                                                        <span className="mr-2 h-4 w-4 flex items-center">
                                                            {action.icon}
                                                        </span>
                                                    )}
                                                    {action.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {footerSlot}
        </div>
    );
}
