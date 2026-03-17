import api from '@/lib/api';
import { PaginatedResponse, ListQuery, toQueryString } from '@/types/pagination';
import { Project } from '@/hooks/use-projects';

export const projectsApi = {
    getAll: async (
        workspaceId: string,
        query?: Partial<ListQuery>,
    ): Promise<PaginatedResponse<Project>> => {
        const qs = query ? toQueryString({ page: 1, limit: 20, ...query }) : '';
        return api
            .get(`/workspaces/${workspaceId}/projects${qs ? `?${qs}` : ''}`)
            .then((res) => res.data);
    },
};
