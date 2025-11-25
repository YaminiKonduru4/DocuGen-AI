import React, { useState } from 'react';
import { DocType } from '../types';
import type { Project } from '../types';
import { generateOutline } from '../services/geminiService';
import { Button } from '../components/Button';

interface NewProjectProps {
  onCancel: () => void;
  onProjectCreated: (project: Project) => Promise<void>; // Updated to Promise
}

export const NewProject: React.FC<NewProjectProps> = ({ onCancel, onProjectCreated }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<DocType>(DocType.DOCX);
  const [sections, setSections] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSuggestOutline = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const suggestions = await generateOutline(topic, type);
      setSections(suggestions);
      setStep(2);
    } catch (error) {
      alert("Failed to generate outline. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async () => {
    setIsSaving(true);
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: title || topic,
      type,
      mainTopic: topic,
      sections: sections.map(s => ({
        id: crypto.randomUUID(),
        title: s,
        content: '',
        isGenerated: false,
        history: []
      })),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    try {
      await onProjectCreated(newProject);
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = () => setSections([...sections, "New Section"]);
  const removeSection = (index: number) => setSections(sections.filter((_, i) => i !== index));
  const updateSection = (index: number, val: string) => {
    const newSections = [...sections];
    newSections[index] = val;
    setSections(newSections);
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-3xl mx-auto min-h-screen auth-font">
      <div className="bg-white/3 border border-white/6 rounded-2xl p-8 shadow-2xl glass-panel">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <Button variant="ghost" onClick={onCancel} className="!p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Project Name</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Market Report"
                className="w-full bg-white/3 border border-white/6 rounded-lg p-3 text-black focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Document Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setType(DocType.DOCX)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === DocType.DOCX ? 'border-white/6 bg-white/6 text-white' : 'border-white/6 bg-white/3 text-white/80 hover:border-white/8'}`}
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold">Word (.docx)</span>
                </button>
                <button 
                  onClick={() => setType(DocType.PPTX)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === DocType.PPTX ? 'border-white/6 bg-white/10 text-white' : 'border-white/6 bg-white/3 text-white/80 hover:border-white/8'}`}
                >
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  <span className="font-semibold">PowerPoint (.pptx)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Main Topic / Prompt</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe what this document is about. e.g. 'Comprehensive analysis of renewable energy trends in 2024'"
                className="w-full h-32 bg-white/3 border border-white/6 rounded-lg p-3 text-black focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSuggestOutline} isLoading={isGenerating} disabled={!topic}>
                Next: Generate Outline
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Review Outline</h3>
              <Button variant="secondary" onClick={addSection} className="text-sm">
                + Add {type === DocType.PPTX ? 'Slide' : 'Section'}
              </Button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {sections.map((section, idx) => (
                  <div key={idx} className="flex items-center gap-3 group animate-fadeIn">
                  <div className="text-black/60 text-sm font-mono w-6 text-right">{idx + 1}.</div>
                  <input 
                    type="text" 
                    value={section}
                    onChange={(e) => updateSection(idx, e.target.value)}
                    className="flex-1 bg-white/3 border border-white/6 rounded p-2 text-black focus:border-white/20 outline-none"
                  />
                  <button 
                    onClick={() => removeSection(idx)}
                    className="text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all p-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-6 border-t border-white/6">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleCreate} disabled={sections.length === 0} isLoading={isSaving}>
                {isSaving ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
