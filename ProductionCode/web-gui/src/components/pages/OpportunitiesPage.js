import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Link,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Divider,
  useDisclosure,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { FiExternalLink, FiFilter, FiChevronLeft, FiChevronRight, FiSearch, FiInfo } from 'react-icons/fi';
import { useAgents } from '../../contexts/AgentContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OpportunitiesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedAgent } = useAgents();
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    minProfit: '',
    maxProfit: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  
  // Modal for opportunity details
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Parse opportunity ID from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oppId = params.get('id');
    
    if (oppId) {
      fetchOpportunityDetails(oppId);
    }
  }, [location.search]);
  
  // Fetch opportunities when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      fetchOpportunities();
    }
  }, [selectedAgent]);
  
  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [filters, opportunities]);
  
  // Fetch all opportunities
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/opportunities${
        selectedAgent ? `?agent_id=${selectedAgent.id}` : ''
      }`);
      
      setOpportunities(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to fetch opportunities. Please try again later.');
      setLoading(false);
    }
  };
  
  // Fetch details for a specific opportunity
  const fetchOpportunityDetails = async (id) => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/opportunity/${id}`);
      
      setSelectedOpportunity(response.data);
      onOpen();
      setLoading(false);
    } catch (err) {
      console.error('Error fetching opportunity details:', err);
      setError('Failed to fetch opportunity details. Please try again later.');
      setLoading(false);
    }
  };
  
  // Apply filters to opportunities
  const applyFilters = () => {
    let filtered = [...opportunities];
    
    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(opp => opp.status === filters.status);
    }
    
    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(opp => opp.type === filters.type);
    }
    
    // Filter by min profit
    if (filters.minProfit) {
      filtered = filtered.filter(opp => parseFloat(opp.profit) >= parseFloat(filters.minProfit));
    }
    
    // Filter by max profit
    if (filters.maxProfit) {
      filtered = filtered.filter(opp => parseFloat(opp.profit) <= parseFloat(filters.maxProfit));
    }
    
    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(opp => new Date(opp.timestamp) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(opp => new Date(opp.timestamp) <= endDate);
    }
    
    // Filter by search text (matches any field as string)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(opp => 
        Object.values(opp).some(
          value => 
            value && 
            typeof value === 'string' && 
            value.toLowerCase().includes(searchLower)
        )
      );
    }
    
    setFilteredOpportunities(filtered);
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPageIndex(0);  // Reset to first page on filter change
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      type: '',
      minProfit: '',
      maxProfit: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setPageIndex(0);
  };
  
  // Calculate pagination values
  const pageCount = Math.ceil(filteredOpportunities.length / pageSize);
  const pageOptions = [];
  for (let i = 1; i <= pageCount; i++) {
    pageOptions.push(i);
  }
  
  // Get current page of opportunities
  const paginatedOpportunities = useMemo(() => {
    const startIndex = pageIndex * pageSize;
    return filteredOpportunities.slice(startIndex, startIndex + pageSize);
  }, [filteredOpportunities, pageIndex, pageSize]);
  
  // View opportunity details
  const viewOpportunityDetails = (opp) => {
    setSelectedOpportunity(opp);
    onOpen();
    
    // Update URL with opportunity ID
    navigate(`/opportunities?id=${opp.id}`);
  };
  
  // Close modal and reset URL
  const handleModalClose = () => {
    onClose();
    navigate('/opportunities');
  };
  
  // Show loading state
  if (loading && !opportunities.length) {
    return (
      <Flex justify="center" align="center" h="500px" direction="column">
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text mt={4}>Loading opportunities...</Text>
      </Flex>
    );
  }
  
  // Show error state
  if (error && !opportunities.length) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" color="red.500" mb={2}>
          Error Loading Opportunities
        </Heading>
        <Text color="gray.600" mb={6}>
          {error}
        </Text>
        <Button colorScheme="blue" onClick={fetchOpportunities}>
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading mb={6}>Opportunities</Heading>
      
      {/* Filters */}
      <Card mb={6}>
        <CardHeader>
          <Flex align="center">
            <Icon as={FiFilter} mr={2} />
            <Heading size="md">Filters</Heading>
          </Flex>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
                placeholder="All Statuses"
              >
                <option value="executed">Executed</option>
                <option value="missed">Missed</option>
                <option value="pending">Pending</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select 
                name="type" 
                value={filters.type} 
                onChange={handleFilterChange}
                placeholder="All Types"
              >
                <option value="flashloan">Flash Loan</option>
                <option value="direct">Direct Swap</option>
                <option value="multihop">Multihop</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Search</FormLabel>
              <Input 
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search transactions, tokens..."
                leftIcon={<FiSearch />}
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Min Profit ($)</FormLabel>
              <Input 
                name="minProfit"
                value={filters.minProfit}
                onChange={handleFilterChange}
                type="number"
                placeholder="0.00"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Max Profit ($)</FormLabel>
              <Input 
                name="maxProfit"
                value={filters.maxProfit}
                onChange={handleFilterChange}
                type="number"
                placeholder="10000.00"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Date Range</FormLabel>
              <Flex gap={2}>
                <Input 
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  type="date"
                />
                <Input 
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  type="date"
                />
              </Flex>
            </FormControl>
          </SimpleGrid>
          
          <Flex justify="flex-end" mt={4}>
            <Button 
              colorScheme="gray" 
              mr={3}
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
          </Flex>
        </CardBody>
      </Card>
      
      {/* Results */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">
              Results ({filteredOpportunities.length} opportunities found)
            </Heading>
            <Select 
              w="100px" 
              size="sm" 
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
          </Flex>
        </CardHeader>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Timestamp</Th>
                  <Th>Type</Th>
                  <Th>Profit</Th>
                  <Th>Status</Th>
                  <Th>Execution Time</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedOpportunities.length > 0 ? (
                  paginatedOpportunities.map((opp) => (
                    <Tr key={opp.id}>
                      <Td>{opp.id}</Td>
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
                        <Button 
                          size="sm" 
                          colorScheme="brand" 
                          onClick={() => viewOpportunityDetails(opp)}
                        >
                          Details
                        </Button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={4}>
                      No opportunities match your filters.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
          
          {/* Pagination */}
          {filteredOpportunities.length > 0 && (
            <Flex justify="space-between" align="center" mt={4}>
              <Text fontSize="sm">
                Showing {pageIndex * pageSize + 1} to {
                  Math.min((pageIndex + 1) * pageSize, filteredOpportunities.length)
                } of {filteredOpportunities.length} opportunities
              </Text>
              
              <HStack>
                <Button
                  size="sm"
                  onClick={() => setPageIndex(pageIndex - 1)}
                  isDisabled={pageIndex === 0}
                  leftIcon={<FiChevronLeft />}
                >
                  Previous
                </Button>
                
                <Select
                  size="sm"
                  w="70px"
                  value={pageIndex + 1}
                  onChange={(e) => setPageIndex(Number(e.target.value) - 1)}
                >
                  {pageOptions.map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </Select>
                
                <Text fontSize="sm">of {pageCount}</Text>
                
                <Button
                  size="sm"
                  onClick={() => setPageIndex(pageIndex + 1)}
                  isDisabled={pageIndex === pageCount - 1 || pageCount === 0}
                  rightIcon={<FiChevronRight />}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </CardBody>
      </Card>
      
      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <Modal isOpen={isOpen} onClose={handleModalClose} size="xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Opportunity Details #{selectedOpportunity.id}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="sm" mb={2}>Overview</Heading>
                  <SimpleGrid columns={2} spacing={2}>
                    <Text fontWeight="bold">Type:</Text>
                    <Text>{selectedOpportunity.type}</Text>
                    
                    <Text fontWeight="bold">Status:</Text>
                    <Badge colorScheme={
                      selectedOpportunity.status === 'executed' ? 'green' :
                      selectedOpportunity.status === 'missed' ? 'red' : 'yellow'
                    }>
                      {selectedOpportunity.status}
                    </Badge>
                    
                    <Text fontWeight="bold">Profit:</Text>
                    <Text>${parseFloat(selectedOpportunity.profit).toFixed(2)}</Text>
                    
                    <Text fontWeight="bold">Execution Time:</Text>
                    <Text>{selectedOpportunity.execution_time} ms</Text>
                    
                    <Text fontWeight="bold">Timestamp:</Text>
                    <Text>{new Date(selectedOpportunity.timestamp).toLocaleString()}</Text>
                  </SimpleGrid>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={2}>Route Details</Heading>
                  <VStack spacing={2} align="stretch">
                    {selectedOpportunity.route?.map((step, index) => (
                      <Card key={index} variant="outline" size="sm">
                        <CardBody>
                          <HStack justifyContent="space-between">
                            <VStack align="start" spacing={1}>
                              <Flex align="center">
                                <Text fontWeight="bold" mr={1}>Step {index + 1}:</Text>
                                <Text>
                                  {step.token_in} → {step.token_out}
                                </Text>
                              </Flex>
                              <Text fontSize="sm" color="gray.600">
                                Via {step.dex_name}
                              </Text>
                            </VStack>
                            
                            <Badge>{step.amount_change > 0 ? '+' : ''}{step.amount_change.toFixed(6)}</Badge>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={2}>Decision Making</Heading>
                  <SimpleGrid columns={2} spacing={2}>
                    <Text fontWeight="bold">Confidence Score:</Text>
                    <Text>{selectedOpportunity.decision?.confidence_score.toFixed(2)}%</Text>
                    
                    <Text fontWeight="bold">Risk Assessment:</Text>
                    <Text>{selectedOpportunity.decision?.risk_assessment}</Text>
                    
                    <Text fontWeight="bold">Market Conditions:</Text>
                    <Text>{selectedOpportunity.decision?.market_conditions}</Text>
                  </SimpleGrid>
                  
                  {selectedOpportunity.decision?.factors && (
                    <Box mt={3}>
                      <Text fontWeight="bold" mb={1}>Decision Factors:</Text>
                      <VStack align="stretch">
                        {Object.entries(selectedOpportunity.decision.factors).map(([factor, value]) => (
                          <Flex key={factor} justifyContent="space-between" fontSize="sm">
                            <Text>{factor}:</Text>
                            <Text fontWeight="medium">{value.toFixed(2)}</Text>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={2}>Transaction Info</Heading>
                  <VStack align="stretch" spacing={2}>
                    {selectedOpportunity.trigger_tx && (
                      <Flex justify="space-between">
                        <Flex align="center">
                          <Text fontWeight="bold" mr={2}>Trigger TX:</Text>
                          <Tooltip label="Transaction that triggered this opportunity">
                            <Box as="span">
                              <Icon as={FiInfo} color="gray.400" boxSize={4} />
                            </Box>
                          </Tooltip>
                        </Flex>
                        <Link 
                          href={`https://etherscan.io/tx/${selectedOpportunity.trigger_tx}`} 
                          isExternal 
                          color="brand.500"
                          display="flex"
                          alignItems="center"
                        >
                          {selectedOpportunity.trigger_tx.substring(0, 8)}...
                          <Icon as={FiExternalLink} ml={1} />
                        </Link>
                      </Flex>
                    )}
                    
                    {selectedOpportunity.execution_tx && (
                      <Flex justify="space-between">
                        <Flex align="center">
                          <Text fontWeight="bold" mr={2}>Execution TX:</Text>
                          <Tooltip label="Our transaction that executed this opportunity">
                            <Box as="span">
                              <Icon as={FiInfo} color="gray.400" boxSize={4} />
                            </Box>
                          </Tooltip>
                        </Flex>
                        <Link 
                          href={`https://etherscan.io/tx/${selectedOpportunity.execution_tx}`} 
                          isExternal 
                          color="brand.500"
                          display="flex"
                          alignItems="center"
                        >
                          {selectedOpportunity.execution_tx.substring(0, 8)}...
                          <Icon as={FiExternalLink} ml={1} />
                        </Link>
                      </Flex>
                    )}
                    
                    {selectedOpportunity.competitor_tx && (
                      <Flex justify="space-between">
                        <Flex align="center">
                          <Text fontWeight="bold" mr={2}>Competitor TX:</Text>
                          <Tooltip label="Competitor's transaction that captured this opportunity">
                            <Box as="span">
                              <Icon as={FiInfo} color="gray.400" boxSize={4} />
                            </Box>
                          </Tooltip>
                        </Flex>
                        <Link 
                          href={`https://etherscan.io/tx/${selectedOpportunity.competitor_tx}`} 
                          isExternal 
                          color="brand.500"
                          display="flex"
                          alignItems="center"
                        >
                          {selectedOpportunity.competitor_tx.substring(0, 8)}...
                          <Icon as={FiExternalLink} ml={1} />
                        </Link>
                      </Flex>
                    )}
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default OpportunitiesPage;
