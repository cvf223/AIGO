import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  Flex,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Card,
  CardBody,
  Divider,
  IconButton,
  FormControl,
  useColorModeValue,
  Badge,
  InputGroup,
  InputRightElement,
  Tooltip
} from '@chakra-ui/react';
import { FiSend, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { useAgents } from '../../contexts/AgentContext';
import { useSocket } from '../../contexts/SocketContext';
import axios from 'axios';

const ChatPage = () => {
  const { selectedAgent } = useAgents();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Colors
  const humanBgColor = useColorModeValue('gray.100', 'gray.700');
  const agentBgColor = useColorModeValue('brand.50', 'brand.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Fetch chat history when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      fetchChatHistory();
    }
  }, [selectedAgent]);
  
  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !connected || !selectedAgent) return;
    
    // Join the agent's room
    socket.emit('join_agent_room', selectedAgent.id);
    
    // Listen for new messages
    socket.on('receive_message', (message) => {
      if (message.sender_id === selectedAgent.id || message.recipient_id === selectedAgent.id) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    });
    
    return () => {
      socket.off('receive_message');
    };
  }, [socket, connected, selectedAgent]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch chat history from API
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/agent/${selectedAgent.id}/messages`);
      
      setMessages(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load chat history. Please try again later.');
      setLoading(false);
    }
  };
  
  // Send message handler
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || sending) return;
    
    try {
      setSending(true);
      
      const newMessage = {
        content: inputMessage,
        sender_id: 'human', // Special ID for human
        recipient_id: selectedAgent.id,
        timestamp: new Date().toISOString(),
        is_read: false,
      };
      
      // Add message to local state immediately for responsiveness
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Clear input
      setInputMessage('');
      
      // Send through socket
      if (socket && connected) {
        socket.emit('send_message', newMessage);
      } else {
        // Fallback to API if socket not connected
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        await axios.post(`${API_URL}/api/messages`, newMessage);
      }
      
      setSending(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setSending(false);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Export chat history
  const exportChatHistory = () => {
    if (!messages.length || !selectedAgent) return;
    
    const chatText = messages.map(msg => {
      const sender = msg.sender_id === 'human' ? 'You' : selectedAgent.name;
      return `[${new Date(msg.timestamp).toLocaleString()}] ${sender}: ${msg.content}`;
    }).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-with-${selectedAgent.name}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Show loading state
  if (loading) {
    return (
      <Flex justify="center" align="center" h="500px" direction="column">
        <Spinner size="xl" color="brand.500" thickness="4px" />
        <Text mt={4}>Loading chat history...</Text>
      </Flex>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Box textAlign="center" py={10} px={6}>
        <Heading as="h2" size="xl" color="red.500" mb={2}>
          Error Loading Chat
        </Heading>
        <Text color="gray.600" mb={6}>
          {error}
        </Text>
        <Button colorScheme="blue" onClick={fetchChatHistory}>
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
          Agent Chat Interface
        </Heading>
        <Text color="gray.600" mb={6}>
          Please select an agent from the dropdown above to start chatting.
        </Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <Heading>Chat with {selectedAgent.name}</Heading>
          <Badge colorScheme={connected ? "green" : "red"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
        </HStack>
        
        <HStack>
          <Tooltip label="Refresh chat history">
            <IconButton
              aria-label="Refresh chat"
              icon={<FiRefreshCw />}
              onClick={fetchChatHistory}
              isLoading={loading}
            />
          </Tooltip>
          <Tooltip label="Export chat history">
            <IconButton
              aria-label="Export chat"
              icon={<FiDownload />}
              onClick={exportChatHistory}
              isDisabled={messages.length === 0}
            />
          </Tooltip>
        </HStack>
      </Flex>
      
      {/* Chat messages area */}
      <Card mb={4} height="600px">
        <CardBody 
          display="flex" 
          flexDirection="column"
          p={0}
          position="relative"
        >
          {messages.length === 0 ? (
            <Flex 
              justify="center" 
              align="center" 
              height="100%" 
              p={4}
            >
              <Text color="gray.500">
                No messages yet. Send a message to start the conversation.
              </Text>
            </Flex>
          ) : (
            <Box 
              flex="1" 
              overflowY="auto" 
              p={4}
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '24px',
                },
              }}
            >
              <VStack spacing={4} align="stretch">
                {messages.map((message, index) => (
                  <Box key={index}>
                    {/* Date separator for first message or when date changes */}
                    {index === 0 || 
                      new Date(message.timestamp).toLocaleDateString() !== 
                      new Date(messages[index - 1].timestamp).toLocaleDateString() ? (
                      <Flex align="center" my={4}>
                        <Divider flex="1" />
                        <Text px={4} fontSize="sm" color="gray.500">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </Text>
                        <Divider flex="1" />
                      </Flex>
                    ) : null}
                    
                    {/* Message */}
                    <HStack 
                      alignItems="flex-start"
                      justify={message.sender_id === 'human' ? 'flex-end' : 'flex-start'}
                      spacing={2}
                    >
                      {message.sender_id !== 'human' && (
                        <Avatar 
                          size="sm" 
                          name={selectedAgent.name}
                          src={selectedAgent.avatar_url}
                          bg="brand.500"
                        />
                      )}
                      
                      <VStack 
                        align={message.sender_id === 'human' ? 'flex-end' : 'flex-start'}
                        maxW="80%"
                      >
                        <Box
                          bg={message.sender_id === 'human' ? humanBgColor : agentBgColor}
                          borderRadius="lg"
                          px={4}
                          py={2}
                          maxW="100%"
                          borderWidth={1}
                          borderColor={borderColor}
                        >
                          <Text whiteSpace="pre-wrap">{message.content}</Text>
                        </Box>
                        
                        <Text fontSize="xs" color="gray.500">
                          {formatTimestamp(message.timestamp)}
                        </Text>
                      </VStack>
                      
                      {message.sender_id === 'human' && (
                        <Avatar 
                          size="sm" 
                          name="You"
                          bg="gray.400"
                        />
                      )}
                    </HStack>
                  </Box>
                ))}
                
                {/* Invisible element for auto-scrolling */}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>
          )}
          
          {/* Message input */}
          <Box
            borderTop="1px solid"
            borderColor={borderColor}
            p={4}
          >
            <FormControl>
              <InputGroup>
                <Input
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  disabled={!connected || sending}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    colorScheme="brand"
                    isLoading={sending}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !connected}
                    rightIcon={<FiSend />}
                  >
                    Send
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
        </CardBody>
      </Card>
      
      <Text fontSize="sm" color="gray.500" textAlign="center">
        {connected ? (
          'Connected to agent in real-time'
        ) : (
          'Disconnected. Messages will be delivered when connection is restored.'
        )}
      </Text>
    </Box>
  );
};

export default ChatPage;
