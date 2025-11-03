import React from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Select, 
  HStack, 
  IconButton, 
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { 
  BellIcon, 
  SettingsIcon 
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAgents } from '../../contexts/AgentContext';
import { useNotifications } from '../../contexts/NotificationContext';

const Header = () => {
  const navigate = useNavigate();
  const { agents, selectedAgent, selectAgent, loading } = useAgents();
  const { notifications, getTotalUnreadCount } = useNotifications();
  
  // Handle agent selection change
  const handleAgentChange = (e) => {
    const agentId = parseInt(e.target.value);
    selectAgent(agentId);
  };

  // Navigate to inbox when notification bell is clicked
  const handleNotificationClick = () => {
    navigate('/inbox');
  };

  // Navigate to settings when settings icon is clicked
  const handleSettingsClick = () => {
    navigate('/settings');
  };
  
  // Get total unread notifications
  const unreadCount = getTotalUnreadCount();
  
  return (
    <Flex 
      justify="space-between" 
      align="center" 
      h="100%" 
      px={6}
    >
      {/* Agent selector */}
      <Box>
        <Heading size="sm" mb={1} color="gray.500">
          Selected Agent
        </Heading>
        <Select 
          placeholder={loading ? "Loading agents..." : "Select an agent"} 
          isDisabled={loading || agents.length === 0}
          value={selectedAgent?.id || ""}
          onChange={handleAgentChange}
          width="300px"
        >
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </Select>
      </Box>
      
      {/* Right side icons */}
      <HStack spacing={4}>
        <Tooltip label="Notifications">
          <Box position="relative">
            <IconButton
              aria-label="View notifications"
              icon={<BellIcon />}
              variant="ghost"
              onClick={handleNotificationClick}
            />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-2px"
                right="-2px"
                borderRadius="full"
                bg="red.500"
                color="white"
                boxSize="18px"
                fontSize="xs"
                display="flex"
                alignItems="center"
                justifyContent="center"
                className="notification-badge"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Box>
        </Tooltip>
        
        <Tooltip label="Settings">
          <IconButton
            aria-label="Settings"
            icon={<SettingsIcon />}
            variant="ghost"
            onClick={handleSettingsClick}
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
};

export default Header;
