import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Spinner,
  Select,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Badge,
  Divider,
  useDisclosure,
  SimpleGrid,
  Tooltip,
  HStack,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import ReactFlow, { 
  Background, 
  Controls,
  MiniMap,
} from 'react-flow-renderer';
import { useAgents } from '../../contexts/AgentContext';
import axios from 'axios';

// Custom node for learning bubbles
const LearningBubble = ({ data }) => {
  return (
    <Tooltip 
      label="Click for details" 
      placement="top" 
      hasArrow
    >
      <Box 
        bg={data.color} 
        color="white" 
        borderRadius="full" 
        p={2} 
        cursor="pointer"
        boxShadow="md"
        _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
        transition="all 0.2s"
        minWidth={data.size}
        minHeight={data.size}
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        fontSize={data.size > 100 ? 'md' : 'xs'}
        fontWeight="bold"
      >
        {data.label}
      </Box>
    </Tooltip>
  );
};

// Custom node types
const nodeTypes = {
  learningBubble: LearningBubble,
};

const LearningPage = () => {
  const { selectedAgent } = useAgents();
  const [learnings, setLearnings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedLearning, setSelectedLearning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Fetch learnings when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      fetchLearnings();
    }
  }, [selectedAgent]);
  
  // Update flow nodes when learnings or category filter changes
  useEffect(() => {
    if (learnings.length > 0) {
      generateFlowData();
    }
  }, [learnings, selectedCategory]);
  
  // Fetch learning data from API
  const fetchLearnings = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/agent/${selectedAgent.id}/learnings`);
      
      setLearnings(response.data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(response.data.map(learning => learning.category))
      );
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching learnings:', err);
      setError('Failed to fetch learning data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Generate nodes and edges for react-flow
  const generateFlowData = () => {
    // Filter learnings by category if not 'all'
    const filteredLearnings = selectedCategory === 'all' 
      ? learnings 
      : learnings.filter(l => l.category === selectedCategory);
    
    // Map of category to color
    const categoryColors = {
      'market': '#4299E1',  // blue
      'strategy': '#38A169', // green
      'risk': '#E53E3E',    // red
      'technical': '#805AD5', // purple
      'competition': '#DD6B20', // orange
      'general': '#718096',  // gray
    };
    
    // Create root node (center of visualization)
    const flowNodes = [{
      id: 'root',
      type: 'learningBubble',
      data: { 
        label: selectedCategory === 'all' ? 'All Learnings' : selectedCategory,
        color: selectedCategory === 'all' ? '#2D3748' : categoryColors[selectedCategory] || '#2D3748',
        size: 120,
        learning: null,
      },
      position: { x: 0, y: 0 },
    }];
    
    const flowEdges = [];
    
    // Generate positions in a circle around the root
    const radius = 300;
    const angleStep = (2 * Math.PI) / filteredLearnings.length;
    
    filteredLearnings.forEach((learning, index) => {
      // Calculate position in a circle
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      // Calculate node size based on importance (50-100)
      const size = 50 + (learning.importance || 0) * 0.5;
      
      // Add node
      flowNodes.push({
        id: `learning-${learning.id}`,
        type: 'learningBubble',
        data: { 
          label: learning.title, 
          color: categoryColors[learning.category] || '#718096',
          size: size,
          learning: learning,
        },
        position: { x, y },
      });
      
      // Add edge connecting to root
      flowEdges.push({
        id: `edge-${learning.id}`,
        source: 'root',
        target: `learning-${learning.id}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#CBD5E0', strokeWidth: 2 },
      });
      
      // Add connections between related learnings
      if (learning.related_learnings) {
        learning.related_learnings.forEach(relatedId => {
          // Only add edges if both nodes exist in the current view
          const relatedLearning = filteredLearnings.find(l => l.id === relatedId);
          if (relatedLearning) {
            flowEdges.push({
              id: `edge-${learning.id}-${relatedId}`,
              source: `learning-${learning.id}`,
              target: `learning-${relatedId}`,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#A0AEC0', strokeWidth: 1, strokeDasharray: '5,5' },
            });
          }
        });
      }
    });
    
    setNodes(flowNodes);
    setEdges(flowEdges);
  };
  
  // Handle node click
  const onNodeClick = (event, node) => {
    if (node.id !== 'root' && node.data.learning) {
      setSelectedLearning(node.data.learning);
      onOpen();
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Show loading state
  if (loading && !learnings.length) {
    return (
      <Flex justify="center" align="center" h="500px" direction="column">
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text mt={4}>Loading learning data...</Text>
      </Flex>
    );
  }
  
  // Show error state
  if (error && !learnings.length) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" color="red.500" mb={2}>
          Error Loading Learning Data
        </Heading>
        <Text color="gray.600" mb={6}>
          {error}
        </Text>
        <Button colorScheme="blue" onClick={fetchLearnings}>
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
          Learning Visualization
        </Heading>
        <Text color="gray.600" mb={6}>
          Please select an agent from the dropdown above to view learning data.
        </Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Learning Visualization</Heading>
        
        {/* Category filter */}
        <Select 
          w="200px" 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </Select>
      </Flex>
      
      {learnings.length === 0 ? (
        <Card>
          <CardBody>
            <Text textAlign="center" color="gray.600">
              No learning data available for this agent.
            </Text>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <Text>
              Showing {selectedCategory === 'all' ? 'all learnings' : `learnings in category: ${selectedCategory}`}. 
              Click on a bubble to see details.
            </Text>
          </CardHeader>
          <CardBody>
            <Box h="600px" border="1px solid" borderColor="gray.200" borderRadius="md">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                fitView
              >
                <Background color="#f8f8f8" gap={16} />
                <Controls />
                <MiniMap 
                  nodeStrokeColor={(n) => {
                    if (n.id === 'root') return '#000';
                    return '#555';
                  }}
                  nodeColor={(n) => {
                    if (n.id === 'root') return '#2D3748';
                    return n.data.color;
                  }}
                />
              </ReactFlow>
            </Box>
          </CardBody>
        </Card>
      )}
      
      {/* Learning Detail Modal */}
      {selectedLearning && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Flex align="center">
                <Text>{selectedLearning.title}</Text>
                <Badge ml={2} colorScheme="blue">
                  {selectedLearning.category}
                </Badge>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <SimpleGrid columns={2} spacing={2}>
                    <Text fontWeight="bold">Discovered:</Text>
                    <Text>{formatDate(selectedLearning.timestamp)}</Text>
                    
                    <Text fontWeight="bold">Importance:</Text>
                    <Text>{selectedLearning.importance}/10</Text>
                    
                    <Text fontWeight="bold">Source:</Text>
                    <Text>{selectedLearning.source}</Text>
                  </SimpleGrid>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Summary</Text>
                  <Text>{selectedLearning.summary}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Details</Text>
                  <Text whiteSpace="pre-wrap">{selectedLearning.details}</Text>
                </Box>
                
                {selectedLearning.insights && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Key Insights</Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedLearning.insights.map((insight, idx) => (
                        <Text key={idx}>• {insight}</Text>
                      ))}
                    </VStack>
                  </Box>
                )}
                
                {selectedLearning.tags && selectedLearning.tags.length > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Tags</Text>
                    <HStack spacing={2} wrap="wrap">
                      {selectedLearning.tags.map((tag, idx) => (
                        <Tag key={idx} size="md" colorScheme="brand" borderRadius="full">
                          <TagLabel>{tag}</TagLabel>
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                )}
                
                {selectedLearning.related_learning_titles && (
                  <Box>
                    <Text fontWeight="bold" mb={2}>Related Learnings</Text>
                    <VStack align="stretch" spacing={1}>
                      {selectedLearning.related_learning_titles.map((title, idx) => (
                        <Text key={idx} fontSize="sm">• {title}</Text>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default LearningPage;
