import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { 
  FiSend, 
  FiCheck, 
  FiClock, 
  FiAlertTriangle, 
  FiTrash2, 
  FiRefreshCw
} from 'react-icons/fi';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';

const InboxPage = () => {
  const toast = useToast();
  const { socket, connected } = useSocket();
  const { markAsRead } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const cancelRef = React.useRef();
  
  // Fetch requests on mount and when socket receives new message
  useEffect(() => {
    fetchRequests();
    
    // Listen for new requests via socket
    if (socket && connected) {
      socket.on('new_request', (request) => {
        setRequests(prev => [request, ...prev]);
      });
      
      socket.on('request_updated', (updatedRequest) => {
        setRequests(prev => 
          prev.map(req => 
            req.id === updatedRequest.id ? updatedRequest : req
          )
        );
      });
      
      return () => {
        socket.off('new_request');
        socket.off('request_updated');
      };
    }
  }, [socket, connected]);
  
  // Filter requests when tab changes or search text changes
  useEffect(() => {
    filterRequests();
  }, [tabIndex, requests, searchText]);
  
  // Mark requests as read when viewing
  useEffect(() => {
    if (selectedRequest && !selectedRequest.is_read) {
      markRequestAsRead(selectedRequest.id);
    }
  }, [selectedRequest]);
  
  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/requests`);
      
      setRequests(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again later.');
      setLoading(false);
    }
  };
  
  // Filter requests based on current tab and search text
  const filterRequests = () => {
    let filtered = [...requests];
    
    // Filter by tab
    if (tabIndex === 1) {
      // Pending
      filtered = filtered.filter(req => !req.is_resolved);
    } else if (tabIndex === 2) {
      // Resolved
      filtered = filtered.filter(req => req.is_resolved);
    } // tabIndex 0 is All
    
    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(req => 
        (req.subject && req.subject.toLowerCase().includes(searchLower)) ||
        (req.content && req.content.toLowerCase().includes(searchLower)) ||
        (req.agent_name && req.agent_name.toLowerCase().includes(searchLower)) ||
        (req.category && req.category.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredRequests(filtered);
  };
  
  // Mark a request as read
  const markRequestAsRead = async (requestId) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/requests/${requestId}/read`);
      
      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, is_read: true } : req
        )
      );
      
      // Update notification count
      markAsRead(requestId);
    } catch (err) {
      console.error('Error marking request as read:', err);
    }
  };
  
  // Reply to a request
  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!selectedRequest || !replyText.trim() || isReplying) return;
    
    try {
      setIsReplying(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Send reply
      await axios.post(`${API_URL}/api/requests/${selectedRequest.id}/reply`, {
        content: replyText,
        resolve: true
      });
      
      // Update local state
      const updatedRequest = {
        ...selectedRequest,
        is_resolved: true,
        resolution: {
          content: replyText,
          timestamp: new Date().toISOString(),
          resolver_id: 'human'
        }
      };
      
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id ? updatedRequest : req
        )
      );
      
      // Clear reply text and update selected request
      setReplyText('');
      setSelectedRequest(updatedRequest);
      setIsReplying(false);
      
      toast({
        title: 'Reply sent',
        description: 'Your response has been delivered to the agent',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // If socket is connected, emit update
      if (socket && connected) {
        socket.emit('request_replied', updatedRequest);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      setIsReplying(false);
      
      toast({
        title: 'Failed to send reply',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle request deletion
  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/requests/${requestToDelete.id}`);
      
      // Remove from local state
      setRequests(prev => prev.filter(req => req.id !== requestToDelete.id));
      
      // If this was the selected request, clear selection
      if (selectedRequest && selectedRequest.id === requestToDelete.id) {
        setSelectedRequest(null);
      }
      
      toast({
        title: 'Request deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error deleting request:', err);
      toast({
        title: 'Failed to delete request',
        description: 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteAlertOpen(false);
      setRequestToDelete(null);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Open delete confirmation
  const confirmDelete = (request) => {
    setRequestToDelete(request);
    setIsDeleteAlertOpen(true);
  };
  
  // Select a request to view
  const selectRequest = (request) => {
    setSelectedRequest(request);
    if (!request.is_read) {
      markRequestAsRead(request.id);
    }
  };
  
  // Show loading state
  if (loading && !requests.length) {
    return (
      <Flex justify="center" align="center" h="500px" direction="column">
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text mt={4}>Loading requests...</Text>
      </Flex>
    );
  }
  
  // Show error state
  if (error && !requests.length) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" color="red.500" mb={2}>
          Error Loading Requests
        </Heading>
        <Text color="gray.600" mb={6}>
          {error}
        </Text>
        <Button colorScheme="blue" onClick={fetchRequests}>
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading mb={6}>Inbox</Heading>
      
      <Tabs 
        variant="enclosed" 
        colorScheme="brand" 
        index={tabIndex}
        onChange={setTabIndex}
        mb={4}
      >
        <TabList>
          <Tab>All</Tab>
          <Tab>
            Pending
            <Badge ml={2} colorScheme="red" borderRadius="full">
              {requests.filter(r => !r.is_resolved).length}
            </Badge>
          </Tab>
          <Tab>Resolved</Tab>
        </TabList>
      </Tabs>
      
      <Flex mb={4}>
        <Input
          placeholder="Search requests..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          mr={4}
        />
        <Tooltip label="Refresh requests">
          <IconButton
            aria-label="Refresh requests"
            icon={<FiRefreshCw />}
            onClick={fetchRequests}
            isLoading={loading}
          />
        </Tooltip>
      </Flex>
      
      {filteredRequests.length === 0 ? (
        <Card>
          <CardBody>
            <Text textAlign="center" color="gray.600">
              No requests found.
            </Text>
          </CardBody>
        </Card>
      ) : (
        <Flex>
          {/* Request list */}
          <Box width="350px" mr={4} overflow="hidden">
            <Card height="680px" overflow="hidden">
              <CardBody p={0} overflow="hidden">
                <VStack 
                  spacing={0} 
                  align="stretch" 
                  height="100%" 
                  overflow="auto"
                >
                  {filteredRequests.map((request) => (
                    <Box 
                      key={request.id}
                      p={4}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      cursor="pointer"
                      bg={
                        selectedRequest?.id === request.id
                          ? 'brand.50'
                          : request.is_read ? 'white' : 'yellow.50'
                      }
                      onClick={() => selectRequest(request)}
                      _hover={{ bg: 'gray.50' }}
                      position="relative"
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <HStack>
                          <Avatar 
                            size="sm" 
                            name={request.agent_name} 
                            src={request.agent_avatar}
                            bg="brand.500"
                          />
                          <Text fontWeight="bold" isTruncated maxW="180px">
                            {request.agent_name}
                          </Text>
                        </HStack>
                        
                        <Badge colorScheme={request.is_resolved ? 'green' : 'red'}>
                          {request.is_resolved ? 'Resolved' : 'Pending'}
                        </Badge>
                      </Flex>
                      
                      <Text fontWeight="medium" mb={1} isTruncated>
                        {request.subject || 'No subject'}
                      </Text>
                      
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {request.content}
                      </Text>
                      
                      <Flex justify="space-between" mt={2}>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(request.timestamp).toLocaleDateString()}
                        </Text>
                        
                        {!request.is_read && (
                          <Badge colorScheme="blue" variant="solid">
                            New
                          </Badge>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </Box>
          
          {/* Request details */}
          <Box flex="1">
            <Card height="680px">
              {selectedRequest ? (
                <CardBody p={0} display="flex" flexDirection="column">
                  {/* Header */}
                  <Box p={4} borderBottom="1px solid" borderColor="gray.200">
                    <Flex justify="space-between" align="center">
                      <Heading size="md">{selectedRequest.subject || 'No subject'}</Heading>
                      <HStack>
                        <Badge colorScheme={selectedRequest.priority === 'high' ? 'red' : selectedRequest.priority === 'medium' ? 'yellow' : 'green'}>
                          {selectedRequest.priority || 'Normal'} Priority
                        </Badge>
                        <Badge colorScheme={selectedRequest.is_resolved ? 'green' : 'red'}>
                          {selectedRequest.is_resolved ? 'Resolved' : 'Pending'}
                        </Badge>
                        <Tooltip label="Delete request">
                          <IconButton
                            aria-label="Delete request"
                            icon={<FiTrash2 />}
                            variant="ghost"
                            colorScheme="red"
                            size="sm"
                            onClick={() => confirmDelete(selectedRequest)}
                          />
                        </Tooltip>
                      </HStack>
                    </Flex>
                    
                    <Flex mt={2} align="center">
                      <Avatar 
                        size="sm" 
                        name={selectedRequest.agent_name} 
                        src={selectedRequest.agent_avatar}
                        mr={2}
                        bg="brand.500"
                      />
                      <Text fontWeight="medium">{selectedRequest.agent_name}</Text>
                      <Box mx={2}>•</Box>
                      <Text color="gray.600" fontSize="sm">
                        {formatTimestamp(selectedRequest.timestamp)}
                      </Text>
                    </Flex>
                    
                    {selectedRequest.category && (
                      <HStack mt={2} spacing={2}>
                        <Text fontSize="sm" color="gray.600">Categories:</Text>
                        <Tag colorScheme="brand" size="sm">
                          {selectedRequest.category}
                        </Tag>
                      </HStack>
                    )}
                  </Box>
                  
                  {/* Content */}
                  <Box p={4} flex="1" overflow="auto">
                    <Box 
                      whiteSpace="pre-wrap" 
                      borderRadius="md" 
                      bg="gray.50" 
                      p={4}
                    >
                      {selectedRequest.content}
                    </Box>
                    
                    {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                      <Box mt={4}>
                        <Text fontWeight="bold" mb={2}>Attachments:</Text>
                        <VStack align="stretch">
                          {selectedRequest.attachments.map((attachment, idx) => (
                            <Box 
                              key={idx} 
                              p={3} 
                              borderWidth="1px" 
                              borderRadius="md"
                              _hover={{ bg: 'gray.50' }}
                            >
                              <Flex justify="space-between" align="center">
                                <Text>{attachment.name}</Text>
                                <Button size="sm" variant="outline">
                                  View
                                </Button>
                              </Flex>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    )}
                    
                    {/* Resolution */}
                    {selectedRequest.is_resolved && selectedRequest.resolution && (
                      <Box mt={6}>
                        <Divider mb={4} />
                        <Heading size="sm" mb={3}>Resolution</Heading>
                        
                        <Flex align="center" mb={2}>
                          <Avatar size="sm" mr={2} />
                          <Text fontWeight="medium">You</Text>
                          <Box mx={2}>•</Box>
                          <Text color="gray.600" fontSize="sm">
                            {formatTimestamp(selectedRequest.resolution.timestamp)}
                          </Text>
                        </Flex>
                        
                        <Box 
                          whiteSpace="pre-wrap" 
                          borderRadius="md" 
                          bg="brand.50" 
                          p={4}
                          borderLeft="4px solid"
                          borderColor="brand.500"
                        >
                          {selectedRequest.resolution.content}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Reply form */}
                  {!selectedRequest.is_resolved && (
                    <Box p={4} borderTop="1px solid" borderColor="gray.200">
                      <form onSubmit={handleReply}>
                        <FormControl>
                          <FormLabel>Reply to request</FormLabel>
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your response..."
                            resize="vertical"
                            rows={3}
                          />
                        </FormControl>
                        <Flex justify="flex-end" mt={4}>
                          <Button 
                            type="submit" 
                            colorScheme="brand" 
                            rightIcon={<FiSend />}
                            isLoading={isReplying}
                            loadingText="Sending"
                            isDisabled={!replyText.trim()}
                          >
                            Reply & Resolve
                          </Button>
                        </Flex>
                      </form>
                    </Box>
                  )}
                </CardBody>
              ) : (
                <CardBody>
                  <Flex 
                    direction="column" 
                    align="center" 
                    justify="center" 
                    h="100%" 
                    color="gray.500"
                  >
                    <Box fontSize="5xl" mb={4}>📬</Box>
                    <Heading size="md" mb={2}>No request selected</Heading>
                    <Text>Select a request from the left to view its details</Text>
                  </Flex>
                </CardBody>
              )}
            </Card>
          </Box>
        </Flex>
      )}
      
      {/* Delete confirmation */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Request
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this request? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteRequest} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default InboxPage;
