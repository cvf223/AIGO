import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { SocketProvider } from './contexts/SocketContext';
import { AgentProvider } from './contexts/AgentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Dashboard from './components/pages/Dashboard';
import OpportunitiesPage from './components/pages/OpportunitiesPage';
import LearningPage from './components/pages/LearningPage';
import ChatPage from './components/pages/ChatPage';
import InboxPage from './components/pages/InboxPage';
import SettingsPage from './components/pages/SettingsPage';

function App() {
  return (
    <SocketProvider>
      <NotificationProvider>
        <AgentProvider>
          <Box minH="100vh">
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/learning" element={<LearningPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </Box>
        </AgentProvider>
      </NotificationProvider>
    </SocketProvider>
  );
}

export default App;
