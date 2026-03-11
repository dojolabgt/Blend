'use client';

import React from 'react';
import { useProject } from '../layout';
import { ProjectPaymentsTab } from '../_components/ProjectPaymentsTab';

export default function ProjectPaymentsPage() {
    const { project, isOwner, isViewer, refreshProject } = useProject();

    return (
        <div className="w-full">
            <ProjectPaymentsTab 
                project={project}
                isOwner={isOwner}
                isViewer={isViewer}
                onUpdate={refreshProject}
            />
        </div>
    );
}
