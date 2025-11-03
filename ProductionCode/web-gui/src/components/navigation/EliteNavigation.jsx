import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * 🎯 ELITE NAVIGATION - BREATHTAKING SIDEBAR
 * =========================================
 */
const EliteNavigation = ({ currentTab, onTabChange, syndicateData }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    constitutional: true,
    advanced: true,
    intelligence: true,
    quantum: true,
    prevention: true,
    core: true
  });

  const navigationItems = [
    {
      section: 'constitutional',
      title: '👑 CONSTITUTIONAL SUPREMACY',
      items: [
        { path: '/constitutional-supremacy', title: 'Supreme Constitutional Framework', icon: '👑', badge: 'SUPREME' },
        { path: '/multi-token-supremacy', title: 'Multi-Token Prediction Supremacy', icon: '⚡', badge: 'REVOLUTIONARY' },
        { path: '/constitutional-creativity', title: 'Constitutional Creativity Excellence', icon: '🎨', badge: 'INNOVATION' },
        { path: '/supreme-prevention', title: 'Supreme Constitutional Prevention', icon: '🛡️', badge: 'IMMUNITY' },
        { path: '/proactive-decision-incentive', title: 'Proactive Decision & Incentive Orchestration', icon: '🎯', badge: 'STRATEGIC' },
        { path: '/deep-reasoning-research', title: 'Deep Reasoning & Research Command', icon: '🧠', badge: 'COGNITIVE' },
        { path: '/superior-connections', title: 'Superior System Connections Supremacy', icon: '🔗', badge: 'INTEGRATION' }
      ]
    },
    {
      section: 'advanced',
      title: '🚀 ADVANCED SYSTEMS',
      items: [
        { path: '/judge-alphacode', title: 'Judge & AlphaCode Excellence', icon: '⚖️', badge: 'VALIDATION' },
        { path: '/llm-gardener', title: 'LLM Nurturing Gardener Command', icon: '🌱', badge: 'EVOLUTION' },
        { path: '/quantum-collaboration', title: 'Quantum A2A Collaboration Excellence', icon: '🤝', badge: 'COLLECTIVE' },
        { path: '/local-llm-execution', title: 'Local LLM Execution Excellence', icon: '🤖', badge: 'EXECUTION' },
        { path: '/multi-token-decision', title: 'Multi-Token Decision Making Excellence', icon: '⚡', badge: 'SUPERINTELLIGENCE' },
        { path: '/creative-leap-thought', title: 'Creative Leap-of-Thought Command', icon: '🎯', badge: 'ALGORITHMIC' },
        { path: '/autoformalization-verification', title: 'Autoformalization Mathematical Verification', icon: '🧮', badge: 'MATHEMATICAL' },
        { path: '/formal-reasoning', title: 'Formal Reasoning Excellence', icon: '🧠', badge: 'MATHEMATICAL' },
        { path: '/workflow-evolution', title: 'Workflow Evolution & Enhancement Hub', icon: '🔄', badge: 'DYNAMIC' }
      ]
    },
    {
      section: 'intelligence',
      title: '🧠 SUPERINTELLIGENCE SYSTEMS',
      items: [
        { path: '/conclusions-memory', title: 'Conclusions & Memory Intelligence', icon: '🧠', badge: 'WISDOM' },
        { path: '/background-reasoning', title: 'Background Reasoning & Deep Thinking', icon: '🧠', badge: 'COGNITION' }
      ]
    },
    {
      section: 'quantum',
      title: '🌌 QUANTUM SYSTEMS',
      items: [
        { path: '/quantum-neural-networks', title: 'GNN & QNN Quantum Neural Excellence', icon: '🌌', badge: 'NEURAL' },
        { path: '/context-evolution', title: 'Context Engine Evolution Excellence', icon: '🧠', badge: 'EVOLUTION' },
        { path: '/quantum-mdp-es', title: 'MDP & ES Quantum Excellence', icon: '🌊', badge: 'DECISION' }
      ]
    },
    {
      section: 'prevention',
      title: '🛡️ PREVENTION SYSTEMS',
      items: [
        { path: '/proactive-prevention', title: 'Proactive Prevention Supremacy', icon: '🛡️', badge: 'THREAT' }
      ]
    },
    {
      section: 'core',
      title: '🏠 CORE SYNDICATE',
      items: [
        { path: '/dashboard', title: 'Elite Dashboard', icon: '📊', badge: 'OVERVIEW' },
        { path: '/opportunities', title: 'Opportunities Center', icon: '💼', badge: 'ARBITRAGE' }
      ]
    }
  ];

  const isPathActive = (path) => location.pathname === path;

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  return (
    <nav style={{
      width: '320px',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(30px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '2rem 0',
      overflowY: 'auto',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      {/* Elite Header */}
      <div style={{ 
        padding: '0 2rem', 
        marginBottom: '2rem', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ 
            fontSize: '2.5rem',
            filter: 'drop-shadow(0 0 20px #fbbf24)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            👑
          </div>
          <div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#fbbf24',
              lineHeight: '1.2'
            }}>
              Elite Arbitrage
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#fbbf24', 
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Syndicate
            </div>
          </div>
        </div>
        
        {/* Constitutional Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(251, 191, 36, 0.1)',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          <span style={{ color: '#fbbf24', fontSize: '0.875rem', fontWeight: '600' }}>
            🏛️ Constitutional: {(syndicateData.constitutionalHealth * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Elite Stats */}
      <div style={{ padding: '0 2rem', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem' 
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fbbf24' }}>
              {syndicateData.systemsMonitored}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              SYSTEMS
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fbbf24' }}>
              {syndicateData.activeConnections}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              CONNECTIONS
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Content */}
      <div style={{ flex: 1, padding: '0 1rem' }}>
        {navigationItems.map(({ section, title, items }) => (
          <div key={section} style={{ marginBottom: '1.5rem' }}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {title}
              </div>
              <span style={{ 
                transform: expandedSections[section] ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}>
                ▶
              </span>
            </button>

            {/* Section Items */}
            {expandedSections[section] && (
              <div style={{ paddingLeft: '1rem' }}>
                {items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => onTabChange(item.path.replace('/', ''))}
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      color: isPathActive(item.path) ? 'white' : 'rgba(255, 255, 255, 0.8)',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.75rem',
                      marginBottom: '0.25rem',
                      background: isPathActive(item.path) 
                        ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                        : 'transparent',
                      border: isPathActive(item.path) ? 'none' : '1px solid transparent',
                      transition: 'all 0.3s',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '500',
                          marginBottom: '0.25rem'
                        }}>
                          {item.title}
                        </div>
                        {item.badge && (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.625rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: item.badge === 'SUPREME' 
                              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                              : item.badge === 'REVOLUTIONARY'
                              ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Elite Footer */}
      <div style={{ 
        padding: '0 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '1.5rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Truth Rules:</span>
            <span style={{ fontWeight: '700', color: '#ef4444' }}>ABSOLUTE</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '0.5rem',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Synthetic Tolerance:</span>
            <span style={{ fontWeight: '700', color: '#f59e0b' }}>ZERO</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Constitutional Authority:</span>
            <span style={{ fontWeight: '700', color: '#fbbf24' }}>SUPREME</span>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <span style={{ 
            fontSize: '0.625rem',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            v1.0.0 Supreme Constitutional Edition
          </span>
        </div>
      </div>
    </nav>
  );
};

export default EliteNavigation;