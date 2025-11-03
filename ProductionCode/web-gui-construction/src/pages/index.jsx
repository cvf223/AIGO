/**
 * 🏗️ DASHBOARD - Construction Syndicate Command Center
 * ====================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Main dashboard with system overview,
 * active projects, and quick access to all features
 */

import React, { useState, useEffect } from 'react';
import BlueprintPanel from '../components/shared/BlueprintPanel';
import SystemCard from '../components/shared/SystemCard';
import MetricGauge from '../components/shared/MetricGauge';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const router = useRouter();
  const [systemsOverview, setSystemsOverview] = useState([]);
  const [projectStats, setProjectStats] = useState({
    processing: 0,
    completed: 0,
    errors: 0,
    complianceRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [statsRes, activityRes, notifRes, systemsRes] = await Promise.all([
        fetch('http://162.55.83.33:3001/api/dashboard/stats'),
        fetch('http://162.55.83.33:3001/api/dashboard/activity'),
        fetch('http://162.55.83.33:3001/api/humanloop/notifications'),
        fetch('http://162.55.83.33:3001/api/systems')
      ]);
      
      const [statsData, activityData, notifData, systemsData] = await Promise.all([
        statsRes.json(),
        activityRes.json(),
        notifRes.json(),
        systemsRes.json()
      ]);
      
      if (statsData.success) {
        setProjectStats(statsData.stats);
      }
      
      if (activityData.success) {
        setRecentActivity(activityData.activities);
      }
      
      if (notifData.success) {
        setNotificationCount(notifData.count);
      }
      
      if (systemsData.success) {
        const categorized = {};
        systemsData.systems.forEach(system => {
          if (!categorized[system.category]) {
            categorized[system.category] = [];
          }
          if (categorized[system.category].length < 2) {
            categorized[system.category].push(system);
          }
        });
        
        const featured = Object.values(categorized).flat();
        setSystemsOverview(featured);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setIsLoading(false);
    }
  };

  const handleSystemClick = (system) => {
    router.push(`/systems/${system.id}`);
  };

  return (
    <div className="dashboard-container space-y-6">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-architectural mb-2 bg-gradient-to-r from-compliance-green to-construction-orange bg-clip-text text-transparent">
          CONSTRUCTION SYNDICATE COMMAND CENTER
        </h1>
        <p className="text-steel-300 font-body text-lg">
          HOAI LP 6 & 7 Elite Construction Analysis Platform
        </p>
      </div>

      {/* Main Metrics Dashboard */}
      <BlueprintPanel title="🏗️ LIVE PROJECT METRICS" icon="📊">
        <div className="grid grid-cols-4 gap-6">
          <MetricGauge 
            value={projectStats.processing}
            max={30}
            label="Processing Plans"
            color="#00D9FF"
          />
          <MetricGauge 
            value={projectStats.completed}
            max={1000}
            label="Completed Plans"
            color="#00D9FF"
          />
          <MetricGauge 
            value={projectStats.errors}
            max={50}
            label="Errors Detected"
            color="#FFB800"
          />
          <MetricGauge 
            value={projectStats.complianceRate * 100}
            max={100}
            label="HOAI Compliance"
            unit="%"
            color="#00D9FF"
          />
        </div>
      </BlueprintPanel>

      {/* Quick Access Panels */}
      <div className="grid grid-cols-3 gap-6">
        {/* LLM Chat Quick Access */}
        <BlueprintPanel variant="glass">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-industrial font-bold mb-2">LLM CHAT</h3>
            <p className="text-sm text-steel-300 mb-4">
              Chat with agents, Ollama models, or master coordinator
            </p>
            <button
              onClick={() => router.push('/chat')}
              className="btn-industrial"
            >
              OPEN CHAT
            </button>
          </div>
        </BlueprintPanel>

        {/* System Monitoring Quick Access */}
        <BlueprintPanel variant="glass">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-industrial font-bold mb-2">SYSTEM MONITOR</h3>
            <p className="text-sm text-steel-300 mb-4">
              Monitor all 60+ systems with adaptive detail levels
            </p>
            <button
              onClick={() => router.push('/systems')}
              className="btn-industrial"
            >
              VIEW SYSTEMS
            </button>
          </div>
        </BlueprintPanel>

        {/* Mailbox Quick Access */}
        <BlueprintPanel variant="glass">
          <div className="text-center py-8">
            <div className="text-6xl mb-4 relative">
              📬
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </div>
            <h3 className="text-xl font-industrial font-bold mb-2">MAILBOX</h3>
            <p className="text-sm text-steel-300 mb-4">
              {notificationCount > 0 
                ? `${notificationCount} escalations requiring human review`
                : 'No pending escalations'
              }
            </p>
            <button
              onClick={() => router.push('/mailbox')}
              className="btn-industrial"
            >
              OPEN MAILBOX
            </button>
          </div>
        </BlueprintPanel>
      </div>

      {/* Featured Systems Overview */}
      <BlueprintPanel title="🔧 FEATURED SYSTEMS" icon="⚙️">
        <div className="grid grid-cols-3 gap-4">
          {systemsOverview.map((system, index) => (
            <SystemCard
              key={index}
              system={system}
              onClick={() => handleSystemClick(system)}
            />
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/systems')}
            className="px-6 py-2 bg-blueprint-accent hover:bg-blueprint-light border-2 border-blueprint-light rounded font-industrial font-bold transition-all"
          >
            VIEW ALL {systemsOverview.length}+ SYSTEMS →
          </button>
        </div>
      </BlueprintPanel>

      {/* Recent Activity Stream */}
      <BlueprintPanel title="📋 RECENT ACTIVITY" icon="🔄" variant="glass">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            // Skeleton loader
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-steel-700 bg-opacity-30 rounded" />
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-steel-700 bg-opacity-30 rounded border-l-4 border-compliance-green"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-steel-300">[{activity.time}]</span>
                  <span className="text-sm font-body">{activity.event}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-construction-orange">{activity.system}</span>
                  <span className={`text-xl ${activity.status === 'success' ? 'text-compliance-green' : 'text-safety-yellow'}`}>
                    {activity.status === 'success' ? '✅' : '⚠️'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-steel-400">
              No recent activity
            </div>
          )}
        </div>
      </BlueprintPanel>
    </div>
  );
};

export default Dashboard;

