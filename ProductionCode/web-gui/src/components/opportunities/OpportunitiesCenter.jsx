import React, { useState, useEffect } from 'react';

/**
 * 📊💎 OPPORTUNITIES CENTER
 * =======================
 * 
 * Elite Arbitrage Opportunities Hub featuring all opportunities tracking,
 * AI-powered opportunity calculator, and real-time execution monitoring
 * 
 * Source: web-gui/src/components/opportunities/OpportunitiesCenter.jsx
 */

const OpportunitiesCenter = () => {
  // 📊 OPPORTUNITIES STATE
  const [opportunitiesData, setOpportunitiesData] = useState({
    status: "ACTIVE",
    totalOpportunities: 2847,
    activeOpportunities: 156,
    avgProfitability: 0.234,
    totalProfitToday: 89234,
    liveOpportunities: [
      {
        id: "ARB-2025-001",
        type: "Cross-chain Arbitrage",
        chains: ["Ethereum", "Arbitrum"],
        tokens: ["USDC", "ETH"],
        profitPotential: 4567,
        gasOptimized: true,
        risk: "LOW",
        executionTime: "23s",
        constitutionalApproval: "APPROVED",
        confidence: 0.94
      },
      {
        id: "ARB-2025-002", 
        type: "MEV Sandwich Protection",
        chains: ["Polygon"],
        tokens: ["MATIC", "USDT"],
        profitPotential: 2340,
        gasOptimized: true,
        risk: "MEDIUM",
        executionTime: "15s",
        constitutionalApproval: "PENDING",
        confidence: 0.87
      },
      {
        id: "ARB-2025-003",
        type: "Flash Loan Optimization",
        chains: ["BSC"],
        tokens: ["BNB", "BUSD"],
        profitPotential: 6789,
        gasOptimized: false,
        risk: "HIGH",
        executionTime: "45s",
        constitutionalApproval: "UNDER_REVIEW",
        confidence: 0.78
      }
    ],
    opportunityCalculator: {
      inputParameters: {
        sourceChain: "Ethereum",
        targetChain: "Arbitrum",
        tokenPair: "ETH/USDC",
        amount: 100000,
        slippage: 0.5,
        gasPrice: 25
      },
      calculatedResults: {
        estimatedProfit: 3456,
        gasOptimization: 0.34,
        riskAssessment: "LOW",
        executionProbability: 0.92,
        timeToExecution: 18,
        constitutionalCompliance: true
      }
    },
    executionTracking: [
      {
        id: "EXE-2025-001",
        opportunity: "ARB-2025-001",
        status: "EXECUTING",
        progress: 67,
        estimatedCompletion: "12s",
        currentStep: "Liquidity Analysis",
        actualProfit: 0, // Will be filled on completion
        agent: "Elite-Developer"
      },
      {
        id: "EXE-2025-002",
        opportunity: "ARB-2025-004",
        status: "COMPLETED",
        progress: 100,
        estimatedCompletion: "0s",
        currentStep: "Profit Realization",
        actualProfit: 5234,
        agent: "AI-Prediction"
      }
    ],
    decisionAnalysis: {
      totalDecisions: 12847,
      successfulExecutions: 11234,
      averageProfit: 3456,
      riskMitigation: 0.94,
      constitutionalCompliance: 0.998
    }
  });

  const [selectedChain, setSelectedChain] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [calculatorMode, setCalculatorMode] = useState(false);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW': return '#10b981';
      case 'MEDIUM': return '#f59e0b';
      case 'HIGH': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'LOW': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'HIGH': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EXECUTING': return '#f59e0b';
      case 'COMPLETED': return '#10b981';
      case 'FAILED': return '#ef4444';
      case 'PENDING': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getApprovalColor = (approval) => {
    switch (approval) {
      case 'APPROVED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'UNDER_REVIEW': return '#8b5cf6';
      case 'REJECTED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="opportunities-center-container">
      {/* 👑 HEADER */}
      <div className="opportunities-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              📊 Opportunities Center
            </h1>
            <p className="subtitle">Elite Arbitrage Opportunities Hub</p>
          </div>
          <div className="status-indicators">
            <div className="status-badge status-active">
              ✅ ACTIVE
            </div>
            <div className="metric-badge">
              Opportunities: {opportunitiesData.totalOpportunities.toLocaleString()}
            </div>
            <div className="metric-badge">
              Active: {opportunitiesData.activeOpportunities}
            </div>
            <div className="metric-badge">
              Profit Today: ${opportunitiesData.totalProfitToday.toLocaleString()}
            </div>
            <div className="data-source-badge">
              📊 Mock Data - Backend Pending
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT GRID */}
      <div className="opportunities-main-grid">
        
        {/* 📊 ALL OPPORTUNITIES (QUANTUM-ENHANCED) */}
        <div className="opportunities-list-panel">
          <div className="panel-header">
            <h2>📊 All Opportunities (Quantum-Enhanced)</h2>
            <div className="opportunity-filters">
              <select 
                value={selectedChain} 
                onChange={(e) => setSelectedChain(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Chains</option>
                <option value="Ethereum">⚡ Ethereum</option>
                <option value="Arbitrum">🏹 Arbitrum</option>
                <option value="Polygon">🟣 Polygon</option>
                <option value="BSC">🟡 BSC</option>
              </select>
              <select 
                value={riskFilter} 
                onChange={(e) => setRiskFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Risk Levels</option>
                <option value="LOW">🟢 Low Risk</option>
                <option value="MEDIUM">🟡 Medium Risk</option>
                <option value="HIGH">🔴 High Risk</option>
              </select>
            </div>
          </div>
          
          <div className="opportunities-list">
            {opportunitiesData.liveOpportunities
              .filter(opp => (selectedChain === 'all' || opp.chains.includes(selectedChain)) &&
                           (riskFilter === 'all' || opp.risk === riskFilter))
              .map((opportunity, index) => (
              <div key={index} className="opportunity-card">
                <div className="opportunity-header">
                  <div className="opportunity-id">{opportunity.id}</div>
                  <div className="opportunity-type">{opportunity.type}</div>
                  <div className="opportunity-risk" style={{ color: getRiskColor(opportunity.risk) }}>
                    {getRiskIcon(opportunity.risk)} {opportunity.risk}
                  </div>
                </div>
                
                <div className="opportunity-details">
                  <div className="detail-row">
                    <span>Chains:</span>
                    <span className="chains-value">{opportunity.chains.join(' → ')}</span>
                  </div>
                  <div className="detail-row">
                    <span>Tokens:</span>
                    <span className="tokens-value">{opportunity.tokens.join('/')}</span>
                  </div>
                  <div className="detail-row">
                    <span>Profit Potential:</span>
                    <span className="profit-value">${opportunity.profitPotential.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Gas Optimized:</span>
                    <span className={opportunity.gasOptimized ? 'optimized-yes' : 'optimized-no'}>
                      {opportunity.gasOptimized ? '✅ YES' : '❌ NO'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Execution Time:</span>
                    <span className="time-value">{opportunity.executionTime}</span>
                  </div>
                  <div className="detail-row">
                    <span>Constitutional:</span>
                    <span style={{ color: getApprovalColor(opportunity.constitutionalApproval) }}>
                      {opportunity.constitutionalApproval}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Confidence:</span>
                    <span className="confidence-value">{(opportunity.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="opportunity-actions">
                  <button className="action-btn execute">🚀 Execute</button>
                  <button className="action-btn analyze">🔍 Analyze</button>
                  <button className="action-btn track">📊 Track</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔍 OPPORTUNITY CALCULATOR (AI-POWERED) */}
        <div className="calculator-panel">
          <div className="panel-header">
            <h2>🔍 Opportunity Calculator (AI-Powered)</h2>
            <div className="calculator-controls">
              <button 
                className={`calc-btn ${calculatorMode ? 'active' : ''}`}
                onClick={() => setCalculatorMode(!calculatorMode)}
              >
                🧮 Calculator
              </button>
            </div>
          </div>
          
          <div className="opportunity-calculator">
            <h3>⚡ Elite Opportunity Calculator</h3>
            
            <div className="calculator-inputs">
              <div className="input-group">
                <label>Source Chain:</label>
                <select className="calc-input">
                  <option value="ethereum">⚡ Ethereum</option>
                  <option value="arbitrum">🏹 Arbitrum</option>
                  <option value="polygon">🟣 Polygon</option>
                  <option value="bsc">🟡 BSC</option>
                </select>
              </div>
              
              <div className="input-group">
                <label>Target Chain:</label>
                <select className="calc-input">
                  <option value="arbitrum">🏹 Arbitrum</option>
                  <option value="polygon">🟣 Polygon</option>
                  <option value="bsc">🟡 BSC</option>
                </select>
              </div>
              
              <div className="input-group">
                <label>Token Pair:</label>
                <select className="calc-input">
                  <option value="eth-usdc">ETH/USDC</option>
                  <option value="btc-eth">BTC/ETH</option>
                  <option value="matic-usdt">MATIC/USDT</option>
                </select>
              </div>
              
              <div className="input-group">
                <label>Amount (USD):</label>
                <input type="number" className="calc-input" placeholder="100000" />
              </div>
              
              <div className="input-group">
                <label>Max Slippage (%):</label>
                <input type="number" className="calc-input" placeholder="0.5" step="0.1" />
              </div>
              
              <div className="input-group">
                <label>Gas Price (gwei):</label>
                <input type="number" className="calc-input" placeholder="25" />
              </div>
            </div>

            <button className="calculate-btn">🧮 Calculate Opportunity</button>

            <div className="calculated-results">
              <h4>📊 Calculated Results</h4>
              <div className="results-grid">
                <div className="result-item">
                  <span>Estimated Profit:</span>
                  <span className="profit-result">${opportunitiesData.opportunityCalculator.calculatedResults.estimatedProfit.toLocaleString()}</span>
                </div>
                <div className="result-item">
                  <span>Gas Optimization:</span>
                  <span className="gas-result">{(opportunitiesData.opportunityCalculator.calculatedResults.gasOptimization * 100).toFixed(1)}%</span>
                </div>
                <div className="result-item">
                  <span>Risk Assessment:</span>
                  <span style={{ color: getRiskColor(opportunitiesData.opportunityCalculator.calculatedResults.riskAssessment) }}>
                    {opportunitiesData.opportunityCalculator.calculatedResults.riskAssessment}
                  </span>
                </div>
                <div className="result-item">
                  <span>Execution Probability:</span>
                  <span className="prob-result">{(opportunitiesData.opportunityCalculator.calculatedResults.executionProbability * 100).toFixed(1)}%</span>
                </div>
                <div className="result-item">
                  <span>Time to Execution:</span>
                  <span className="time-result">{opportunitiesData.opportunityCalculator.calculatedResults.timeToExecution}s</span>
                </div>
                <div className="result-item">
                  <span>Constitutional:</span>
                  <span className={opportunitiesData.opportunityCalculator.calculatedResults.constitutionalCompliance ? 'compliant' : 'non-compliant'}>
                    {opportunitiesData.opportunityCalculator.calculatedResults.constitutionalCompliance ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Analysis */}
          <div className="decision-analysis">
            <h4>📈 Decision Analysis (Formal Reasoning)</h4>
            <div className="analysis-metrics">
              <div className="analysis-metric">
                <span>Total Decisions:</span>
                <span>{opportunitiesData.decisionAnalysis.totalDecisions.toLocaleString()}</span>
              </div>
              <div className="analysis-metric">
                <span>Successful Executions:</span>
                <span className="success-value">{opportunitiesData.decisionAnalysis.successfulExecutions.toLocaleString()}</span>
              </div>
              <div className="analysis-metric">
                <span>Average Profit:</span>
                <span className="profit-avg">${opportunitiesData.decisionAnalysis.averageProfit.toLocaleString()}</span>
              </div>
              <div className="analysis-metric">
                <span>Risk Mitigation:</span>
                <span className="risk-mitigation">{(opportunitiesData.decisionAnalysis.riskMitigation * 100).toFixed(1)}%</span>
              </div>
              <div className="analysis-metric">
                <span>Constitutional Compliance:</span>
                <span className="compliance-value">{(opportunitiesData.decisionAnalysis.constitutionalCompliance * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 🎯 EXECUTION TRACKING (REAL-TIME) */}
      <div className="execution-tracking-panel">
        <div className="panel-header">
          <h2>🎯 Execution Tracking (Real-time)</h2>
        </div>
        
        <div className="execution-list">
          {opportunitiesData.executionTracking.map((execution, index) => (
            <div key={index} className={`execution-item status-${execution.status.toLowerCase()}`}>
              <div className="execution-header">
                <div className="execution-id">{execution.id}</div>
                <div className="execution-opportunity">→ {execution.opportunity}</div>
                <div className="execution-status" style={{ color: getStatusColor(execution.status) }}>
                  {execution.status}
                </div>
              </div>
              
              <div className="execution-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${execution.progress}%` }}
                  ></div>
                </div>
                <div className="progress-details">
                  <span>Progress: {execution.progress}%</span>
                  <span>ETA: {execution.estimatedCompletion}</span>
                  <span>Step: {execution.currentStep}</span>
                </div>
              </div>

              <div className="execution-details">
                <div className="detail-item">
                  <span>Agent:</span>
                  <span className="agent-value">
                    {execution.agent === 'Elite-Developer' && '🎯'} 
                    {execution.agent === 'AI-Prediction' && '🧠'}
                    {execution.agent}
                  </span>
                </div>
                {execution.actualProfit > 0 && (
                  <div className="detail-item">
                    <span>Actual Profit:</span>
                    <span className="actual-profit">${execution.actualProfit.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .opportunities-center-container {
          background: linear-gradient(135deg, #065f46 0%, #047857 50%, #065f46 100%);
          color: white;
          min-height: 100vh;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
        }

        .opportunities-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.125rem;
          opacity: 0.8;
          margin: 0.5rem 0 0 0;
        }

        .status-indicators {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .status-badge, .metric-badge, .data-source-badge {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-active {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .metric-badge {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .data-source-badge {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        }

        .opportunities-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .opportunities-list-panel, .calculator-panel, .execution-tracking-panel {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .panel-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .opportunity-filters {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
        }

        .opportunities-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 600px;
          overflow-y: auto;
        }

        .opportunity-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .opportunity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .opportunity-id {
          font-weight: 600;
          color: #10b981;
          font-family: monospace;
        }

        .opportunity-type {
          font-weight: 600;
          color: #fbbf24;
        }

        .opportunity-risk {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .opportunity-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.25rem;
        }

        .detail-row span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .chains-value {
          color: #06b6d4;
          font-weight: 600;
        }

        .tokens-value {
          color: #8b5cf6;
          font-weight: 600;
        }

        .profit-value {
          color: #10b981;
          font-weight: 700;
        }

        .optimized-yes {
          color: #10b981;
          font-weight: 600;
        }

        .optimized-no {
          color: #ef4444;
          font-weight: 600;
        }

        .time-value {
          color: #f59e0b;
          font-weight: 600;
        }

        .confidence-value {
          color: #fbbf24;
          font-weight: 600;
        }

        .opportunity-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .action-btn.execute {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .action-btn.analyze {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .action-btn.track {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        .opportunity-calculator {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #10b981;
          margin-bottom: 1.5rem;
        }

        .opportunity-calculator h3 {
          margin: 0 0 1rem 0;
          color: #10b981;
        }

        .calculator-inputs {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .calc-input {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.25rem;
          color: white;
          font-size: 0.875rem;
        }

        .calculate-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 0.5rem;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          margin-bottom: 1rem;
        }

        .calculate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }

        .calculated-results {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .calculated-results h4 {
          margin: 0 0 1rem 0;
          color: #10b981;
        }

        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.25rem;
        }

        .result-item span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .profit-result {
          color: #10b981;
          font-weight: 700;
        }

        .gas-result {
          color: #06b6d4;
          font-weight: 600;
        }

        .prob-result {
          color: #fbbf24;
          font-weight: 600;
        }

        .time-result {
          color: #f59e0b;
          font-weight: 600;
        }

        .compliant {
          color: #10b981;
          font-weight: 600;
        }

        .non-compliant {
          color: #ef4444;
          font-weight: 600;
        }

        .decision-analysis {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .decision-analysis h4 {
          margin: 0 0 1rem 0;
          color: #3b82f6;
        }

        .analysis-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .analysis-metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.25rem;
        }

        .analysis-metric span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .success-value {
          color: #10b981;
          font-weight: 600;
        }

        .profit-avg {
          color: #fbbf24;
          font-weight: 600;
        }

        .risk-mitigation {
          color: #06b6d4;
          font-weight: 600;
        }

        .compliance-value {
          color: #fbbf24;
          font-weight: 700;
        }

        .execution-tracking-panel {
          grid-column: 1 / -1;
        }

        .execution-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
        }

        .execution-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          border-left: 4px solid #6b7280;
        }

        .execution-item.status-executing {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .execution-item.status-completed {
          border-left-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .execution-item.status-failed {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .execution-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .execution-id {
          font-weight: 600;
          color: #10b981;
          font-family: monospace;
        }

        .execution-opportunity {
          color: #8b5cf6;
          font-weight: 500;
        }

        .execution-status {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .execution-progress {
          margin-bottom: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-details {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          flex-wrap: wrap;
        }

        .progress-details span {
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
        }

        .execution-details {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .detail-item {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .detail-item span:first-child {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .agent-value {
          color: #06b6d4;
          font-weight: 600;
        }

        .actual-profit {
          color: #10b981;
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .opportunities-main-grid {
            grid-template-columns: 1fr;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .execution-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default OpportunitiesCenter;
