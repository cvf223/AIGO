import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./routes/chat";
import Overview from "./routes/overview";
import useVersion from "./hooks/use-version";

// 🎯 ELITE ARBITRAGE SYNDICATE PAGES
import Dashboard from "./routes/dashboard";
import Opportunities from "./routes/opportunities";
import Learning from "./routes/learning";
import Evolution from "./routes/evolution";
import WorldModel from "./routes/world-model";
import AgentChat from "./routes/agent-chat";
import HumanControl from "./routes/human-control";
import MEVProtection from "./routes/mev-protection";
import TimingAnalytics from "./routes/timing-analytics";
import Escalations from "./routes/escalations";
import SystemLogs from "./routes/system-logs";

// 🔌 Socket.IO Context Provider
import { SocketProvider } from "./contexts/SocketContext";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000, // 30 seconds
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    useVersion();
    return (
        <QueryClientProvider client={queryClient}>
            <SocketProvider>
                <div
                    className="dark antialiased"
                    style={{
                        colorScheme: "dark",
                    }}
                >
                    <BrowserRouter>
                        <TooltipProvider delayDuration={0}>
                            <SidebarProvider>
                                <AppSidebar />
                                <SidebarInset>
                                    <div className="flex flex-1 flex-col gap-4 size-full container">
                                        <Routes>
                                            {/* 🏠 DASHBOARD ROUTES */}
                                            <Route path="/" element={<Dashboard />} />
                                            <Route path="/dashboard" element={<Dashboard />} />
                                            
                                            {/* 💼 OPPORTUNITIES ROUTES */}
                                            <Route path="/opportunities" element={<Opportunities />} />
                                            
                                            {/* 🧠 LEARNING ROUTES */}
                                            <Route path="/learning" element={<Learning />} />
                                            
                                            {/* 🧬 EVOLUTION ROUTES */}
                                            <Route path="/evolution" element={<Evolution />} />
                                            
                                            {/* 🌍 WORLD MODEL ROUTES */}
                                            <Route path="/world-model" element={<WorldModel />} />
                                            
                                            {/* 💬 AGENT CHAT ROUTES */}
                                            <Route path="/agent-chat" element={<AgentChat />} />
                                            <Route path="/chat/:agentId" element={<Chat />} />
                                            
                                            {/* 🎛️ HUMAN CONTROL ROUTES */}
                                            <Route path="/human-control" element={<HumanControl />} />
                                            <Route path="/control" element={<HumanControl />} />
                                            
                                            {/* 🚀 MEV PROTECTION ROUTES */}
                                            <Route path="/mev-protection" element={<MEVProtection />} />
                                            
                                            {/* ⏱️ TIMING ANALYTICS ROUTES */}
                                            <Route path="/timing-analytics" element={<TimingAnalytics />} />
                                            
                                            {/* 🆘 ESCALATIONS ROUTES */}
                                            <Route path="/escalations" element={<Escalations />} />
                                            
                                            {/* 📊 SYSTEM ROUTES */}
                                            <Route path="/system-logs" element={<SystemLogs />} />
                                            <Route path="/settings/:agentId" element={<Overview />} />
                                        </Routes>
                                    </div>
                                </SidebarInset>
                            </SidebarProvider>
                            <Toaster />
                        </TooltipProvider>
                    </BrowserRouter>
                </div>
            </SocketProvider>
        </QueryClientProvider>
    );
}

export default App;
