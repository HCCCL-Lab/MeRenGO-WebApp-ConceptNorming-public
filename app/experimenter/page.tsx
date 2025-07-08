'use client';

import { useExperimenterCheck } from '../../hooks/useExperimenterCheck';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Flex,
  Spinner,
  Text,
  VStack,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react';
import PurpleButton from '@/components/buttons/PurpleButton';
import { useEffect, useRef, useState } from 'react';
import { soundManager } from '@/lib/sounds';


export default function Page() {
  // Hooks and state
  const { isCheckingExperimenter, experimenterLoading } =
    useExperimenterCheck();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const isPortrait = useBreakpointValue({ base: true, md: false });
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname()


  // Handle button click
  const handlePlayClick = () => {
    sessionStorage.clear();
    router.push('/experimenter/participant-data');
  };

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    updateHeight();

    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, [contentRef.current?.scrollHeight, isCheckingExperimenter]);
  
  // Sound effect for bemutatkozas
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (pathname === '/experimenter' && !hasPlayed.current) {
      soundManager.playGroup('bemutatkozas');
      hasPlayed.current = true;
    }
  }, [pathname]);

  // Loading state
  if (experimenterLoading || isCheckingExperimenter) {
    return (
      <>
        <Flex
          bg="transparent"
          minH="100vh"
          minW="100vw"
          direction="column"
          align="center"
          textAlign="center"
        >
          <Spinner color="black" m="auto" size="xl" />
        </Flex>
      </>
    );
  }

  // Main content
  return (
      <Box
        bg="transparent"
        pt="1rem"
        pb="0"
        mb="0"
        overflowY="hidden"
        zIndex={1}
      >
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          m="auto"
          py={isPortrait ? '8vh' : '8vh'}
          spaceY={isPortrait ? 10 : 10}
          w={{ base: '90%', md: '50%' }}
        >
          <VStack zIndex={1}>
            <Text fontSize="3xl" color="black" fontWeight="semibold">
              Az adatfelvétel kezdéséhez <br /> nyomd meg a lenti gombot!
            </Text>
            <Image
              src="/mimo-frontal.png"
              height="40vh"
              filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
              alt="Main Character"
            ></Image>
          </VStack>

          <PurpleButton
            onClick={handlePlayClick}
            fontWeight="bold"
            py={6}
            px={6}
            fontSize="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            zIndex={1}
          >
            Kezdés
          </PurpleButton>
        </Flex>
      </Box>
  );
}
