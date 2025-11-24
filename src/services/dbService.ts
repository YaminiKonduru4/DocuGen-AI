import { supabase } from './supabaseClient';
import type { Project } from '../types';

export const dbService = {
  /**
   * Fetch all projects for a specific user
   */
  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    // Map DB snake_case to app camelCase
    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      type: row.type,
      mainTopic: row.main_topic,
      sections: row.sections, // JSONB column automatically parsed
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime()
    }));
  },

  /**
   * Create a new project
   */
  async createProject(project: Project, userId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .insert({
        id: project.id,
        user_id: userId,
        title: project.title,
        type: project.type,
        main_topic: project.mainTopic,
        sections: project.sections,
        created_at: new Date(project.createdAt).toISOString(),
        updated_at: new Date(project.updatedAt).toISOString()
      });

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Update an existing project (content, sections, history)
   */
  async updateProject(project: Project): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({
        title: project.title,
        sections: project.sections,
        updated_at: new Date().toISOString()
      })
      .eq('id', project.id);

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }
};