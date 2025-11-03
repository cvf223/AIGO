/**
 * 📤 UPLOAD PROJECT PAGE - Multi-Plan Upload with Real-Time Progress
 * ==================================================================
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { constructionApi } from '../api/constructionApi';
import { useProjectStore } from '../stores/projectStore';
import { useWebSocket } from '../contexts/WebSocketContext';

export default function UploadProject() {
  const navigate = useNavigate();
  const { addProject, addJob } = useProjectStore();
  const { subscribeToJob } = useWebSocket();
  
  const [files, setFiles] = useState<File[]>([]);
  const [projectInfo, setProjectInfo] = useState({
    name: '',
    projectNumber: '',
    totalArea: 75000,
    estimatedValue: 50000000,
    buildingType: 'Commercial'
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => 
        f.type === 'application/pdf' || f.type.startsWith('image/')
      );
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);
  
  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one plan');
      return;
    }
    
    if (!projectInfo.name || !projectInfo.projectNumber) {
      alert('Please fill in project name and number');
      return;
    }
    
    setUploading(true);
    
    try {
      // Create project
      const project = await constructionApi.createProject({
        ...projectInfo,
        planCount: files.length
      });
      
      console.log('✅ Project created:', project.id);
      
      // Upload plans sequentially
      const jobIds = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Uploading plan ${i + 1}/${files.length}: ${file.name}`);
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const uploadResult = await constructionApi.uploadPlan(file, {
          ...projectInfo,
          planNumber: i + 1,
          totalPlans: files.length
        });
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        // Subscribe to job progress
        addJob(uploadResult.jobId, project.id);
        subscribeToJob(uploadResult.jobId);
        jobIds.push(uploadResult.jobId);
        
        console.log(`✅ Plan ${i + 1} uploaded, job: ${uploadResult.jobId}`);
      }
      
      // Add project to store
      addProject({
        ...project,
        plans: files.map((f, i) => ({
          planFile: f.name,
          planNumber: i + 1,
          elements: [],
          analysisStatus: 'processing'
        })),
        decisions: [],
        deliverables: {}
      });
      
      // Navigate to project dashboard
      navigate(`/projects/${project.id}`);
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('Upload failed: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Upload Construction Project</h1>
        
        {/* Project Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name *</label>
              <input
                type="text"
                value={projectInfo.name}
                onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., Frankfurt Office Building"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Project Number *</label>
              <input
                type="text"
                value={projectInfo.projectNumber}
                onChange={(e) => setProjectInfo({ ...projectInfo, projectNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., FB-AUS-2024-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Total Area (m²)</label>
              <input
                type="number"
                value={projectInfo.totalArea}
                onChange={(e) => setProjectInfo({ ...projectInfo, totalArea: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Value (€)</label>
              <input
                type="number"
                value={projectInfo.estimatedValue}
                onChange={(e) => setProjectInfo({ ...projectInfo, estimatedValue: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        </div>
        
        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Construction Plans</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            >
              <div className="text-4xl mb-2">📁</div>
              <div className="text-lg">Click to select plans</div>
              <div className="text-sm text-gray-500 mt-1">PDF or image files</div>
            </label>
          </div>
          
          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Selected Plans ({files.length})</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  {uploadProgress[file.name] !== undefined && (
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded h-2">
                        <div
                          className="bg-blue-500 h-2 rounded transition-all"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="px-3 py-1 text-red-500 hover:bg-red-50 rounded"
                    disabled={uploading}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Upload Button */}
        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} Plans`}
          </button>
          
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
        
        {uploading && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Uploading plans and starting analysis...
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You'll be redirected to the project dashboard automatically
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

