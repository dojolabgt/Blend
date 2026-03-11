'use client';

import { useProject } from './layout';
import { ProjectOverviewTab } from './_components/ProjectOverviewTab';

export default function ProjectOverviewPage() {
    const { project } = useProject();

    return (
        <div className="w-full">
            <ProjectOverviewTab project={project} />
        </div>
    );
}
