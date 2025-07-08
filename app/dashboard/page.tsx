'use client';

import { useAuthCheck } from '../../hooks/useAuthCheck';
import { useDataCheck } from '../../hooks/useDataCheck';
import { useRouter } from 'next/navigation';
import {
  Box,
  Flex,
  Image,
  Spinner,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import useNickname from '../../hooks/useNickname';
import PurpleButton from '@/components/buttons/PurpleButton';
import { useEffect, useRef, useState } from 'react';
import { useDaysLoggedIn } from '@/hooks/useDaysLoggedIn';
import { useTodayAnsweredCount } from '@/hooks/useTodaysAnsweredCount';
import { soundManager } from '@/lib/sounds';


export default function Page() {
  const { isCheckingAuth, authLoading } = useAuthCheck();
  const dataLoading = useDataCheck();
  const router = useRouter();
  const nickname = useNickname();
  const days = useDaysLoggedIn();
  const dailyCount = useTodayAnsweredCount();
  const isPortrait = useBreakpointValue({ base: true, md: false });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [gameLoading, setGameLoading] = useState(false);
  const [bgHeight, setBgHeight] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    // this runs only in the browser
    const email = localStorage.getItem('currentUserEmail') || 'anonymous';
    setUserEmail(email);
  }, []);

  useEffect(() => {
    if (isCheckingAuth || authLoading || userEmail === null) return;

    // 1) Identify the current user
    const BEM_KEY = `hasPlayedBemutatkozas_${userEmail}`;
    const UDV_KEY = `hasPlayedUdvozlesSession_${userEmail}`;

    // 2) Detect “fresh login” in this tab:
    const prevUser = sessionStorage.getItem('sessionUserEmail');
    if (prevUser !== userEmail) {
      console.log('[Dashboard] 🔄 Fresh login for', userEmail);
      // clear any old udvozles flag so we can play it now
      sessionStorage.removeItem(UDV_KEY);
      // remember that this user is now “in session”
      sessionStorage.setItem('sessionUserEmail', userEmail);
    } else {
      console.log('[Dashboard] ↩️ Same session for', userEmail);
    }

    // 3) Play the appropriate greeting:
    if (!localStorage.getItem(BEM_KEY)) {
      // very first login ever for this user
      console.log('[Dashboard] ▶️ Playing bemutatkozas');
      soundManager.playGroup('bemutatkozas', { once: true });
      localStorage.setItem(BEM_KEY, '1');
      return;  // don’t fall through to udvozles
    }

    if (!sessionStorage.getItem(UDV_KEY)) {
      // first dashboard mount _after_ login for this user
      console.log('[Dashboard] ▶️ Playing udvozles');
      soundManager.playGroup('udvozles');
      sessionStorage.setItem(UDV_KEY, '1');
    } else {
      console.log('[Dashboard] 🔇 No greeting - already played this login');
    }
  }, [isCheckingAuth, authLoading, userEmail]);

  useEffect(() => {
    const update = () => {
      const scrollHeight = scrollRef.current?.scrollHeight || 0;
      setBgHeight(Math.max(scrollHeight, window.innerHeight));
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);


  const gameNav = async () => {
    setGameLoading(true);
    setTimeout(() => {
      setGameLoading(false);
      router.push('/dashboard/game');
    }, 100);
  };

  // Watch scrollable content height
  useEffect(() => {
    const updateHeight = () => {
      if (scrollRef.current) {
        setContentHeight(scrollRef.current.scrollHeight);
      }
    };

    const observer = new ResizeObserver(updateHeight);
    if (scrollRef.current) observer.observe(scrollRef.current);

    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  if (authLoading || isCheckingAuth || dataLoading) {
    return (
      <>
        <Flex minH="100vh" align="center" justify="center">
          <Spinner color="black" size="xl" />
        </Flex>
      </>
    );
  }

  return (
      <Box
        id="main-dash"
        overflowY="auto"
        overflowX="hidden"
        width="100%"
        flex="1"
        pb="6vh"
        zIndex="2"
        display="flex"
        flexDirection="column"
        minHeight={0}
      >
        <Box
          position="sticky"
          top="1.5rem"
          bg="transparent"
          zIndex={10}
          py={2}
        >
          <Flex
            direction="row"
            w={isMobile ? '95vw' : '85vw'}
            justifyContent="space-between"
            mx="auto"
          >
            <Box
              bgColor="gray.100"
              rounded="full"
              shadow="5px 5px 15px 1px rgba(70, 70, 70, 0.2)"
              px={['2', '4']}
              py="2"
            >
              <Text fontSize={['md', 'lg', '2xl']} color="black">
                Tanító napok:{' '}
                <Text as="span" color="brand.500" fontWeight="semibold">
                  {days}
                </Text>
              </Text>
            </Box>
            <Box
              bgColor="gray.100"
              rounded="full"
              shadow="5px 5px 15px 1px rgba(70, 70, 70, 0.2)"
              px={['2', '4']}
              py="2"
            >
              <Text fontSize={['md', 'lg', '2xl']} color="black">
                Ma megtanítva:{' '}
                {dailyCount !== 10 ? (
                  <>
                    <Text as="span" color="brand.500" fontWeight="semibold">
                      {dailyCount || '0'}
                    </Text>
                    <span>/10</span>
                  </>
                ) : (
                  <Text as="span" color="#f2bf05" fontWeight="semibold">
                    {dailyCount || '0'}/10
                  </Text>
                )}
              </Text>
            </Box>
          </Flex>
        </Box>
        {dailyCount! < 10 ?  (
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          m="auto"
          spaceY={10}
          w={{ base: '90%', md: '50%' }}
          zIndex={2}
          flexShrink={0}
          mt={isMobile ? '3rem' : '0rem'}
          width="100%" // or `maxW="100%"` if needed
          overflow="hidden" // if you're doing `flex` layout  
        >
          <VStack zIndex={2} gap={4}>
            <Text fontSize={['2xl', '3xl']} color="black" fontWeight="bold">
              Szia{nickname}!
            </Text>
            <Text fontSize={['xl', '2xl']} color="black" fontWeight="bold">
              {days! <= 1 ? 'Segíts Mimónak, hogy megtanulja mit jelentenek a szavak!' : 'Üdvözlünk ismét!'}
            </Text>
            <Text fontSize={['xl', '2xl']} color="black" fontWeight="bold">
              {days! <= 1 ? (
                'Ez az első napod, hogy Mimónak segítesz!'
              ) : (
                <>
                  Ez már a{' '}
                  <Text as="span" color="brand.500">
                    {days}.
                  </Text>{' '}
                  nap, amikor Mimónak segítesz tanulni!
                </>
              )}
            </Text>

            <Image
              src="/mimo-frontal.png"
              height="40vh"
              filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
              alt="Main Character"
            />
          </VStack>

          <Flex
            direction="column"
            align="center"
            justify="center"
            w="full"
            mt={6}
          >
            <PurpleButton
              onClick={gameNav}
              fontWeight="bold"
              py={6}
              px={6}
              fontSize="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="300px"
              gap={2}
              loading={gameLoading}
              loadingText="Betöltés..."
              zIndex={2}
            >
              Induljon a mai móka!
            </PurpleButton>
          </Flex>
        </Flex>
        ) : (
          <Flex
            direction="column"
            align="center"
            textAlign="center"
            m="auto"
            py={isPortrait ? '8vh' : '8vh'}
            spaceY={isPortrait ? 10 : 10}
            h={{ base: 'auto', md: '90vh' }}
            w={{ base: '90%', md: '50%' }}
            zIndex={2}
          >
            <VStack zIndex={2}>
              <Text fontSize={['2xl', '3xl']} color="black" fontWeight="bold">
                Nagyon ügyes voltál ma, {nickname}!
              </Text>
              <Text fontSize={['xl', '2xl']} color="black" fontWeight="bold">
                Mind a tíz fogalmat megtanítottad Mimónak.
              </Text>
              <Text fontSize={['xl', '2xl']} color="black" fontWeight="bold">
                Mimó már fáradt, de holnap vár vissza újabb tíz fogalommal!
              </Text>

              <Image
                src="/mimo-frontal.png"
                height="40vh"
                filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                alt="Main Character"
              />
            </VStack>
          </Flex>
        )}
      </Box>
  );
}
