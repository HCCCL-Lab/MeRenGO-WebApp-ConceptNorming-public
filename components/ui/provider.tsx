'use client';

import { ChakraProvider, createSystem } from '@chakra-ui/react';
import { UserProvider } from '@/lib/UserContext';
import config from '@/app/theme';

const system = config;

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <UserProvider>{children}</UserProvider>
    </ChakraProvider>
  );
}
