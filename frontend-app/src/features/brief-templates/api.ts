import api from '@/lib/api';
import { PaginatedResponse, ListQuery, toQueryString } from '@/types/pagination';
import { BriefTemplate } from '@/hooks/use-brief-templates';

export const briefTemplatesApi = {
    getAll: async (
        workspaceId: string,
        query?: Partial<ListQuery>,
    ): Promise<PaginatedResponse<BriefTemplate>> => {
        const qs = query ? toQueryString({ page: 1, limit: 20, ...query }) : '';
        return api
            .get(`/workspaces/${workspaceId}/deals/brief-templates${qs ? `?${qs}` : ''}`)
            .then((res) => res.data);
    },
};
