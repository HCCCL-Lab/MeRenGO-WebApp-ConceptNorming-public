import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import merge from 'deepmerge';

// Define colours and semantic tokens
const theme = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#ded1ed' },
          100: { value: '#B7A8C8' }, // Secondary light purple
          200: { value: '#a18db8' },
          300: { value: '#7f6d94' },
          400: { value: '#6b69eb' },
          500: { value: '#65638f' },
          600: { value: '#49476b' },
          700: { value: '#363457' }, // Primary dark purple
          800: { value: '#2b2949' },
          900: { value: '#211f3e' },
          950: { value: '#161530' },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.700}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
      },
    },
  },
});

// Extends default theme
const config = merge(defaultConfig, theme);
const system = createSystem(config);

export default system;
