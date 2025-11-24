export const DocType = {
  DOCX: 'DOCX',
  PPTX: 'PPTX',
} as const;

export type DocType = typeof DocType[keyof typeof DocType];

export interface Section {
  id: string;
  title: string;
  content: string;
  isGenerated: boolean;
  history: RefinementHistory[];
}

export interface RefinementHistory {
  timestamp: number;
  prompt: string;
  previousContent: string;
}

export interface Project {
  id: string;
  title: string;
  type: DocType;
  mainTopic: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AIResponse {
  text: string;
}