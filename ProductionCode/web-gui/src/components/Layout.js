import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './ui/Sidebar';
import Header from './ui/Header';

const Layout = ({ children }) => {
  return (
    <Flex h="100vh">
      {/* Sidebar */}
      <Box w="250px" h="100%" position="fixed" left="0" top="0">
        <Sidebar />
      </Box>

      {/* Main content area */}
      <Box ml="250px" w="calc(100% - 250px)" h="100%">
        {/* Header */}
        <Box h="60px" borderBottom="1px solid" borderColor="gray.200" position="sticky" top="0" zIndex="10" bg="white">
          <Header />
        </Box>

        {/* Content */}
        <Box p={4} overflowY="auto" h="calc(100vh - 60px)">
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;
