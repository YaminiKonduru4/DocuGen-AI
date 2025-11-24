import React from 'react';
import { DocType } from '../types';
import type { Project } from '../types';
import { Button } from '../components/Button';

interface DashboardProps {
  projects: Project[];
  onCreateNew: () => void;
  onOpenProject: (project: Project) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onCreateNew, onOpenProject }) => {
  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen auth-font">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Workspace</h1>
          <p className="text-white/80">Manage your documents and presentations.</p>
        </div>
        <Button onClick={onCreateNew}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/3 glass-panel rounded-2xl border border-white/6 border-dashed">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
          <p className="text-white/80 mb-6 max-w-sm text-center">Get started by creating your first AI-assisted document or presentation.</p>
          <Button variant="secondary" onClick={onCreateNew}>Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              onClick={() => onOpenProject(project)}
              className="group bg-white/3 hover:bg-white/8 border border-white/6 hover:border-white/20 rounded-xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[0_20px_40px_rgba(255,255,255,0.04)]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${project.type === DocType.DOCX ? 'bg-white/6 text-white' : 'bg-white/10 text-white'}`}>
                  {project.type === DocType.DOCX ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-medium text-white/70 bg-white/6 px-2 py-1 rounded">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90 transition-colors truncate">{project.title}</h3>
              <p className="text-white/80 text-sm line-clamp-2">{project.mainTopic}</p>
              
              <div className="mt-6 flex items-center gap-2 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {project.sections.length} {project.type === DocType.PPTX ? 'Slides' : 'Sections'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};