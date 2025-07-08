'use client';

import {
  Container,
  Heading,
  Flex,
  Stack,
  Text,
  Separator,
  Box,
  Grid,
  GridItem,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageBar from '@/components/bars/PageBar';
import PurpleButton from '@/components/buttons/PurpleButton';
import WhiteButton from '@/components/buttons/WhiteButton';
import Video from '@/components/Video';
import ScrollableBackground from '@/components/ScrollableBackground';
import { soundManager } from '@/lib/sounds'


export default function Home() {
  // router instance
  const router = useRouter();

  // SoundManager instance
  useEffect(() => {
    const onFirstTap = () => {
      soundManager.unlock()
      document.removeEventListener('touchstart', onFirstTap)
    }
    document.addEventListener('touchstart', onFirstTap, { once: true })
  }, [])

  // Loading state for buttons
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation functions with loading state
  const registerNav = async () => {
    setRegisterLoading(true);
    setTimeout(() => {
      setRegisterLoading(false);
      router.push('/register');
    }, 100); // Timeout of 0.1 seconds
  };

  const loginNav = async () => {
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      router.push('/login');
    }, 100); // Timeout of 0.1 seconds
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
      <Box
        bg="transparent"
        minW="100vw"
        zIndex="1"
        overflowY="hidden"
      >
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          mx="auto"
          pt="2rem"
          pb="2rem"
          spaceY={2}
        >
          <Container maxW="4xl" position="relative" zIndex={1}>
            <Heading
              as="h1"
              size={['xl', '2xl', '3xl']}
              fontWeight="bold"
              textAlign="center"
              mx="auto"
            >
              Fedezd fel gyermeked gondolkodásának világát!
            </Heading>
          </Container>

          <Flex
            flex="1"
            direction="column"
            alignItems="center"
            justifyContent="flex-start"
            mt="-2vh"
            px={1}
            zIndex={1}
          >
            <Container maxW="4xl" py={[0, 4, 4]} position="relative">
              <Stack gap={[2, 4, 4]} textAlign="center">
                <Text fontSize={['sm', 'md', 'lg']}>
                  Az alkalmazásunk segít megérteni,{' '}
                  <b>hogyan látják a 6-8 évesek a világot</b>.
                </Text>
                <Text fontSize={['sm', 'md', 'lg']}>
                  Szülőként/gondviselőként egy{' '}
                  <b>különleges utazás részese lehetsz</b>, miközben
                  hozzájárulsz egy izgalmas tudományos kutatáshoz.
                </Text>
                <Text fontSize={['sm', 'md', 'lg']}>
                  További <b>részletekért</b> nézd meg <b>bemutató videónkat</b>
                  , vagy kattints a <b>Rólunk</b> menüpontra.
                </Text>
              </Stack>
              {isMobile ? (
                <Stack gap={4} mt={4} textAlign="center" mx="auto">
                  <Video videoId="Ph4CJaT6WXI" />
                  <Grid
                    templateRows="repeat(3, 1, 2)"
                    templateColumns="repeat(2, 1fr)"
                    alignItems="center"
                    gapY="4"
                  >
                    <GridItem>
                      <Heading
                        as="h2"
                        size={['md', '2xl', '3xl']}
                        fontWeight="bold"
                      >
                        Csatlakozz a felfedezéshez:
                      </Heading>
                    </GridItem>
                    <GridItem>
                      <PurpleButton
                        size="lg"
                        onClick={registerNav}
                        py={6}
                        width="80%"
                        mx="auto"
                        loading={registerLoading}
                        loadingText="Töltés..."
                      >
                        Regisztráció
                      </PurpleButton>
                    </GridItem>
                    <GridItem colSpan={2}>
                      <Separator></Separator>
                    </GridItem>
                    <GridItem>
                      <Heading
                        as="h3"
                        size={['md', '2xl', '3xl']}
                        fontWeight="bold"
                      >
                        Már találkoztunk?
                      </Heading>
                    </GridItem>
                    <GridItem>
                      <WhiteButton
                        size="lg"
                        onClick={loginNav}
                        py={6}
                        width="80%"
                        mx="auto"
                        loading={loginLoading}
                        loadingText="Töltés..."
                      >
                        Belépés
                      </WhiteButton>
                    </GridItem>
                  </Grid>
                </Stack>
              ) : (
                <Stack gap={4} mt={10} textAlign="center" mx="auto">
                  <Grid
                    templateRows="repeat(3, 1, 2)"
                    templateColumns="repeat(4, 1fr)"
                    alignItems="center"
                    gapY="4"
                  >
                    <GridItem colSpan={3}>
                      <Video videoId="Ph4CJaT6WXI" />
                    </GridItem>
                    <GridItem>
                      <Grid
                        templateRows="repeat(2, 1, 2)"
                        templateColumns="repeat(2, 1fr)"
                      >
                        <GridItem rowSpan={2}>
                          <Separator
                            orientation="vertical"
                            height="full"
                            borderColor="gray.300"
                          />
                        </GridItem>
                        <GridItem marginLeft="6">
                          <Stack gap={4} mt={-4} textAlign="center" mx="auto">
                            <Heading as="h2" size="2xl" fontWeight="bold">
                              Csatlakozz a felfedezéshez!
                            </Heading>

                            <PurpleButton
                              onClick={registerNav}
                              mx="auto"
                              minW="200px"
                              loading={registerLoading}
                              loadingText="Töltés..."
                              p={6}
                            >
                              Regisztráció
                            </PurpleButton>

                            <Separator
                              my={2}
                              mx="auto"
                              w="70%"
                              borderColor="gray.300"
                            />

                            <Heading as="h3" size="2xl" fontWeight="bold">
                              Már találkoztunk?
                            </Heading>

                            <WhiteButton
                              onClick={loginNav}
                              mx="auto"
                              minW="200px"
                              loading={loginLoading}
                              loadingText="Töltés..."
                              p={6}
                            >
                              Belépés
                            </WhiteButton>
                          </Stack>
                        </GridItem>
                      </Grid>
                    </GridItem>
                  </Grid>
                </Stack>
              )}
            </Container>
          </Flex>
        </Flex>
      </Box>
  );
}
