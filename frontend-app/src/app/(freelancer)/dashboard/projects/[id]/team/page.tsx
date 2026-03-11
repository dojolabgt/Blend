'use client';

import React from 'react';
import { useProject } from '../layout';
import { ProjectCollaboratorsTab } from '../_components/ProjectCollaboratorsTab';

export default function ProjectTeamPage() {
    const { project, isOwner, isViewer, refreshProject } = useProject();

    return (
        <div className="w-full max-w-4xl mx-auto">
            <ProjectCollaboratorsTab 
                project={project}
                isOwner={isOwner}
                isViewer={isViewer}
                onUpdate={refreshProject}
            />
        </div>
    );
}
