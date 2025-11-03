/**
 * 🧬 EVOLUTION TREE PAGE
 * =====================
 * 
 * Implements the EVOLUTION TREE page from 
 * COMPREHENSIVE_WEB_GUI_ARCHITECTURE.md
 * 
 * Features:
 * - Interactive evolution progression tree
 * - Clickable nodes for detailed evolution summaries
 * - Goal tracking with progress indicators
 * - Performance correlation with evolution steps
 * - Branching paths showing different strategies
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as d3 from 'd3';
import { 
    TreePine,
    Target,
    BarChart3,
    MessageSquare,
    TrendingUp,
    CheckCircle,
    Clock,
    Zap
} from 'lucide-react';

interface EvolutionNode {
    id: string;
    name: string;
    progress: number;
    status: 'completed' | 'in_progress' | 'planned' | 'failed';
    children?: EvolutionNode[];
    goalContribution?: number;
    performanceImpact?: number;
    evolutionSummary?: string;
    quantifiedImprovements?: any;
}

const Evolution: React.FC = () => {
    const { connected, agents } = useSocket();
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [selectedNode, setSelectedNode] = useState<EvolutionNode | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const svgRef = useRef<SVGSVGElement>(null);

    // Auto-select first agent
    useEffect(() => {
        if (agents.length > 0 && !selectedAgent) {
            setSelectedAgent(agents[0].id);
        }
    }, [agents, selectedAgent]);

    // Fetch evolution tree data
    const { data: evolutionData } = useQuery({
        queryKey: ['evolutionTree', selectedAgent],
        queryFn: async () => {
            if (!selectedAgent) return null;
            const response = await axios.get(`/api/evolution/tree/${selectedAgent}`);
            return response.data.data;
        },
        enabled: !!selectedAgent,
        refetchInterval: 30000
    });

    // Fetch evolution progress
    const { data: progressData } = useQuery({
        queryKey: ['evolutionProgress', selectedAgent],
        queryFn: async () => {
            if (!selectedAgent) return null;
            const response = await axios.get(`/api/evolution/progress/${selectedAgent}`);
            return response.data.data;
        },
        enabled: !!selectedAgent,
        refetchInterval: 30000
    });

    // D3.js tree visualization
    useEffect(() => {
        if (!evolutionData || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 600;
        
        // Clear previous content
        svg.selectAll('*').remove();
        
        // Create main group
        const g = svg.append('g')
            .attr('width', width)
            .attr('height', height);

        // Add zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 2])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Create tree layout
        const treeLayout = d3.tree<EvolutionNode>()
            .size([width - 200, height - 200]);

        // Create hierarchy
        const root = d3.hierarchy(evolutionData.tree?.root || createMockEvolutionTree());
        const treeData = treeLayout(root);

        // Draw links
        g.selectAll('.link')
            .data(treeData.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkVertical<any, any>()
                .x(d => d.x + 100)
                .y(d => d.y + 100)
            )
            .style('fill', 'none')
            .style('stroke', '#6b7280')
            .style('stroke-width', 2);

        // Draw nodes
        const nodeGroups = g.selectAll('.node')
            .data(treeData.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x + 100},${d.y + 100})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                setSelectedNode(d.data);
                setDialogOpen(true);
            });

        // Add circles for nodes
        nodeGroups.append('circle')
            .attr('r', 30)
            .style('fill', d => getNodeColor(d.data.status))
            .style('stroke', '#ffffff')
            .style('stroke-width', 2);

        // Add status icons
        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .style('fill', 'white')
            .style('font-size', '16px')
            .text(d => getStatusIcon(d.data.status));

        // Add labels
        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '50')
            .style('fill', '#e5e7eb')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(d => d.data.name.length > 20 ? d.data.name.substring(0, 18) + '...' : d.data.name);

        // Add progress indicators
        nodeGroups.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '65')
            .style('fill', '#9ca3af')
            .style('font-size', '10px')
            .text(d => `${d.data.progress}%`);

    }, [evolutionData]);

    const selectedAgentData = agents.find(agent => agent.id === selectedAgent);
    const currentGoalProgress = progressData?.currentGoal?.progress || 73;

    return (
        <div className="space-y-6 p-6">
            {/* 🏆 HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        🧬 EVOLUTION TREE
                    </h1>
                    <p className="text-muted-foreground">
                        Agent: {selectedAgentData?.name || 'Select an agent'}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select Agent" />
                        </SelectTrigger>
                        <SelectContent>
                            {agents.map((agent: any) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                    {agent.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 🎯 CURRENT GOAL STATUS */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">
                                🎯 CURRENT GOAL: Increase weekly profit generation by 45%
                            </h3>
                            <div className="flex items-center space-x-4 mt-2">
                                <span>Progress: {currentGoalProgress}%</span>
                                <Badge variant={currentGoalProgress > 70 ? 'default' : 'secondary'}>
                                    {currentGoalProgress > 70 ? '✅' : '🔄'}
                                </Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{currentGoalProgress}%</div>
                            <Progress value={currentGoalProgress} className="w-32" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold text-blue-500">8.7/10</div>
                            <div className="text-xs text-muted-foreground">Evolution Score</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold text-green-500">High</div>
                            <div className="text-xs text-muted-foreground">Adaptation Rate</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                            <div className="text-lg font-bold text-purple-500">+23%</div>
                            <div className="text-xs text-muted-foreground">Learning Velocity</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 🌳 EVOLUTION TREE VISUALIZATION */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <TreePine className="w-5 h-5" />
                        <span>Evolution Progression Tree</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative bg-black rounded-lg p-4">
                        <svg
                            ref={svgRef}
                            width="100%"
                            height="600"
                            viewBox="0 0 800 600"
                            style={{ background: '#0a0a0a' }}
                        >
                            {/* Background grid */}
                            <defs>
                                <pattern id="evolutionGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2937" strokeWidth="1" opacity="0.3"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#evolutionGrid)" />
                        </svg>

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-black/80 rounded p-3 text-xs">
                            <div className="font-semibold mb-2">Legend:</div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span>✅ Completed</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span>🔄 In Progress</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <span>📋 Planned</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span>❌ Failed</span>
                                </div>
                            </div>
                        </div>

                        {/* Loading state */}
                        {!evolutionData && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-muted-foreground">Loading evolution tree...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 📊 EVOLUTION STATISTICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Target className="w-5 h-5" />
                            <span>Goal Progress</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Opportunity Detection</span>
                                <Badge variant="default">+12% ✅</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Execution Efficiency</span>
                                <Badge variant="default">+18% ✅</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Risk Optimization</span>
                                <Badge variant="default">+15% ✅</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5" />
                            <span>Performance Impact</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Capital Efficiency</span>
                                <span className="text-green-500 font-medium">+28%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Risk-Adjusted Returns</span>
                                <span className="text-green-500 font-medium">+31%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Drawdown Reduction</span>
                                <span className="text-green-500 font-medium">-45%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5" />
                            <span>Recent Evolutions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Kelly Criterion Implementation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>Gas Optimization (In Progress)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Target className="w-4 h-4 text-yellow-500" />
                                <span>MEV Protection (Planned)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 📋 EVOLUTION NODE DETAILS DIALOG */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            🧬 EVOLUTION STEP: "{selectedNode?.name}"
                        </DialogTitle>
                    </DialogHeader>
                    {selectedNode && (
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Evolved</div>
                                    <div className="font-medium">January 28, 2025 09:14:32</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Goal Contribution</div>
                                    <div className="font-medium">+{selectedNode.goalContribution || 15}% towards weekly profit target</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Performance Impact</div>
                                    <div className="font-medium">+{selectedNode.performanceImpact || 23}% in position sizing accuracy</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Status</div>
                                    <Badge variant={selectedNode.status === 'completed' ? 'default' : 'secondary'}>
                                        {getStatusIcon(selectedNode.status)} {selectedNode.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            {/* Evolution Summary */}
                            <div>
                                <h4 className="font-semibold mb-2">📝 EVOLUTION SUMMARY:</h4>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                    {selectedNode.evolutionSummary || "Agent evolved to implement Kelly Criterion for optimal position sizing. Previous fixed-size trades were inefficient. New approach analyzes historical win rates and average returns to calculate mathematically optimal trade sizes. Result: 23% improvement in capital efficiency and 31% reduction in drawdowns."}
                                </p>
                            </div>

                            {/* Evolution Process */}
                            <div>
                                <h4 className="font-semibold mb-2">🔄 EVOLUTION PROCESS:</h4>
                                <div className="space-y-2">
                                    {[
                                        'Problem Identified: Suboptimal position sizing',
                                        'Research Phase: Analyzed 500+ historical trades',
                                        'Algorithm Development: Implemented Kelly formula adaptation',
                                        'Testing Phase: 100 simulated trades with 89% success',
                                        'Deployment: Gradual rollout over 72 hours',
                                        'Validation: 23% performance improvement confirmed'
                                    ].map((step, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <Badge variant="outline">{index + 1}</Badge>
                                            <span className="text-sm">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quantified Improvements */}
                            <div>
                                <h4 className="font-semibold mb-2">📊 QUANTIFIED IMPROVEMENTS:</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 border rounded">
                                        <div className="text-lg font-bold text-green-500">+34%</div>
                                        <div className="text-xs text-muted-foreground">Trade size optimization</div>
                                    </div>
                                    <div className="text-center p-3 border rounded">
                                        <div className="text-lg font-bold text-blue-500">+28%</div>
                                        <div className="text-xs text-muted-foreground">Capital utilization</div>
                                    </div>
                                    <div className="text-center p-3 border rounded">
                                        <div className="text-lg font-bold text-purple-500">+31%</div>
                                        <div className="text-xs text-muted-foreground">Risk-adjusted returns</div>
                                    </div>
                                    <div className="text-center p-3 border rounded">
                                        <div className="text-lg font-bold text-yellow-500">-45%</div>
                                        <div className="text-xs text-muted-foreground">Maximum drawdown</div>
                                    </div>
                                </div>
                            </div>

                            {/* Related Evolutions */}
                            <div>
                                <h4 className="font-semibold mb-2">🔗 RELATED EVOLUTIONS:</h4>
                                <div className="space-y-2">
                                    <div className="text-sm">• "Risk Optimization" (Parent goal)</div>
                                    <div className="text-sm">• "Gas Optimization" (Next planned evolution)</div>
                                    <div className="text-sm">• "Pattern Recognition" (Synergistic evolution)</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                <Button variant="outline">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    View Performance Data
                                </Button>
                                <Button variant="outline">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Discuss with Agent
                                </Button>
                                <Button variant="outline">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Suggest Improvements
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Helper functions
function getNodeColor(status: string): string {
    switch (status) {
        case 'completed': return '#10b981';
        case 'in_progress': return '#3b82f6';
        case 'planned': return '#f59e0b';
        case 'failed': return '#ef4444';
        default: return '#6b7280';
    }
}

function getStatusIcon(status: string): string {
    switch (status) {
        case 'completed': return '✅';
        case 'in_progress': return '🔄';
        case 'planned': return '📋';
        case 'failed': return '❌';
        default: return '⭕';
    }
}

function createMockEvolutionTree(): EvolutionNode {
    return {
        id: 'weekly-profit-45%',
        name: '+45% Weekly Profit Generation',
        progress: 73,
        status: 'in_progress',
        children: [
            {
                id: 'opportunity-detection',
                name: 'Opportunity Detection (+12%)',
                progress: 100,
                status: 'completed',
                children: [
                    { id: 'pattern-recognition', name: 'Pattern Recognition', progress: 100, status: 'completed' },
                    { id: 'multi-chain-sync', name: 'Multi Chain Sync', progress: 100, status: 'completed' }
                ]
            },
            {
                id: 'execution-efficiency',
                name: 'Execution Efficiency (+18%)',
                progress: 85,
                status: 'in_progress',
                children: [
                    { id: 'speed-optimization', name: 'Speed Optimization', progress: 100, status: 'completed' },
                    { id: 'gas-optimization', name: 'Gas Optimization', progress: 70, status: 'in_progress' }
                ]
            },
            {
                id: 'risk-optimization',
                name: 'Risk Optimization (+15%)',
                progress: 90,
                status: 'completed',
                children: [
                    { id: 'kelly-criterion', name: 'Kelly Criterion', progress: 100, status: 'completed' },
                    { id: 'mev-protection', name: 'MEV Protection', progress: 0, status: 'planned' }
                ]
            }
        ]
    };
}

export default Evolution;
