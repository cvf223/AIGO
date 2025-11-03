/**
 * 🏗️ CONSTRUCTION LAYOUT - Main Application Layout
 * =================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Elite construction-themed layout
 * with blueprint grid, steel frame navigation, and industrial aesthetic
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ConstructionLayout = ({ children }) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(23);
  const [currentTime, setCurrentTime] = useState('');

  const navigationItems = [
    { icon: '🏗️', label: 'Dashboard', path: '/' },
    { icon: '💬', label: 'LLM Chat', path: '/chat' },
    { icon: '📊', label: 'System Monitor', path: '/systems' },
    { icon: '🎨', label: 'Real Analysis', path: '/real-analysis' },
    { icon: '📬', label: 'Mailbox', path: '/mailbox', badge: 12 },
    { icon: '🔔', label: 'Notifications', path: '/notifications', badge: notifications },
    { icon: '📋', label: 'Plan Review', path: '/plans' },
    { icon: '🏗️', label: 'Projects', path: '/projects' },
    { icon: '⚙️', label: 'Settings', path: '/settings' }
  ];

  // Fix hydration issue - update time only on client
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="construction-layout min-h-screen bg-blueprint-dark">
      {/* Blueprint grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full bg-blueprint-grid" 
             style={{
               backgroundImage: `
                 linear-gradient(to right, rgba(20, 66, 114, 0.3) 1px, transparent 1px),
                 linear-gradient(to bottom, rgba(20, 66, 114, 0.3) 1px, transparent 1px)
               `,
               backgroundSize: '40px 40px'
             }} />
      </div>

      {/* Header - Blueprint Ruler Style */}
      <header className="relative z-10 bg-blueprint-dark border-b-3 border-steel">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🏗️</div>
            <div>
              <h1 className="text-2xl font-industrial font-bold text-glow bg-gradient-to-r from-compliance-green to-construction-orange bg-clip-text text-transparent">
                CONSTRUCTION SYNDICATE
              </h1>
              <p className="text-sm text-steel-300 font-body">
                HOAI LP 6 & 7 Elite Command Center
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-steel-700 rounded border border-steel-500">
              <div className="w-3 h-3 rounded-full bg-compliance-green animate-pulse-slow" />
              <span className="text-sm font-mono">ALL SYSTEMS OPERATIONAL</span>
            </div>
            
            <div className="px-4 py-2 bg-blueprint-light rounded border border-blueprint-accent">
              <span className="text-sm font-mono">30 Plans Processing</span>
            </div>
            
            <div className="px-4 py-2 bg-construction-orange rounded border border-construction-orange">
              <span className="text-sm font-mono font-bold">98.7% Compliance</span>
            </div>
          </div>
        </div>

        {/* Ruler measurement line */}
        <div className="ruler-line h-2 bg-blueprint-grid"></div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar Navigation - Steel Frame */}
        <aside className={`
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          bg-steel-700 border-r-3 border-steel-500 
          transition-all duration-300 ease-in-out
          min-h-screen
        `}>
          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full p-4 text-center hover:bg-steel-600 transition-colors border-b border-steel-500"
          >
            <span className="text-2xl">{sidebarCollapsed ? '→' : '←'}</span>
          </button>

          {/* Navigation Items */}
          <nav className="mt-4">
            {navigationItems.map((item, index) => {
              const isActive = router.pathname === item.path;
              
              return (
                <Link key={index} href={item.path}>
                  <div className={`
                    flex items-center px-4 py-3 cursor-pointer
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-blueprint-accent border-l-4 border-compliance-green text-compliance-green' 
                      : 'hover:bg-steel-600 border-l-4 border-transparent'}
                    relative
                  `}>
                    <span className="text-2xl mr-3">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="font-industrial font-semibold">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="notification-badge ml-auto">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && item.badge > 0 && (
                      <span className="notification-badge">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* System Health Mini Panel */}
          {!sidebarCollapsed && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="blueprint-panel p-3">
                <div className="text-xs font-mono mb-2 text-steel-300">SYSTEM HEALTH</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU</span>
                    <span className="text-compliance-green">67%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span className="text-compliance-green">2.1GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span className="text-compliance-green">4h 23m</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 min-h-screen">
          {children}
        </main>
      </div>

      {/* Footer - Construction Site Notice */}
      <footer className="relative z-10 bg-steel-700 border-t-3 border-steel-500 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-steel-300">
          <div className="flex items-center space-x-4">
            <span className="font-mono">🏗️ Construction Syndicate v1.0.0</span>
            <span className="font-mono">Elite AI Framework</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono">Connected Agents: 3</span>
            <span className="font-mono">Active Projects: 5</span>
            <span className="font-mono" suppressHydrationWarning>{currentTime || '--:--:--'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConstructionLayout;

