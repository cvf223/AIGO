import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e0f7ff',
      100: '#b8e7ff',
      200: '#8dd6ff',
      300: '#61c5ff',
      400: '#36b4ff',
      500: '#0ca3ff',
      600: '#0082d9',
      700: '#0062b3',
      800: '#00428d',
      900: '#002367',
    },
    secondary: {
      50: '#fff0e0',
      100: '#ffd9b3',
      200: '#ffc286',
      300: '#ffaa59',
      400: '#ff932d',
      500: '#ff7b00',
      600: '#d96200',
      700: '#b34900',
      800: '#8c3300',
      900: '#661d00',
    },
    success: {
      500: '#38b2ac',
    },
    error: {
      500: '#e53e3e',
    },
    warning: {
      500: '#dd6b20',
    },
    info: {
      500: '#3182ce',
    },
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'md',
        },
      },
    },
  },
});

export default theme;
