'use client';

import {
  Container,
  Heading,
  Input,
  Flex,
  Stack,
  Text,
  Separator,
  Box,
  Alert,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { loginWithEmailAndPassword, forgotPassword } from '@/lib/auth';
import PageBar from '@/components/bars/PageBar';
import PurpleButton from '@/components/buttons/PurpleButton';
import GhostButton from '@/components/buttons/GhostButton';
import WhiteButton from '@/components/buttons/WhiteButton';
import StatusMessage from '@/components/StatusMessage';
import { FaRegCheckCircle } from 'react-icons/fa';
import ScrollableBackground from '@/components/ScrollableBackground';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPopup, setShowResetPopup] = useState(false);

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const isMobile = useBreakpointValue({ base: true, sm: false });
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);

  // Handle form submission for login
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (email === 'merengo@ttk.hu') {
        await loginWithEmailAndPassword(email, password);
        localStorage.setItem('currentUserEmail', email);
        router.push('/experimenter');
      } else {
        await loginWithEmailAndPassword(email, password);
        localStorage.setItem('currentUserEmail', email);
        const timeout = setTimeout(() => router.push('/dashboard'), 1000);
        return () => clearTimeout(timeout);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Email cím nincs megerősítve.') {
          alert(
            'Kérjük, erősítsd meg az e-mail címedet, mielőtt bejelentkezel.'
          );
        } else {
          console.error('Bejelentkezési hiba:', error.message);
          alert(
            'Hiba történt a bejelentkezés során. Ellenőrizze az e-mail címet és a jelszót.'
          );
        }
      } else {
        console.error('Ismeretlen hiba:', error);
        alert('Ismeretlen hiba történt. Kérjük, próbálja újra később.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset request
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      alert('Kérjük, adja meg az e-mail címét.');
      return;
    }

    try {
      await forgotPassword(resetEmail);
      setShowResetPopup(true);
      setTimeout(() => setShowResetPopup(false), 3500);
      setShowResetPassword(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during password reset:', error.message);
        alert(
          'Hiba történt az új jelszó kérésekor. Ellenőrizze az e-mail címét.'
        );
      } else {
        console.error('Ismeretlen hiba:', error);
        alert('Ismeretlen hiba történt. Próbálja újra később.');
      }
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
      overflowY="hidden"
      zIndex="1"
      ref={scrollableContainerRef}
    >
      <Flex
        height="full"
        bg="transparent"
        pt="2vh"
        direction="column"
        overflow="hidden"
        zIndex={2}
      >
        <Container maxW="2xl" py={0} position="relative">
          <StatusMessage show={showResetPopup} top="-12rem">
            <Text textAlign="center">
              Az új jelszó megadásához szükséges linket elküldük a megadott
              e-mail címre!
            </Text>
          </StatusMessage>
          {/* Header */}
          <Flex alignItems="center" mb={0} p="0">
            <GhostButton
              variant="ghost"
              onClick={() => router.push('/')}
              display="inline-flex"
              alignItems="center"
              p={0}
              minW="auto"
              mr={0}
              position="absolute"
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
              Belépés
            </Heading>
          </Flex>
        </Container>

        <Flex
          width="90vw"
          maxWidth="800px"
          rounded="lg"
          height="fit-content"
          position="relative"
          flex="1"
          direction="column"
          alignItems="center"
          justifyContent="flex-start"
          pt={['20px', '20px', '20px']}
          px={6}
          backdropFilter="blur(10px)"
          backgroundColor="rgb(54 52 87 / 15%)"
          zIndex={10}
          m="auto"
          mt="5"
          mb="2"
        >
          <Container maxW="xl" pb={10}>
            {/* Password Reset Form */}

            {showResetPassword ? (
              <>
                <Stack gap={4}>
                  <Heading
                    as="h2"
                    size="lg"
                    fontWeight="bold"
                    textAlign="center"
                    mb={4}
                  >
                    Új jelszó kérése
                  </Heading>
                  <Text>
                    Add meg az e-mail címedet, hogy elküldhessük az új jelszó
                    beállításához szükséges linket:
                  </Text>
                  <Input
                    bg="white"
                    _selection={{ backgroundColor: 'brand.100' }}
                    type="email"
                    placeholder="pelda@pelda.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                  <Flex justifyContent="space-between">
                    <PurpleButton onClick={handlePasswordReset}>
                      Küldés
                    </PurpleButton>
                    <WhiteButton
                      variant="outline"
                      onClick={() => setShowResetPassword(false)}
                    >
                      Mégse
                    </WhiteButton>
                  </Flex>
                </Stack>
              </>
            ) : (
              <Stack as="form" gap={8} onSubmit={handleSubmit}>
                {/* Login Form */}
                <Stack>
                  <Text fontSize="md" fontWeight="medium">
                    E-mail
                  </Text>
                  <Input
                    _selection={{ backgroundColor: 'brand.100' }}
                    fontSize="md"
                    id="email"
                    bg="white"
                    type="email"
                    placeholder="pelda@pelda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Stack>

                <Stack>
                  <Text fontSize="md" fontWeight="medium">
                    Jelszó
                  </Text>
                  <Flex position="relative" alignItems="center">
                    <Input
                      _selection={{ backgroundColor: 'brand.100' }}
                      fontSize="md"
                      id="password"
                      bg="white"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <GhostButton
                      position="absolute"
                      right="10px"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={20} />
                      ) : (
                        <HiOutlineEye size={20} />
                      )}
                    </GhostButton>
                  </Flex>
                </Stack>

                <PurpleButton
                  type="submit"
                  w="70%"
                  mx="auto"
                  loading={isSubmitting}
                  loadingText="Bejelentkezés..."
                >
                  Belépés
                </PurpleButton>

                <GhostButton
                  onClick={() => setShowResetPassword(true)}
                  fontWeight="bold"
                  textAlign="center"
                  mx="auto"
                  style={{ cursor: 'pointer' }}
                  fontSize="sm"
                >
                  Új jelszó kérése
                </GhostButton>
              </Stack>
            )}

            <Separator my={5} mx="auto" w="30%" borderColor="gray.300" />

            {/* Registration Section */}
            <Heading
              as="h2"
              size="lg"
              fontWeight="bold"
              textAlign="center"
              mb={4}
            >
              Még nem találkoztunk?
            </Heading>
            <Flex justifyContent="center">
              <WhiteButton
                variant="outline"
                w="70%"
                mx="auto"
                onClick={() => router.push('/register')}
                mb="20px"
              >
                Regisztráció
              </WhiteButton>
            </Flex>
          </Container>
        </Flex>
      </Flex>
    </Box>
  );
}
