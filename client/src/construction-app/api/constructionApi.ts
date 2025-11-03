/**
 * 🌐 CONSTRUCTION API CLIENT - Real API Integration
 * =================================================
 * 
 * Production API client with authentication, error handling, and real-time updates
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://162.55.83.33:3000/api/v1';

class ConstructionAPI {
  private client: AxiosInstance;
  private token: string | null = null;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 300000, // 5 minutes for large plan processing
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add auth interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          this.token = null;
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  
  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    this.token = response.data.token;
    localStorage.setItem('auth_token', this.token);
    return response.data;
  }
  
  async register(email: string, password: string, organization: string) {
    const response = await this.client.post('/auth/register', { email, password, organization });
    this.token = response.data.token;
    localStorage.setItem('auth_token', this.token);
    return response.data;
  }
  
  setToken(token: string) {
    this.token = token;
  }
  
  // Project Management
  async getProjects() {
    const response = await this.client.get('/projects');
    return response.data.projects;
  }
  
  async getProject(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}`);
    return response.data;
  }
  
  async createProject(projectData: any) {
    const response = await this.client.post('/projects', projectData);
    return response.data.project;
  }
  
  // Analysis
  async uploadPlan(file: File, projectInfo?: any) {
    const formData = new FormData();
    formData.append('plan', file);
    if (projectInfo) {
      formData.append('projectInfo', JSON.stringify(projectInfo));
    }
    
    const response = await this.client.post('/analyze/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
  
  async getAnalysisStatus(jobId: string) {
    const response = await this.client.get(`/analyze/status/${jobId}`);
    return response.data;
  }
  
  async getAnalysisResult(jobId: string) {
    const response = await this.client.get(`/analyze/result/${jobId}`);
    return response.data;
  }
  
  // Document Generation
  async generateAusschreibung(jobId: string, projectInfo: any) {
    const response = await this.client.post('/generate/ausschreibung', {
      jobId,
      projectInfo
    });
    return response.data;
  }
  
  async generateLP6(planPaths: string[], projectInfo: any) {
    const response = await this.client.post('/generate/lp6', {
      planPaths,
      projectInfo
    });
    return response.data;
  }
  
  async generateVerification(jobId: string, projectInfo: any) {
    const response = await this.client.post('/generate/verification', {
      jobId,
      projectInfo
    });
    return response.data;
  }
  
  // Health Check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
  
  // Metrics
  async getMetrics() {
    const response = await this.client.get('/metrics');
    return response.data;
  }
}

export const constructionApi = new ConstructionAPI();

// Load token from localStorage on init
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  constructionApi.setToken(savedToken);
}

