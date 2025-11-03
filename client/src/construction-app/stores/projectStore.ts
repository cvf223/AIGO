/**
 * 📦 PROJECT STORE - State Management with Zustand
 * ================================================
 * 
 * Real-time state management for construction projects
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: string;
  projectNumber: string;
  name: string;
  totalArea: number;
  estimatedValue: number;
  status: 'analyzing' | 'complete' | 'error';
  plans: Array<{
    planFile: string;
    planNumber: number;
    elements: any[];
    analysisStatus: 'pending' | 'processing' | 'complete' | 'error';
  }>;
  decisions: any[];
  deliverables: {
    ausschreibung?: { status: string; path: string };
    lp6?: { status: string; path: string };
    verification?: { status: string; path: string };
  };
}

interface ProjectState {
  // Projects
  projects: Map<string, Project>;
  currentProjectId: string | null;
  
  // Analysis jobs
  activeJobs: Map<string, {
    jobId: string;
    projectId: string;
    status: string;
    progress: number;
    message: string;
  }>;
  
  // UI state
  viewMode: 'construction' | 'ai' | 'unified' | 'audit';
  showTOT: boolean;
  selectedElement: any | null;
  selectedDecision: any | null;
  
  // Actions
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  setCurrentProject: (projectId: string) => void;
  
  addJob: (jobId: string, projectId: string) => void;
  updateJob: (jobId: string, updates: any) => void;
  removeJob: (jobId: string) => void;
  
  setViewMode: (mode: 'construction' | 'ai' | 'unified' | 'audit') => void;
  toggleTOT: () => void;
  selectElement: (element: any) => void;
  selectDecision: (decision: any) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: new Map(),
      currentProjectId: null,
      activeJobs: new Map(),
      viewMode: 'unified',
      showTOT: true,
      selectedElement: null,
      selectedDecision: null,
      
      // Project actions
      addProject: (project) => {
        const projects = new Map(get().projects);
        projects.set(project.id, project);
        set({ projects, currentProjectId: project.id });
      },
      
      updateProject: (projectId, updates) => {
        const projects = new Map(get().projects);
        const project = projects.get(projectId);
        if (project) {
          projects.set(projectId, { ...project, ...updates });
          set({ projects });
        }
      },
      
      setCurrentProject: (projectId) => {
        set({ currentProjectId: projectId });
      },
      
      // Job actions
      addJob: (jobId, projectId) => {
        const activeJobs = new Map(get().activeJobs);
        activeJobs.set(jobId, {
          jobId,
          projectId,
          status: 'queued',
          progress: 0,
          message: 'Starting analysis...'
        });
        set({ activeJobs });
      },
      
      updateJob: (jobId, updates) => {
        const activeJobs = new Map(get().activeJobs);
        const job = activeJobs.get(jobId);
        if (job) {
          activeJobs.set(jobId, { ...job, ...updates });
          set({ activeJobs });
        }
      },
      
      removeJob: (jobId) => {
        const activeJobs = new Map(get().activeJobs);
        activeJobs.delete(jobId);
        set({ activeJobs });
      },
      
      // UI actions
      setViewMode: (mode) => set({ viewMode: mode }),
      toggleTOT: () => set((state) => ({ showTOT: !state.showTOT })),
      selectElement: (element) => set({ selectedElement: element }),
      selectDecision: (decision) => set({ selectedDecision: decision })
    }),
    {
      name: 'construction-project-storage',
      partialize: (state) => ({
        projects: Array.from(state.projects.entries()),
        currentProjectId: state.currentProjectId,
        viewMode: state.viewMode,
        showTOT: state.showTOT
      })
    }
  )
);

