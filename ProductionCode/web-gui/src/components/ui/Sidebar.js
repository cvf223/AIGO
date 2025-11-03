import React from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text,
  Flex, 
  Icon,
  Link,
  Badge,
  Divider
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiTrendingUp, 
  FiBrain, 
  FiMessageCircle,
  FiMail, 
  FiSettings
} from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';

// Navigation items configuration
const NAV_ITEMS = [
  { name: 'Dashboard', icon: FiHome, path: '/' },
  { name: 'Opportunities', icon: FiTrendingUp, path: '/opportunities' },
  { name: 'Learning', icon: FiBrain, path: '/learning' },
  { name: 'Chat', icon: FiMessageCircle, path: '/chat' },
  { name: 'Inbox', icon: FiMail, path: '/inbox', hasNotification: true },
  { name: 'Settings', icon: FiSettings, path: '/settings' }
];

const Sidebar = () => {
  const location = useLocation();
  const { getTotalUnreadCount } = useNotifications();
  
  return (
    <Box 
      h="100%" 
      w="100%" 
      bg="brand.700" 
      color="white" 
      py={4}
      boxShadow="lg"
    >
      {/* Logo */}
      <Flex 
        direction="column" 
        align="center" 
        justify="center" 
        py={6} 
        mb={8}
      >
        <Heading size="lg" fontWeight="bold" textAlign="center">
          Arbitrage
        </Heading>
        <Heading size="lg" fontWeight="bold" textAlign="center">
          Syndicate
        </Heading>
        <Text fontSize="sm" opacity={0.8} mt={2}>
          AI Flash Loan System
        </Text>
      </Flex>
      
      <Divider opacity={0.2} my={4} />
      
      {/* Navigation */}
      <VStack spacing={1} align="stretch" px={4}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const unreadCount = item.hasNotification ? getTotalUnreadCount() : 0;
          
          return (
            <Link 
              as={RouterLink} 
              to={item.path}
              key={item.name}
              _hover={{ textDecoration: 'none' }}
            >
              <Flex
                align="center"
                p={3}
                borderRadius="md"
                bg={isActive ? 'brand.600' : 'transparent'}
                color={isActive ? 'white' : 'whiteAlpha.900'}
                fontWeight={isActive ? 'bold' : 'normal'}
                _hover={{ bg: isActive ? 'brand.600' : 'brand.600' }}
                transition="all 0.2s"
              >
                <Icon as={item.icon} boxSize={5} mr={3} />
                <Text>{item.name}</Text>
                
                {/* Notification badge */}
                {item.hasNotification && unreadCount > 0 && (
                  <Badge
                    ml="auto"
                    colorScheme="red"
                    borderRadius="full"
                    px={2}
                    className="notification-badge"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Flex>
            </Link>
          );
        })}
      </VStack>
      
      <Divider opacity={0.2} my={4} />
      
      <Box px={6} pt={6} fontSize="sm" textAlign="center" color="whiteAlpha.700">
        <Text>
          © {new Date().getFullYear()} Elite Agent Collective
        </Text>
        <Text mt={1}>
          Version 1.0.0
        </Text>
      </Box>
    </Box>
  );
};

export default Sidebar;
