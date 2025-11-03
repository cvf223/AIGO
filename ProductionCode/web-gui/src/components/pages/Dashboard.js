import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Flex,
  Icon,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Link
} from '@chakra-ui/react';
import { FiTrendingUp, FiDollarSign, FiActivity, FiClock } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { useAgents } from '../../contexts/AgentContext';
import axios from 'axios';

const Dashboard = () => {
  const { selectedAgent } = useAgents();
  const [stats, setStats] = useState(null);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedAgent) return;
      
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        // Fetch agent stats
        const statsResponse = await axios.get(`${API_URL}/api/agent/${selectedAgent.id}/stats`);
        
        // Fetch recent opportunities
        const oppsResponse = await axios.get(
          `${API_URL}/api/opportunities?agent_id=${selectedAgent.id}&limit=5`
        );
        
        setStats(statsResponse.data);
        setRecentOpportunities(oppsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedAgent]);
  
  // Show loading state
  if (loading) {
    return (
      <Flex justify="center" align="center" h="500px" direction="column">
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text mt={4}>Loading dashboard data...</Text>
      </Flex>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" color="red.500" mb={2}>
          Error Loading Dashboard
        </Heading>
        <Text color="gray.600" mb={6}>
          {error}
        </Text>
        <Button colorScheme="blue" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }
  
  // Show message if no agent is selected
  if (!selectedAgent) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" mb={2}>
          Welcome to the Arbitrage Syndicate
        </Heading>
        <Text color="gray.600" mb={6}>
          Please select an agent from the dropdown above to view the dashboard.
        </Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading mb={6}>
        {selectedAgent.name} Dashboard
      </Heading>
      
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <Card>
          <CardBody>
            <Flex align="center">
              <Box 
                p={3} 
                bg="brand.500" 
                borderRadius="full" 
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={4}
              >
                <Icon as={FiDollarSign} boxSize={6} color="white" />
              </Box>
              <Stat>
                <StatLabel>Total Profit</StatLabel>
                <StatNumber>${stats?.totalProfit.toFixed(2) || "0.00"}</StatNumber>
                <StatHelpText>
                  <StatArrow type={stats?.profitChange >= 0 ? "increase" : "decrease"} />
                  {Math.abs(stats?.profitChange || 0).toFixed(2)}% (24h)
                </StatHelpText>
              </Stat>
            </Flex>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Flex align="center">
              <Box 
                p={3} 
                bg="green.500" 
                borderRadius="full" 
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={4}
              >
                <Icon as={FiTrendingUp} boxSize={6} color="white" />
              </Box>
              <Stat>
                <StatLabel>Success Rate</StatLabel>
                <StatNumber>{stats?.successRate || 0}%</StatNumber>
                <StatHelpText>
                  <StatArrow type={stats?.successRateChange >= 0 ? "increase" : "decrease"} />
                  {Math.abs(stats?.successRateChange || 0).toFixed(2)}% (24h)
                </StatHelpText>
              </Stat>
            </Flex>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Flex align="center">
              <Box 
                p={3} 
                bg="purple.500" 
                borderRadius="full" 
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={4}
              >
                <Icon as={FiActivity} boxSize={6} color="white" />
              </Box>
              <Stat>
                <StatLabel>Opportunities Found</StatLabel>
                <StatNumber>{stats?.opportunitiesCount || 0}</StatNumber>
                <StatHelpText>
                  <StatArrow type={stats?.opportunitiesChange >= 0 ? "increase" : "decrease"} />
                  {Math.abs(stats?.opportunitiesChange || 0)} (24h)
                </StatHelpText>
              </Stat>
            </Flex>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Flex align="center">
              <Box 
                p={3} 
                bg="orange.500" 
                borderRadius="full" 
                display="flex"
                alignItems="center"
                justifyContent="center"
                mr={4}
              >
                <Icon as={FiClock} boxSize={6} color="white" />
              </Box>
              <Stat>
                <StatLabel>Avg. Execution Time</StatLabel>
                <StatNumber>{stats?.avgExecutionTime || 0} ms</StatNumber>
                <StatHelpText>
                  <StatArrow type={stats?.executionTimeChange <= 0 ? "increase" : "decrease"} />
                  {Math.abs(stats?.executionTimeChange || 0).toFixed(2)} ms (24h)
                </StatHelpText>
              </Stat>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Recent Opportunities */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Recent Opportunities</Heading>
        </CardHeader>
        <CardBody>
          {recentOpportunities.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Timestamp</Th>
                    <Th>Type</Th>
                    <Th>Profit</Th>
                    <Th>Status</Th>
                    <Th>Execution Time</Th>
                    <Th>Details</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentOpportunities.map((opp) => (
                    <Tr key={opp.id}>
                      <Td>{new Date(opp.timestamp).toLocaleString()}</Td>
                      <Td>{opp.type}</Td>
                      <Td>${parseFloat(opp.profit).toFixed(2)}</Td>
                      <Td>
                        <Badge colorScheme={
                          opp.status === 'executed' ? 'green' :
                          opp.status === 'missed' ? 'red' : 'yellow'
                        }>
                          {opp.status}
                        </Badge>
                      </Td>
                      <Td>{opp.execution_time} ms</Td>
                      <Td>
                        <Link as={RouterLink} to={`/opportunities?id=${opp.id}`} color="brand.500">
                          View
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text color="gray.500" textAlign="center" py={4}>
              No recent opportunities found.
            </Text>
          )}
          
          <Flex justify="center" mt={4}>
            <Button 
              as={RouterLink} 
              to="/opportunities" 
              colorScheme="brand" 
              variant="outline"
            >
              View All Opportunities
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
