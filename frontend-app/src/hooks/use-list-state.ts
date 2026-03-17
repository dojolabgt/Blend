import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import type { ListQuery } from '@/types/pagination';

interface UseListStateOptions<F> {
    initialFilters?: F;
    limit?: number;
    debounceMs?: number;
}

interface UseListStateReturn<F extends Record<string, unknown>> {
    /** Raw search input value — bind directly to AppSearch */
    search: string;
    page: number;
    filters: F;
    /** Set search input; page resets to 1 automatically after debounce */
    setSearch: (s: string) => void;
    setPage: (p: number) => void;
    /** Set a single filter key; page resets to 1 */
    setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
    /** Reset search + filters + page */
    reset: () => void;
    /** Ready-to-use query object for the API — includes debounced search */
    query: ListQuery & F;
}

export function useListState<F extends Record<string, unknown>>(
    opts: UseListStateOptions<F> = {},
): UseListStateReturn<F> {
    const { initialFilters = {} as F, limit = 20, debounceMs = 400 } = opts;

    const [page, setPageRaw] = useState(1);
    const [search, setSearchRaw] = useState('');
    const [filters, setFiltersRaw] = useState<F>(initialFilters);

    const debouncedSearch = useDebounce(search, debounceMs);

    // Reset to page 1 when search or filters change
    useEffect(() => {
        setPageRaw(1);
    }, [debouncedSearch]);

    const setSearch = useCallback((s: string) => {
        setSearchRaw(s);
    }, []);

    const setPage = useCallback((p: number) => {
        setPageRaw(p);
    }, []);

    const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
        setFiltersRaw((prev) => ({ ...prev, [key]: value }));
        setPageRaw(1);
    }, []);

    const reset = useCallback(() => {
        setSearchRaw('');
        setFiltersRaw(initialFilters);
        setPageRaw(1);
    }, [initialFilters]);

    const query = useMemo(() => {
        const base: ListQuery = { page, limit };
        if (debouncedSearch) base.search = debouncedSearch;

        // Merge filters, omitting undefined values
        const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== undefined),
        );

        return { ...base, ...activeFilters } as ListQuery & F;
    }, [page, limit, debouncedSearch, filters]);

    return { search, page, filters, setSearch, setPage, setFilter, reset, query };
}
