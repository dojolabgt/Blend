import api from '@/lib/api';
import { PaginatedResponse, ListQuery, toQueryString } from '@/types/pagination';
import { Deal } from '@/hooks/use-deals';

export const dealsApi = {
    getAll: async (
        workspaceId: string,
        query?: Partial<ListQuery>,
    ): Promise<PaginatedResponse<Deal>> => {
        const qs = query ? toQueryString({ page: 1, limit: 20, ...query }) : '';
        return api
            .get(`/workspaces/${workspaceId}/deals${qs ? `?${qs}` : ''}`)
            .then((res) => res.data);
    },
};
