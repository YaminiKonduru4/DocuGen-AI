import React, { useState, useEffect } from 'react';
import { DocType } from '../types';
import type { Project } from '../types';
import { generateSectionContent, refineContent } from '../services/geminiService';
import { exportProject } from '../services/exportService';
import { Button } from '../components/Button';

interface EditorProps {
  project: Project;
  onUpdateProject: (project: Project) => Promise<void>; // Updated to Promise
  onClose: () => void;
}

export const Editor: React.FC<EditorProps> = ({ project, onUpdateProject, onClose }) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(project.sections[0]?.id || '');
  const [loadingSectionId, setLoadingSectionId] = useState<string | null>(null);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeSection = project.sections.find(s => s.id === activeSectionId);

  useEffect(() => {
    const generateIfNeeded = async () => {
      if (activeSection && !activeSection.content && !activeSection.isGenerated && !loadingSectionId) {
        setLoadingSectionId(activeSection.id);
        try {
          const content = await generateSectionContent(project.mainTopic, activeSection.title, project.type);
          updateSectionContent(activeSection.id, content, true);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingSectionId(null);
        }
      }
    };
    generateIfNeeded();
   
  }, [activeSectionId]); 

  const updateSectionContent = async (id: string, newContent: string, isGenerated: boolean) => {
    const updatedSections = project.sections.map(s => 
      s.id === id ? { ...s, content: newContent, isGenerated } : s
    );
    setIsSaving(true);
    try {
      await onUpdateProject({ ...project, sections: updatedSections, updatedAt: Date.now() });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefine = async () => {
    if (!activeSection || !refinePrompt) return;
    setIsRefining(true);
    try {
      const refined = await refineContent(activeSection.content, refinePrompt);
      const updatedHistory = [
        ...activeSection.history, 
        { timestamp: Date.now(), prompt: refinePrompt, previousContent: activeSection.content }
      ];
      
      const updatedSections = project.sections.map(s => 
        s.id === activeSection.id ? { ...s, content: refined, history: updatedHistory } : s
      );
      
      await onUpdateProject({ ...project, sections: updatedSections, updatedAt: Date.now() });
      setRefinePrompt('');
    } finally {
      setIsRefining(false);
    }
  };

  const handleExport = async () => {
    setShowExportModal(true);
    setIsExporting(true);
    try {
      await exportProject(project);
    } catch (error) {
      console.error("Export failed", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setTimeout(() => setShowExportModal(false), 1000); // Small delay to show success state
    }
  };

  if (!activeSection) return <div>No Sections found</div>;

  return (
    <div className="flex h-screen bg-white-gradient/6 pt-16 overflow-hidden auth-font">
      {/* Sidebar - Outline */}
      <div className="w-64 border-r border-white/6 glass-panel flex flex-col">
        <div className="p-4 border-b border-white/6">
          <h3 className="font-bold text-white/80 text-sm uppercase tracking-wider">
            {project.type === DocType.DOCX ? 'Outline' : 'Slides'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {project.sections.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                activeSectionId === section.id 
                  ? 'bg-white/6 text-white border border-white/10' 
                  : 'text-white/80 hover:bg-white/4'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-mono opacity-50">{idx + 1}.</span>
                <span className="truncate">{section.title}</span>
              </div>
              {section.content && <div className="w-2 h-2 rounded-full bg-white/80 shrink-0"></div>}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-white/6">
          <Button variant="secondary" className="w-full justify-center" onClick={handleExport}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to {project.type === DocType.DOCX ? 'Word' : 'PPT'}
          </Button>
          <Button variant="ghost" className="w-full mt-2 justify-center text-sm" onClick={onClose}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content - Editor */}
      <div className="flex-1 flex flex-col bg-white/4 glass-panel relative">
          <div className="p-6 border-b border-white/6 flex justify-between items-center glass-panel">
          <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-3">
               {activeSection.title}
               {isSaving && <span className="text-xs text-white/60 font-normal animate-pulse">Saving...</span>}
             </h2>
             <p className="text-white/60 text-sm">
                {project.type === DocType.DOCX ? 'Editing Section' : 'Editing Slide'} {project.sections.findIndex(s => s.id === activeSectionId) + 1} of {project.sections.length}
             </p>
          </div>
          <div className="flex gap-2">
            <button 
              className="p-2 text-white/70 hover:text-white bg-black/60 hover:bg-black/50 rounded transition"
              title="Undo Last Refinement"
              disabled={activeSection.history.length === 0}
              onClick={() => {
                const lastHistory = activeSection.history[activeSection.history.length - 1];
                if(lastHistory) updateSectionContent(activeSectionId, lastHistory.previousContent, true);
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {loadingSectionId === activeSectionId ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-white/20 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/80 font-medium animate-pulse">Generating drafts with Gemini AI...</p>
            </div>
          ) : (
            <textarea
              className="w-full h-full bg-transparent text-white text-lg leading-relaxed focus:outline-none resize-none font-serif placeholder-white/60"
              value={activeSection.content}
              onChange={(e) => updateSectionContent(activeSectionId, e.target.value, activeSection.isGenerated)}
              placeholder="Start writing or wait for AI generation..."
            />
          )}
        </div>
      </div>

      {/* Right Panel - AI Tools */}
      <div className="w-80 bg-black/50 border-l border-white/6 p-6 flex flex-col gap-6 backdrop-blur-sm">
        <div>
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-white/60" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2L9.09 9.26L2 12L9.09 14.74L12 22L14.91 14.74L22 12L14.91 9.26L12 2Z" />
            </svg>
            AI Refinement
          </h3>
          <div className="bg-black/60 p-4 rounded-xl border border-white/6 shadow-inner">
            <label className="text-xs text-white/60 mb-2 block">Instruction</label>
            <textarea
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              placeholder="e.g. 'Make it more formal', 'Summarize to 3 bullets'"
              className="w-full bg-black/60 text-white text-sm rounded-lg p-3 border border-white/6 focus:border-white/30 outline-none resize-none h-24 mb-3"
            />
            <Button 
              className="w-full text-sm" 
              onClick={handleRefine} 
              isLoading={isRefining}
              disabled={!activeSection.content || !refinePrompt}
            >
              Refine Text
            </Button>
          </div>
        </div>

        <div className="flex-1">
           <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">Feedback & Notes</h3>
          <div className="space-y-4">
             <div className="flex gap-2">
              <button className="flex-1 py-2 bg-black/60 border border-white/6 rounded-lg hover:border-white/20 hover:bg-white/6 text-white/70 hover:text-white transition">
                👍 Good
              </button>
              <button className="flex-1 py-2 bg-black/60 border border-white/6 rounded-lg hover:border-white/20 hover:bg-white/6 text-white/70 hover:text-white transition">
                👎 Bad
              </button>
             </div>
             
             <div>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Add private notes for this section..."
                  className="w-full bg-transparent border-b border-white/6 text-white/80 text-sm py-2 focus:border-white/30 outline-none resize-none h-32"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Export Modal Overlay */}
      {showExportModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
           <div className="bg-black/70 p-8 rounded-2xl border border-white/6 shadow-2xl flex flex-col items-center max-w-sm w-full">
              {isExporting ? (
                <>
                  <div className="w-12 h-12 border-4 border-white/20 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-bold text-white">Generating File...</h3>
                  <p className="text-white/70 mt-2 text-center">Assembling {project.type} file with latest content.</p>
                </>
              ) : (
                 <>
                   <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                   </div>
                   <h3 className="text-xl font-bold text-white">Download Started!</h3>
                   <p className="text-white/70 mt-2 text-center">Your file has been generated.</p>
                 </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};