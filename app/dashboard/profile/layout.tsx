'use client';

// File: layout.tsx
import {
  Box,
  Flex,
  VStack,
  Text,
  Separator,
  useBreakpointValue,
  Button,
} from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { useEffect } from 'react';
import GhostButton from '@/components/buttons/GhostButton';
import WhiteButton from '@/components/buttons/WhiteButton';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const tabs = [
    { label: 'Matricás album', href: '/dashboard/profile/history' },
    { label: 'Jelszómódosítás', href: '/dashboard/profile/password-change' },
    { label: 'Gyermek adatai', href: '/dashboard/profile/personal' },
    { label: 'Profilom törlése', href: '/dashboard/profile/delete-account', delete: true },
  ];

  const isMainProfile = pathname === '/dashboard/profile';

  useEffect(() => {
    const isCurrentlyMobile = window.innerWidth < 768;
    if (!isCurrentlyMobile && pathname === '/dashboard/profile') {
      router.replace('/dashboard/profile/personal');
    }
  }, [pathname, router]);

  const isActive = (path: string) => pathname === path;

  return (
    <Box flex="1" display="flex" flexDirection="column">
      {/* Header */}
      <Box textAlign="center" py={4} bg="transparent">
        <Flex alignItems="center" justifyContent="center" position="relative">
          {isMobile && (
            <GhostButton position="absolute" left="10px" onClick={() => router.back()} display="inline-flex" alignItems="center">
              <FiArrowLeft size={32} />
            </GhostButton>
          )}
          <Text fontSize={['3xl', '3xl', '4xl']} fontWeight="bold">
            Profil
          </Text>
        </Flex>
      </Box>

      {/* Desktop Nav */}
      {!isMobile && (
        <Box position="sticky" py={2} zIndex={1000} top="0" bg="white" w="70%" mx="auto" borderRadius="lg">
          <Flex as="nav" justifyContent="center" alignItems="center" gap={8}>
            {tabs.map((tab) => (
              <Link key={tab.href} href={tab.href} passHref>
                {tab.delete ? (
                  <GhostButton
                    fontSize="lg"
                    fontWeight={isActive(tab.href) ? 'bold' : 'normal'}
                    color={isActive(tab.href) ? 'red.600' : 'red.500'}
                    borderBottom={isActive(tab.href) ? '2px solid #E53E3E' : 'none'}
                    pb={1}
                    rounded="none"
                    _hover={{ color: 'red.700', bgColor: 'transparent' }}
                  >
                    {tab.label}
                  </GhostButton>
                ) : (
                  <GhostButton
                    fontSize="lg"
                    fontWeight={isActive(tab.href) ? 'bold' : 'normal'}
                    color={isActive(tab.href) ? 'black' : 'gray.600'}
                    borderBottom={isActive(tab.href) ? '2px solid black' : 'none'}
                    pb={1}
                    rounded="none"
                    _hover={{ color: 'brand.200', bgColor: 'transparent' }}
                  >
                    {tab.label}
                  </GhostButton>
                )}
              </Link>
            ))}
          </Flex>
          <Separator w="80%" borderColor="gray.300" mx="auto" />
        </Box>
      )}

      {/* Mobile Main Profile Options */}
      {isMobile && isMainProfile && (
        <Box display="flex" justifyContent="center" alignItems="center" minH="40vh" mt="12vh">
          <VStack gap={8}>
            {tabs.map((tab) => (
              <Link key={tab.href} href={tab.href} passHref>
                {tab.delete ? (
                  <WhiteButton fontSize={['xl', '2xl']} fontWeight="semibold" color="red.500" borderColor="red.700" width="60vw">
                    {tab.label}
                  </WhiteButton>
                ) : (
                  <WhiteButton fontSize={['xl', '2xl']} fontWeight="semibold" width="60vw">
                    {tab.label}
                  </WhiteButton>
                )}
              </Link>
            ))}
          </VStack>
        </Box>
      )}

      {/* Subpage Content */}
      {!isMainProfile && (
        <Box flex="1" px={6} py={4} mt="4vh">
          {children}
        </Box>
      )}
    </Box>
  );
}