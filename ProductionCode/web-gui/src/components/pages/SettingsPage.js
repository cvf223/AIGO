import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Select,
  Card,
  CardBody,
  CardHeader,
  Divider,
  SimpleGrid,
  useToast,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FiSave, FiRefreshCw, FiTrash2, FiDownload, FiUpload } from 'react-icons/fi';

const SettingsPage = () => {
  const toast = useToast();
  
  // State for various settings
  const [generalSettings, setGeneralSettings] = useState({
    maxOpportunities: 100,
    minProfitThreshold: 0.01,
    notificationsEnabled: true,
    autoRefreshInterval: 60,
    theme: 'light'
  });
  
  const [rpcSettings, setRpcSettings] = useState({
    primaryProvider: 'Alchemy',
    secondaryProvider: 'Infura',
    rotationStrategy: 'round-robin',
    maxRequestsPerMinute: 100,
    timeoutMs: 5000
  });
  
  const [agentSettings, setAgentSettings] = useState({
    maxAgents: 8,
    memorySyncInterval: 5,
    logLevel: 'info',
    enableTraining: true,
    trainingInterval: 3600,
    saveBackups: true
  });
  
  // Handle settings form submissions
  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would save to backend
    toast({
      title: 'Settings updated',
      description: 'General settings have been saved.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  const handleRpcSubmit = (e) => {
    e.preventDefault();
    toast({
      title: 'RPC settings updated',
      description: 'RPC settings have been saved.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  const handleAgentSubmit = (e) => {
    e.preventDefault();
    toast({
      title: 'Agent settings updated',
      description: 'Agent settings have been saved.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Handle general settings changes
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle RPC settings changes
  const handleRpcChange = (e) => {
    const { name, value } = e.target;
    setRpcSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle agent settings changes
  const handleAgentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAgentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Reset settings to defaults
  const resetSettings = (settingsType) => {
    if (settingsType === 'general') {
      setGeneralSettings({
        maxOpportunities: 100,
        minProfitThreshold: 0.01,
        notificationsEnabled: true,
        autoRefreshInterval: 60,
        theme: 'light'
      });
    } else if (settingsType === 'rpc') {
      setRpcSettings({
        primaryProvider: 'Alchemy',
        secondaryProvider: 'Infura',
        rotationStrategy: 'round-robin',
        maxRequestsPerMinute: 100,
        timeoutMs: 5000
      });
    } else if (settingsType === 'agent') {
      setAgentSettings({
        maxAgents: 8,
        memorySyncInterval: 5,
        logLevel: 'info',
        enableTraining: true,
        trainingInterval: 3600,
        saveBackups: true
      });
    }
    
    toast({
      title: 'Settings reset',
      description: `${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings have been reset to defaults.`,
      status: 'info',
      duration: 5000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Heading mb={6}>Settings</Heading>
      
      <Tabs variant="enclosed" colorScheme="brand" mb={4}>
        <TabList>
          <Tab>General</Tab>
          <Tab>RPC Providers</Tab>
          <Tab>Agent Configuration</Tab>
          <Tab>System</Tab>
        </TabList>
        
        <TabPanels>
          {/* General Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">General Settings</Heading>
                  <HStack>
                    <Tooltip label="Reset to defaults">
                      <IconButton
                        aria-label="Reset settings"
                        icon={<FiRefreshCw />}
                        onClick={() => resetSettings('general')}
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleGeneralSubmit}>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Maximum Opportunities to Display</FormLabel>
                        <Input
                          type="number"
                          name="maxOpportunities"
                          value={generalSettings.maxOpportunities}
                          onChange={handleGeneralChange}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Minimum Profit Threshold (in USD)</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          name="minProfitThreshold"
                          value={generalSettings.minProfitThreshold}
                          onChange={handleGeneralChange}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Auto-refresh Interval (seconds)</FormLabel>
                        <Input
                          type="number"
                          name="autoRefreshInterval"
                          value={generalSettings.autoRefreshInterval}
                          onChange={handleGeneralChange}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Theme</FormLabel>
                        <Select
                          name="theme"
                          value={generalSettings.theme}
                          onChange={handleGeneralChange}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System</option>
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb={0}>
                        Enable Notifications
                      </FormLabel>
                      <Switch
                        name="notificationsEnabled"
                        isChecked={generalSettings.notificationsEnabled}
                        onChange={handleGeneralChange}
                        colorScheme="brand"
                      />
                    </FormControl>
                    
                    <Flex justify="flex-end" mt={4}>
                      <Button
                        type="submit"
                        colorScheme="brand"
                        rightIcon={<FiSave />}
                      >
                        Save Changes
                      </Button>
                    </Flex>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* RPC Provider Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">RPC Provider Configuration</Heading>
                  <HStack>
                    <Tooltip label="Reset to defaults">
                      <IconButton
                        aria-label="Reset settings"
                        icon={<FiRefreshCw />}
                        onClick={() => resetSettings('rpc')}
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleRpcSubmit}>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Primary Provider</FormLabel>
                        <Select
                          name="primaryProvider"
                          value={rpcSettings.primaryProvider}
                          onChange={handleRpcChange}
                        >
                          <option value="Alchemy">Alchemy</option>
                          <option value="Infura">Infura</option>
                          <option value="QuickNode">QuickNode</option>
                          <option value="Moralis">Moralis</option>
                          <option value="Custom">Custom</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Secondary Provider</FormLabel>
                        <Select
                          name="secondaryProvider"
                          value={rpcSettings.secondaryProvider}
                          onChange={handleRpcChange}
                        >
                          <option value="None">None</option>
                          <option value="Alchemy">Alchemy</option>
                          <option value="Infura">Infura</option>
                          <option value="QuickNode">QuickNode</option>
                          <option value="Moralis">Moralis</option>
                          <option value="Custom">Custom</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Provider Rotation Strategy</FormLabel>
                        <Select
                          name="rotationStrategy"
                          value={rpcSettings.rotationStrategy}
                          onChange={handleRpcChange}
                        >
                          <option value="round-robin">Round Robin</option>
                          <option value="failover">Failover</option>
                          <option value="rate-limit-aware">Rate Limit Aware</option>
                          <option value="performance">Performance Based</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Maximum Requests Per Minute</FormLabel>
                        <Input
                          type="number"
                          name="maxRequestsPerMinute"
                          value={rpcSettings.maxRequestsPerMinute}
                          onChange={handleRpcChange}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Request Timeout (ms)</FormLabel>
                        <Input
                          type="number"
                          name="timeoutMs"
                          value={rpcSettings.timeoutMs}
                          onChange={handleRpcChange}
                        />
                      </FormControl>
                    </SimpleGrid>
                    
                    <Divider my={4} />
                    
                    <Heading size="sm" mb={2}>Provider Endpoints</Heading>
                    
                    {/* Provider endpoints would be dynamically generated based on selected providers */}
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Ethereum Mainnet</FormLabel>
                        <Input placeholder="RPC URL" />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Arbitrum</FormLabel>
                        <Input placeholder="RPC URL" />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Polygon</FormLabel>
                        <Input placeholder="RPC URL" />
                      </FormControl>
                    </VStack>
                    
                    <Flex justify="flex-end" mt={4}>
                      <Button
                        type="submit"
                        colorScheme="brand"
                        rightIcon={<FiSave />}
                      >
                        Save Changes
                      </Button>
                    </Flex>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Agent Configuration */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Agent Configuration</Heading>
                  <HStack>
                    <Tooltip label="Reset to defaults">
                      <IconButton
                        aria-label="Reset settings"
                        icon={<FiRefreshCw />}
                        onClick={() => resetSettings('agent')}
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleAgentSubmit}>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel>Maximum Concurrent Agents</FormLabel>
                        <Input
                          type="number"
                          name="maxAgents"
                          value={agentSettings.maxAgents}
                          onChange={handleAgentChange}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Memory Sync Interval (minutes)</FormLabel>
                        <Input
                          type="number"
                          name="memorySyncInterval"
                          value={agentSettings.memorySyncInterval}
                          onChange={handleAgentChange}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Log Level</FormLabel>
                        <Select
                          name="logLevel"
                          value={agentSettings.logLevel}
                          onChange={handleAgentChange}
                        >
                          <option value="debug">Debug</option>
                          <option value="info">Info</option>
                          <option value="warn">Warning</option>
                          <option value="error">Error</option>
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Training Interval (seconds)</FormLabel>
                        <Input
                          type="number"
                          name="trainingInterval"
                          value={agentSettings.trainingInterval}
                          onChange={handleAgentChange}
                          isDisabled={!agentSettings.enableTraining}
                        />
                      </FormControl>
                    </SimpleGrid>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb={0}>
                        Enable Training
                      </FormLabel>
                      <Switch
                        name="enableTraining"
                        isChecked={agentSettings.enableTraining}
                        onChange={handleAgentChange}
                        colorScheme="brand"
                      />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb={0}>
                        Save Memory Backups
                      </FormLabel>
                      <Switch
                        name="saveBackups"
                        isChecked={agentSettings.saveBackups}
                        onChange={handleAgentChange}
                        colorScheme="brand"
                      />
                    </FormControl>
                    
                    <Flex justify="flex-end" mt={4}>
                      <Button
                        type="submit"
                        colorScheme="brand"
                        rightIcon={<FiSave />}
                      >
                        Save Changes
                      </Button>
                    </Flex>
                  </VStack>
                </form>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* System Settings */}
          <TabPanel>
            <Card mb={6}>
              <CardHeader>
                <Heading size="md">System Maintenance</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Heading size="sm" mb={2}>Backup & Restore</Heading>
                    <Text mb={4}>Export or import system data including agent memories, learning database, and settings.</Text>
                    <HStack>
                      <Button leftIcon={<FiDownload />} colorScheme="blue">
                        Export Data
                      </Button>
                      <Button leftIcon={<FiUpload />} variant="outline">
                        Import Data
                      </Button>
                    </HStack>
                  </Box>
                  
                  <Divider my={2} />
                  
                  <Box>
                    <Heading size="sm" mb={2}>Performance</Heading>
                    <Text mb={4}>Clear caches and temporary data to improve system performance.</Text>
                    <Button>Clear Cache</Button>
                  </Box>
                  
                  <Divider my={2} />
                  
                  <Box>
                    <Heading size="sm" color="red.500" mb={2}>Danger Zone</Heading>
                    <Text mb={4}>Performing these actions may result in data loss.</Text>
                    <HStack>
                      <Button colorScheme="red" variant="outline">
                        Reset All Agents
                      </Button>
                      <Button leftIcon={<FiTrash2 />} colorScheme="red">
                        Clear All Data
                      </Button>
                    </HStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <Heading size="md">System Information</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Version</Text>
                    <Text>1.0.0</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">Build Date</Text>
                    <Text>{new Date().toLocaleDateString()}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">Database Status</Text>
                    <Text color="green.500">Connected</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">WebSocket Status</Text>
                    <Text color="green.500">Connected</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">Memory Usage</Text>
                    <Text>42%</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="bold">CPU Usage</Text>
                    <Text>28%</Text>
                  </Box>
                  
                  <Box gridColumn={{ md: 'span 2' }}>
                    <Text fontWeight="bold">Server Uptime</Text>
                    <Text>3 days, 7 hours, 14 minutes</Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SettingsPage;
