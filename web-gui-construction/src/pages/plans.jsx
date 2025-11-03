/**
 * 📋 PLAN REVIEW PAGE - Interactive Plan Editor & Approval
 * ========================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Plan presentation, editing,
 * reconsideration, and approval workflow
 */

import React, { useState } from 'react';
import BlueprintPanel from '../components/shared/BlueprintPanel';
import PlanEditor from '../components/humanloop/PlanEditor';

const PlansPage = () => {
  const [pendingPlans, setPendingPlans] = useState([
    {
      id: 'PLAN-2025-001',
      title: 'HOAI LP 6 - Ausführungsplanung Projekt München',
      type: 'hoai_lp6',
      status: 'pending_review',
      confidence: 0.94,
      agent: 'head-architect',
      created: Date.now() - 300000,
      sections: {
        lp6: {
          detailDrawings: '✅ Complete',
          specifications: '✅ Complete',
          calculations: '🔄 In Progress'
        },
        lp7: {
          tenderDocuments: '📋 Planned',
          billOfQuantities: '📋 Planned'
        }
      }
    }
  ]);

  const [selectedPlan, setSelectedPlan] = useState(null);

  const handlePlanAction = async (planId, action, data) => {
    try {
      const response = await fetch('http://localhost:3001/api/humanloop/approve-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          action,
          edits: data?.edits,
          reconsiderationPrompt: data?.reconsiderationPrompt
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove from pending list if approved/rejected
        if (action === 'approve' || action === 'reject') {
          setPendingPlans(pendingPlans.filter(p => p.id !== planId));
          setSelectedPlan(null);
        }
      }
    } catch (error) {
      console.error('Plan action failed:', error);
    }
  };

  return (
    <div className="plans-page space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-architectural text-compliance-green mb-2">
            📋 PLAN REVIEW WORKSPACE
          </h1>
          <p className="text-steel-300 font-body">
            Interactive plan editing and approval workflow
          </p>
        </div>
        
        <div className="px-4 py-2 bg-construction-orange rounded border-2 border-construction-orange">
          <span className="font-mono font-bold">{pendingPlans.length} PENDING REVIEW</span>
        </div>
      </div>

      {/* Pending Plans List */}
      <BlueprintPanel title="📋 PENDING PLANS" icon="📋">
        <div className="space-y-3">
          {pendingPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`
                p-4 rounded border-2 cursor-pointer transition-all
                ${selectedPlan?.id === plan.id
                  ? 'bg-blueprint-accent border-compliance-green'
                  : 'bg-steel-700 bg-opacity-30 border-steel-500 hover:border-compliance-green'}
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-industrial font-bold text-lg">{plan.title}</h3>
                  <p className="text-sm font-mono text-steel-400 mt-1">
                    {plan.id} | Agent: {plan.agent} | Confidence: {(plan.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-steel-400 mb-1">
                    {Math.floor((Date.now() - plan.created) / 60000)} minutes ago
                  </div>
                  <div className="px-3 py-1 bg-construction-orange rounded text-xs font-bold">
                    {plan.status.toUpperCase().replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pendingPlans.length === 0 && (
            <div className="text-center py-12 text-steel-400">
              <div className="text-6xl mb-4">✅</div>
              <div className="font-industrial text-2xl">ALL PLANS REVIEWED!</div>
              <div className="font-body mt-2">No plans pending review</div>
            </div>
          )}
        </div>
      </BlueprintPanel>

      {/* Plan Editor */}
      {selectedPlan && (
        <PlanEditor
          plan={selectedPlan}
          onAction={handlePlanAction}
        />
      )}
    </div>
  );
};

export default PlansPage;

