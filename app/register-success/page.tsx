'use client';

import {
  Container,
  Heading,
  Flex,
  Stack,
  Text,
  Box,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../api/firebase';
import GhostButton from '@/components/buttons/GhostButton';
import PurpleButton from '@/components/buttons/PurpleButton';  // ← import added
import { useEffect, useRef, useState } from 'react';

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, sm: false });
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);

  const handleResendVerification = async () => {
    try {
      if (!auth.currentUser) {
        alert(
          'Nem található bejelentkezett felhasználó. Kérjük, jelentkezz be újra.'
        );
        return;
      }
      await sendEmailVerification(auth.currentUser);
      alert('A megerősítő e-mail újraküldve az e-mail címedre.');
    } catch (error) {
      console.error('Hiba az e-mail újraküldése során:', error);
      alert(
        'Nem sikerült elküldeni a megerősítő e-mailt. Próbáld meg újra később.'
      );
    }
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
  }, [contentRef.current?.scrollHeight]);

  return (
    <Box
      bg="transparent"
      minW="100vw"
      pb="0"
      mb="0"
      zIndex="1"
      overflowY="hidden"
    >
      <Flex
        bg="transparent"
        pt="2vh"
        direction="column"
        overflow="hidden"
        zIndex={2}
      >
        {/* Top Section */}
        <Container maxW="2xl" py={0} position="relative">
          <Flex alignItems="center" mb={2} position="relative">
            <GhostButton
              variant="ghost"
              onClick={() => router.push('/')}
              position="absolute"
              left="0"
              display="inline-flex"
              alignItems="center"
              p={0}
              minW="auto"
              mr={4}
              zIndex={2}
            >
              <FiArrowLeft size={32} />
            </GhostButton>
            <Heading
              as="h1"
              size={['xl', '2xl', '3xl']}
              fontWeight="bold"
              textAlign="center"
              mx="auto"
              p="0"
              zIndex={2}
            >
              Regisztráció
            </Heading>
          </Flex>
        </Container>

        {/* Scrollable Content */}
        <Flex
          flex="1"
          overflowY="auto"
          direction="column"
          alignItems="center"
          justifyContent="flex-start"
          mt="4vh"
          px={6}
          zIndex={2}
        >
          <Container maxW="3xl" pb={10}>
            <Stack gap={6} textAlign="center">
              <Heading as="h2" size={['md', '2xl', '3xl']} fontWeight="bold">
                Köszönjük, hogy regisztráltál!
              </Heading>
              <Text fontSize={['sm', 'xl', '2xl']} lineHeight="tall">
                Egy megerősítő e-mailt küldtünk az általad megadott e-mail
                címre.
              </Text>
              <Text fontSize={['sm', 'xl', '2xl']} lineHeight="tall">
                Kérjük, erősítsd meg a regisztrációdat az abban található
                linkre kattintva, hogy beléphess.
              </Text>
              <Text fontSize={['sm', 'xl', '2xl']} lineHeight="tall">
                Nem kaptál e-mailt?{' '}
                <GhostButton
                  as="button"
                  _hover={{ textDecoration: 'underline', bg: 'transparent' }}
                  fontWeight="bold"
                  onClick={handleResendVerification}
                  fontSize={['sm', 'xl', '2xl']}
                >
                  Újraküldés
                </GhostButton>
              </Text>

              {/* New purple button */}
              <PurpleButton onClick={() => router.push('/login')} mt={6} alignSelf="center">
                Aktiváltam a fiókomat, belépek
              </PurpleButton>
            </Stack>
          </Container>
        </Flex>
      </Flex>
    </Box>
  );
}
