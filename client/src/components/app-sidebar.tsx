import info from "@/lib/info.json";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router";
import { 
    Book, 
    Cog, 
    User,
    Home,
    Briefcase,
    Brain,
    TreePine,
    Globe,
    MessageCircle,
    Settings,
    Shield,
    Clock,
    AlertTriangle,
    FileText,
    BarChart3,
    Zap,
    Target
} from "lucide-react";
import ConnectionStatus from "./connection-status";
import { useSocket } from "@/contexts/SocketContext";

export function AppSidebar() {
    const location = useLocation();
    const { connected, agents } = useSocket();
    
    const navigationItems = [
        {
            group: "MAIN",
            items: [
                { path: "/dashboard", icon: Home, label: "🏠 DASHBOARD", subLabel: "Agent Overview & Selection" }
            ]
        },
        {
            group: "OPPORTUNITIES",
            items: [
                { path: "/opportunities", icon: Briefcase, label: "📊 All Opportunities", subLabel: "Table View" },
                { path: "/opportunities/calculator", icon: Target, label: "🔍 Opportunity Calculator" },
                { path: "/opportunities/analysis", icon: BarChart3, label: "📈 Decision Analysis" },
                { path: "/opportunities/tracking", icon: Zap, label: "🎯 Execution Tracking" }
            ]
        },
        {
            group: "LEARNING",
            items: [
                { path: "/learning", icon: Brain, label: "🌐 Bubble Map Visualization" },
                { path: "/learning/knowledge", icon: Book, label: "📚 Knowledge Base" },
                { path: "/learning/connections", icon: Target, label: "🔗 Learning Connections" },
                { path: "/learning/history", icon: FileText, label: "📝 Learning History" }
            ]
        },
        {
            group: "EVOLUTION",
            items: [
                { path: "/evolution", icon: TreePine, label: "🌳 Evolution Tree" },
                { path: "/evolution/progress", icon: BarChart3, label: "📊 Performance Progress" },
                { path: "/evolution/goals", icon: Target, label: "🎯 Goal Tracking" },
                { path: "/evolution/analysis", icon: Brain, label: "🔬 Evolution Analysis" }
            ]
        },
        {
            group: "WORLD MODEL",
            items: [
                { path: "/world-model", icon: Globe, label: "🧠 Model Construction Progress" },
                { path: "/world-model/learnings", icon: Brain, label: "📚 Recent Learnings Integration" },
                { path: "/world-model/analysis", icon: BarChart3, label: "🔍 Approach Analysis" },
                { path: "/world-model/training", icon: Target, label: "📈 Training Metrics" },
                { path: "/world-model/accuracy", icon: Zap, label: "🎯 Model Accuracy Tracking" }
            ]
        },
        {
            group: "AGENT CHAT",
            items: [
                { path: "/agent-chat", icon: MessageCircle, label: "🤖 Direct Communication" },
                { path: "/inbox", icon: AlertTriangle, label: "📨 Human-in-Loop Inbox" },
                { path: "/discussions", icon: User, label: "🗣️ Collective Discussions (A2A)" },
                { path: "/cache", icon: Brain, label: "💾 LLM Translation Cache" },
                { path: "/tasks", icon: Target, label: "📋 Task Management" }
            ]
        },
        {
            group: "HUMAN CONTROL",
            items: [
                { path: "/human-control", icon: Settings, label: "🚨 Circuit Breaker Controls" },
                { path: "/control/settings", icon: Cog, label: "⚙️ Syndicate Settings" },
                { path: "/control/training", icon: Brain, label: "🎯 Training Mode Controls" },
                { path: "/control/risk", icon: Shield, label: "💰 Risk Management Overrides" },
                { path: "/control/behavior", icon: User, label: "🔧 Agent Behavior Settings" },
                { path: "/control/thresholds", icon: BarChart3, label: "📊 Performance Thresholds" },
                { path: "/control/emergency", icon: AlertTriangle, label: "🚫 Emergency Stop" }
            ]
        },
        {
            group: "SYSTEM",
            items: [
                { path: "/system/config", icon: Cog, label: "🔧 Configuration" },
                { path: "/system/monitor", icon: BarChart3, label: "📊 Performance Monitor" },
                { path: "/system/breakers", icon: AlertTriangle, label: "🚨 Circuit Breakers" },
                { path: "/system/risk", icon: Shield, label: "🛡️ Risk Management" },
                { path: "/mev-protection", icon: Zap, label: "🚀 MEV Protection Center" }
            ]
        },
        {
            group: "ANALYTICS",
            items: [
                { path: "/timing-analytics", icon: Clock, label: "⏱️ Timing Analytics" },
                { path: "/escalations", icon: AlertTriangle, label: "🆘 Escalations & Controls" },
                { path: "/system-logs", icon: FileText, label: "📊 System Logs" }
            ]
        }
    ];

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <NavLink to="/dashboard">
                                <img
                                    alt="elite-syndicate-icon"
                                    src="/elizaos-icon.png"
                                    width="100%"
                                    height="100%"
                                    className="size-7"
                                />

                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">
                                        Elite Syndicate
                                    </span>
                                    <span className="text-xs">v{info?.version}</span>
                                </div>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {navigationItems.map((section) => (
                    <SidebarGroup key={section.group}>
                        <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => (
                                    <SidebarMenuItem key={item.path}>
                                        <NavLink to={item.path}>
                                            <SidebarMenuButton
                                                isActive={location.pathname === item.path}
                                                className="w-full justify-start"
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span className="text-xs">{item.label}</span>
                                            </SidebarMenuButton>
                                        </NavLink>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}

                {/* 🤖 ACTIVE AGENTS SECTION */}
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <div className="flex items-center justify-between w-full">
                            <span>ACTIVE AGENTS</span>
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {agents.slice(0, 8).map((agent: any) => (
                                <SidebarMenuItem key={agent.id}>
                                    <NavLink to={`/chat/${agent.id}`}>
                                        <SidebarMenuButton
                                            isActive={location.pathname.includes(agent.id)}
                                            className="w-full justify-start"
                                        >
                                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                                agent.status === 'online' ? 'bg-green-500' :
                                                agent.status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`} />
                                            <span className="text-xs truncate">
                                                {agent.name.replace('Agent-', '').replace('-', ' ')}
                                            </span>
                                        </SidebarMenuButton>
                                    </NavLink>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <NavLink
                            to="https://elizaos.github.io/eliza/docs/intro/"
                            target="_blank"
                        >
                            <SidebarMenuButton>
                                <Book className="w-4 h-4" /> 
                                <span className="text-xs">Documentation</span>
                            </SidebarMenuButton>
                        </NavLink>
                    </SidebarMenuItem>
                    <ConnectionStatus />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
