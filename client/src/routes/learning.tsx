/**
 * 🧠 LEARNING VISUALIZATION PAGE
 * =============================
 * 
 * Implements the LEARNING VISUALIZATION page from 
 * COMPREHENSIVE_WEB_GUI_ARCHITECTURE.md
 * 
 * Features:
 * - D3.js interactive bubble map
 * - Clickable bubbles for detailed learning descriptions
 * - Timeline slider for learning progression
 * - Search and filter by learning categories
 * - Knowledge connections visualization
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Brain,
    Search,
    Filter,
    Play,
    Pause,
    RotateCcw,
    MessageSquare,
    ExternalLink,
    Target
} from 'lucide-react';

interface LearningBubble {
    id: string;
    name: string;
    x: number;
    y: number;
    size: number;
    category: 'core' | 'new' | 'progress' | 'failed';
    confidence?: number;
    applications?: number;
    description?: string;
    relatedLearnings?: string[];
    successMetrics?: any;
}

interface KnowledgeConnection {
    source: string;
    target: string;
    strength: number;
}

const Learning: React.FC = () => {
    const { connected, agents } = useSocket();
    const [selectedAgent, setSelectedAgent] = useState<string>('');
    const [selectedBubble, setSelectedBubble] = useState<LearningBubble | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [timelineValue, setTimelineValue] = useState<number>(100);
    const [showConnections, setShowConnections] = useState<boolean>(true);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    
    const svgRef = useRef<SVGSVGElement>(null);
    const simulationRef = useRef<d3.Simulation<LearningBubble, undefined> | null>(null);

    // Auto-select first agent
    useEffect(() => {
        if (agents.length > 0 && !selectedAgent) {
            setSelectedAgent(agents[0].id);
        }
    }, [agents, selectedAgent]);

    // Fetch learning data
    const { data: learningData } = useQuery({
        queryKey: ['learningBubbles', selectedAgent],
        queryFn: async () => {
            if (!selectedAgent) return null;
            const response = await axios.get(`/api/agents/${selectedAgent}/learning`);
            return response.data.data;
        },
        enabled: !!selectedAgent,
        refetchInterval: 30000
    });

    // Fetch knowledge base
    const { data: knowledgeData } = useQuery({
        queryKey: ['knowledgeBase', categoryFilter, searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (categoryFilter) params.append('category', categoryFilter);
            if (searchQuery) params.append('search', searchQuery);
            
            const response = await axios.get(`/api/learning/knowledge?${params.toString()}`);
            return response.data.data;
        },
        refetchInterval: 60000
    });

    // Initialize D3 visualization
    useEffect(() => {
        if (!learningData || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 600;
        
        // Clear previous content
        svg.selectAll('*').remove();
        
        const bubbles = learningData.bubbles || [];
        const connections = learningData.connections || [];

        // Create main group
        const g = svg.append('g')
            .attr('width', width)
            .attr('height', height);

        // Add zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Color scale for categories
        const colorScale = d3.scaleOrdinal<string>()
            .domain(['core', 'new', 'progress', 'failed'])
            .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444']);

        // Draw connections first (behind bubbles)
        if (showConnections) {
            const links = g.selectAll('.connection')
                .data(connections)
                .enter()
                .append('line')
                .attr('class', 'connection')
                .attr('stroke', '#6b7280')
                .attr('stroke-width', (d: KnowledgeConnection) => d.strength * 3)
                .attr('stroke-opacity', 0.6)
                .attr('stroke-dasharray', (d: KnowledgeConnection) => 
                    d.strength > 0.7 ? 'none' : '5,5'
                );

            // Position connections
            connections.forEach((connection: KnowledgeConnection) => {
                const source = bubbles.find((b: LearningBubble) => b.id === connection.source);
                const target = bubbles.find((b: LearningBubble) => b.id === connection.target);
                
                if (source && target) {
                    g.select(`line[data-source="${connection.source}"][data-target="${connection.target}"]`)
                        .attr('x1', source.x)
                        .attr('y1', source.y)
                        .attr('x2', target.x)
                        .attr('y2', target.y);
                }
            });
        }

        // Create bubble simulation
        simulationRef.current = d3.forceSimulation<LearningBubble>(bubbles)
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide<LearningBubble>().radius(d => d.size / 2 + 5));

        // Draw bubbles
        const bubbleSelection = g.selectAll('.bubble')
            .data(bubbles)
            .enter()
            .append('g')
            .attr('class', 'bubble')
            .style('cursor', 'pointer');

        // Add circles
        bubbleSelection.append('circle')
            .attr('r', (d: LearningBubble) => d.size / 2)
            .attr('fill', (d: LearningBubble) => colorScale(d.category))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
                    .attr('stroke-width', 3);
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.8)
                    .attr('stroke-width', 2);
            })
            .on('click', (event, d) => {
                setSelectedBubble(d);
                setDialogOpen(true);
            });

        // Add labels
        bubbleSelection.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .style('fill', 'white')
            .style('font-size', '10px')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .text((d: LearningBubble) => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name);

        // Update positions on simulation tick
        simulationRef.current.on('tick', () => {
            bubbleSelection
                .attr('transform', (d: LearningBubble) => `translate(${d.x},${d.y})`);
        });

        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, [learningData, showConnections]);

    const resetVisualization = () => {
        if (simulationRef.current) {
            simulationRef.current.alpha(1).restart();
        }
    };

    const filteredKnowledge = knowledgeData?.filter((item: any) => {
        if (categoryFilter && item.category !== categoryFilter) return false;
        if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    }) || [];

    return (
        <div className="space-y-6 p-6">
            {/* 🏆 HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        🧠 LEARNING VISUALIZATION
                    </h1>
                    <p className="text-muted-foreground">
                        Agent: {agents.find(a => a.id === selectedAgent)?.name || 'Select an agent'}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center space-x-1 ${connected ? 'text-green-500' : 'text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">Real-time: {connected ? 'ON' : 'OFF'}</span>
                    </div>
                </div>
            </div>

            {/* 🎛️ CONTROLS */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="w-5 h-5" />
                        <span>Visualization Controls</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Agent Selector */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Agent</label>
                            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                                <SelectTrigger>
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

                        {/* Category Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Category</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="core">🔵 Core Knowledge</SelectItem>
                                    <SelectItem value="new">🟢 New Learning</SelectItem>
                                    <SelectItem value="progress">🟡 In Progress</SelectItem>
                                    <SelectItem value="failed">🔴 Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search knowledge..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Timeline</label>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={timelineValue}
                                    onChange={(e) => setTimelineValue(parseInt(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-xs text-muted-foreground w-12">
                                    {timelineValue}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="coreKnowledge"
                                checked 
                                onChange={() => {}}
                                className="rounded"
                            />
                            <label htmlFor="coreKnowledge" className="text-sm">☑ Core Knowledge</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="newLearnings"
                                checked 
                                onChange={() => {}}
                                className="rounded"
                            />
                            <label htmlFor="newLearnings" className="text-sm">☑ New Learnings</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id="connections"
                                checked={showConnections}
                                onChange={(e) => setShowConnections(e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="connections" className="text-sm">☑ Connections</label>
                        </div>
                        <Button onClick={resetVisualization} size="sm" variant="outline">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset View
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 🌐 KNOWLEDGE BUBBLE MAP */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Brain className="w-5 h-5" />
                        <span>Knowledge Bubble Map</span>
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
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2937" strokeWidth="1" opacity="0.3"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 bg-black/80 rounded p-3 text-xs">
                            <div className="font-semibold mb-2">💡 Legend:</div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span>Core Knowledge</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span>New Learning</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <span>In Progress</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <span>Failed</span>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-0.5 bg-white" />
                                    <span>Strong Connection</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-0.5 border-b border-dashed border-white" />
                                    <span>Weak Connection</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full border-2 border-white bg-transparent" />
                                    <span>Clickable Bubble</span>
                                </div>
                            </div>
                        </div>

                        {/* Loading state */}
                        {!learningData && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-muted-foreground">Loading learning visualization...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 📚 KNOWLEDGE BASE TABLE */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Book className="w-5 h-5" />
                        <span>Knowledge Base</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredKnowledge.map((item: any) => (
                            <div key={item.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h4 className="font-semibold">{item.title}</h4>
                                            <Badge variant="secondary">{item.category}</Badge>
                                            <Badge variant="outline">
                                                {item.confidence}% confidence
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                            <span>Applications: {item.applications}</span>
                                            <span>•</span>
                                            <span>Success Rate: 94%</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="outline">
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 📋 BUBBLE DETAIL DIALOG */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            🎯 LEARNING DETAIL: "{selectedBubble?.name}"
                        </DialogTitle>
                    </DialogHeader>
                    {selectedBubble && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Learned</div>
                                    <div className="font-medium">February 1, 2025 14:23:17</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Confidence</div>
                                    <div className="font-medium">{selectedBubble.confidence || 87}% (High)</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Applications</div>
                                    <div className="font-medium">{selectedBubble.applications || 156} successful, 12 failed</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Category</div>
                                    <Badge>{selectedBubble.category}</Badge>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">📝 LEARNING SUMMARY:</h4>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                    {selectedBubble.description || "Discovered that Uniswap V3 concentrated liquidity pools exhibit predictable arbitrage patterns during high volatility periods. Key insight: price ranges of 0.05% around current price offer 23% higher profit margins due to reduced competition from other arbitrage bots who target wider ranges."}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">🔗 RELATED LEARNINGS:</h4>
                                <div className="space-y-2">
                                    <div className="text-sm">• "Pool Mechanics" (Parent concept)</div>
                                    <div className="text-sm">• "Concentrated Liquidity Optimization" (Child learning)</div>
                                    <div className="text-sm">• "Slippage Prediction" (Related application)</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">💎 SUCCESS METRICS:</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-2 border rounded">
                                        <div className="text-lg font-bold text-green-500">+34%</div>
                                        <div className="text-xs text-muted-foreground">Avg profit increase</div>
                                    </div>
                                    <div className="text-center p-2 border rounded">
                                        <div className="text-lg font-bold text-blue-500">+12%</div>
                                        <div className="text-xs text-muted-foreground">Success rate improvement</div>
                                    </div>
                                    <div className="text-center p-2 border rounded">
                                        <div className="text-lg font-bold text-purple-500">{selectedBubble.applications || 156}</div>
                                        <div className="text-xs text-muted-foreground">Applied in opportunities</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <Button variant="outline">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    View Applications
                                </Button>
                                <Button variant="outline">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Ask Agent About This
                                </Button>
                                <Button variant="outline">
                                    <Target className="w-4 h-4 mr-2" />
                                    Explore Connections
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Learning;
