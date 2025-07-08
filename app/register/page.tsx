'use client';

import {
  Container,
  Heading,
  Input,
  Flex,
  Link,
  Stack,
  Text,
  Separator,
  Box,
  Image,
  useBreakpointValue,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { FiArrowLeft } from 'react-icons/fi';
import PageBar from '@/components/bars/PageBar';
import { registerWithEmailAndPassword } from '@/lib/auth';
import PurpleButton from '@/components/buttons/PurpleButton';
import WhiteButton from '@/components/buttons/WhiteButton';
import GhostButton from '@/components/buttons/GhostButton';
import { doc, setDoc } from 'firebase/firestore';
import StatusMessage from '@/components/StatusMessage'; // Adjust the path as needed
import { firestoredb } from '@/app/api/firebase';
import { EmailAuthCredential, updateProfile } from 'firebase/auth';
import { DataForm } from './components/DataForm';
import { GoLinkExternal } from 'react-icons/go';
import ScrollableBackground from '@/components/ScrollableBackground';

interface FormValues {
  email: string;
  password: string;
  privacyPolicy: boolean;
}

export default function RegisterPage() {
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState<{
    nickname: string;
    birthdate: Date | null;
    location: string;
    gender: string;
    school: string;
    grade: string;
    days: number;
    daily_count: number;
    first_dashboard_today: boolean;
  }>({
    nickname: '',
    birthdate: null,
    location: '',
    gender: '',
    school: '',
    grade: '',
    days: 1,
    daily_count: 0,
    first_dashboard_today: true,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [hasReadPrivacyPolicy, setHasReadPrivacyPolicy] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showCheckPrompt, setShowCheckPrompt] = useState(false);
  const [isFormIncomplete, setIsFormIncomplete] = useState(true);

  const privacyPolicyRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  const isMobile = useBreakpointValue({ base: true, sm: false });

  useEffect(() => {
    setIsFormIncomplete(
      !formData.nickname ||
        !formData.birthdate ||
        !formData.location ||
        !formData.gender ||
        !formData.school ||
        (formData.school === 'Iskola' && !formData.grade) ||
        !isChecked ||
        !watch('email') ||
        !watch('password')
    );
  }, [formData, isChecked, watch]);

  useEffect(() => {
    if (errors.privacyPolicy && privacyPolicyRef.current) {
      privacyPolicyRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [errors]);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onSubmit: (data: FormValues) => Promise<void> = async (
    data: FormValues
  ) => {
    if (!isMountedRef.current) return; // ✅ Prevent state updates if unmounted

    setIsSubmitting(true);
    setFirebaseError(null);

    try {
      const newUser = await registerWithEmailAndPassword(
        data.email,
        data.password,
        formData.nickname.trim()
      );

      if (!newUser) throw new Error('Felhasználói adatok nem elérhetők');

      const userId = newUser.uid;

      await setDoc(doc(firestoredb, 'users', userId), {
        ...formData,
        birthdate: formData.birthdate ? formData.birthdate.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\//g, '. ')
    : null,
      });

      await updateProfile(newUser, { displayName: formData.nickname });

      router.push('/register-success');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setFirebaseError('Ez az e-mail cím már használatban van');
      } else {
        setFirebaseError(
          'Hiba történt a regisztráció során. Próbálja újra később.'
        );
      }
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  };

  const handlePrivacyPolicyClick = () => {
    setHasReadPrivacyPolicy(true);
  };

  const handleCheck = () => {
    setIsChecked(true);
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAttemptedClick = () => {
    setShowCheckPrompt(true);
    
    // ✅ Clear any existing timeout before setting a new one
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => setShowCheckPrompt(false), 2000);
  };

  // ✅ Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
      <Box
        bg="transparent"
        minW="100vw"
        pb="0"
        zIndex="1"
      >

        {firebaseError === 'Ez az e-mail cím már használatban van' && (
          <Box
            position="fixed"
            top="30%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={2000}
            w="90%"
            maxW="600px"
            pointerEvents="auto"
          >
            <StatusMessage show={true} w="100%" position="relative" top={''}>
              <Box position="absolute" top="8px" right="12px">
                <GhostButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setFirebaseError(null)}
                >
                  ✕
                </GhostButton>
              </Box>
              <Text fontWeight="bold" mb={2}>
                Regisztrációs hiba
              </Text>
              <Text>
                Ezzel az e-mail címmel már van felhasználónk.{' '}
                <Link
                  href="/login"
                  color="red.800"
                  textDecoration="underline"
                  _hover={{ color: 'red.600' }}
                >
                  Ha elfelejtetted a jelszavad, kérj új jelszót!
                </Link>
              </Text>
            </StatusMessage>
          </Box>
        )}

        <Flex
          height="full"
          bg="transparent"
          pt="2vh"
          direction="column"
          zIndex={2}
        >
          <Container maxW="2xl" py={0} position="relative">
            <Flex alignItems="center" mb={0} p="0">
              <GhostButton
                variant="ghost"
                onClick={() => {
                  router.push('/');
                }}
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
                Regisztráció
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
            pt={['20px', '20px', '20px']}
            px={6}
            backdropFilter="blur(10px)"
            backgroundColor="rgb(54 52 87 / 15%)"
            zIndex={10}
            m="auto"
            mt="10"
            mb="10"
          >
            <Container maxW="xl" pb={10}>
              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap={6}>
                  <Heading textAlign="center" fontWeight="bold" mb="-2">
                    Felhasználói adatok
                  </Heading>

                  {isMobile ? (
                    <>
                      {/* Email Input */}
                      <Stack>
                        <Text fontSize="md" fontWeight="medium">
                          E-mail
                        </Text>
                        <Input
                          fontSize="md"
                          id="email"
                          bg="white"
                          type="email"
                          placeholder="pelda@pelda.com"
                          _selection={{ backgroundColor: 'brand.100' }}
                          {...register('email', {
                            required: 'Kérjük, hogy adja meg az e-mail címét.',
                          })}
                        />
                        {errors.email && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {errors.email.message}
                          </Text>
                        )}
                      </Stack>

                      {/* Password Input */}
                      <Stack>
                        <Text fontSize="md" fontWeight="medium">
                          Jelszó
                        </Text>
                        <Text fontSize="sm" color="gray.600" mt={-1} mb={1}>
                          Legalább 6 karakter
                        </Text>
                        <Flex position="relative" alignItems="center">
                          <Input
                            fontSize="md"
                            id="password"
                            bg="white"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="******"
                            _selection={{ backgroundColor: 'brand.100' }}
                            {...register('password', {
                              required: 'Kérjük, adjon meg egy jelszót',
                              minLength: {
                                value: 6,
                                message:
                                  'A jelszó legalább 6 karakterből álljon',
                              },
                            })}
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
                        {errors.password && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {errors.password.message}
                          </Text>
                        )}
                      </Stack>
                    </>
                  ) : (
                    <Grid
                      templateColumns={{ base: '1fr', md: '3fr 5fr' }}
                      gap={4}
                      mx="4"
                    >
                      <GridItem>
                        <Text fontSize="md" fontWeight="medium">
                          E-mail
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Input
                          fontSize="md"
                          id="email"
                          bg="white"
                          type="email"
                          placeholder="pelda@pelda.com"
                          _selection={{ backgroundColor: 'brand.100' }}
                          {...register('email', {
                            required: 'Kérjük, hogy adja meg az e-mail címét.',
                          })}
                        />
                        {errors.email && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {errors.email.message}
                          </Text>
                        )}
                      </GridItem>
                      <GridItem colSpan={2}>
                        <Separator
                          width="full"
                          borderColor="gray.200"
                          mx="auto"
                        />
                      </GridItem>
                      {/* Password Input */}
                      <GridItem>
                        <Text fontSize="md" fontWeight="medium">
                          Jelszó
                        </Text>
                        <Text fontSize="sm" color="gray.600" mt={-1} mb={1}>
                          Legalább 6 karakter
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Flex position="relative" alignItems="center">
                          <Input
                            fontSize="md"
                            id="password"
                            bg="white"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="******"
                            _selection={{ backgroundColor: 'brand.100' }}
                            {...register('password', {
                              required: 'Kérjük, adjon meg egy jelszót',
                              minLength: {
                                value: 6,
                                message:
                                  'A jelszó legalább 6 karakterből álljon',
                              },
                            })}
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
                        {errors.password && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {errors.password.message}
                          </Text>
                        )}
                      </GridItem>
                    </Grid>
                  )}

                  {/* Personal Data Form*/}
                  <Heading textAlign="center" fontWeight="bold" mb="-4">
                    Gyermek adatai
                  </Heading>
                  <Text textAlign="center">
                    A gyermek adatait kutatási célból kérjük megadni. Részletes
                    tájékoztatást az{' '}
                    <Link
                      href="/merengo-tajekoztato-beleegyezo-adatkezeles-ONLINE.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="brand.600"
                      textDecoration="underline"
                      _hover={{ color: 'brand.300' }}
                      onClick={handlePrivacyPolicyClick}
                    >
                      Adatkezelési tájékoztató
                    </Link>
                    ban nyújtunk.
                  </Text>
                  <DataForm
                    initialFormData={formData}
                    onFormDataChange={setFormData}
                  />
                  <Text textAlign="left" mt="4" mb="4" mx="4">
                    Folytatás előtt kérjük, olvassa el az{' '}
                    <Link
                      href="/merengo-tajekoztato-beleegyezo-adatkezeles-ONLINE.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="brand.600"
                      textDecoration="underline"
                      _hover={{ color: 'brand.300' }}
                      onClick={handlePrivacyPolicyClick}
                      fontWeight="bold"
                    >
                      Adatkezelési tájékoztatót
                      <GoLinkExternal />
                    </Link>
                  </Text>
                  {/* Privacy Policy */}
                  <Flex
                    direction="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    w="100%"
                  >
                    <Flex
                      alignItems="center"
                      gap={2}
                      ref={privacyPolicyRef}
                      id="privacyPolicy"
                    >
                      {showCheckPrompt && (
                        <Box
                          mt="-16"
                          ml="-2"
                          position="fixed"
                          bg="orange.200"
                          py="1"
                          px="2"
                          rounded="md"
                          fontWeight="semibold"
                          fontSize={isMobile ? 'sm' : 'md'}
                        >
                          Kérjük, olvassa el az Adatkezelési tájékoztatót!
                        </Box>
                      )}
                      <Checkbox
                        ml="4"
                        type="checkbox"
                        {...register('privacyPolicy', {
                          required: isChecked
                            ? ''
                            : 'Az adatvédelmi tájékoztató elfogadása kötelező!',
                        })}
                        bgColor="white"
                        rounded="md"
                        colorPalette="brand"
                        _checked={{ bgColor: 'brand.700', color: 'white' }}
                        checked={isChecked}
                        onClick={() => {
                          if (!hasReadPrivacyPolicy) {
                            handleAttemptedClick();
                          } else {
                            handleCheck();
                          }
                        }}
                      />
                      <Text textAlign="left" m="auto">
                        Elolvastam és megértettem az Adatkezelési tájékoztatót.
                      </Text>
                    </Flex>
                    {errors.privacyPolicy && (
                      <Text color="red.500" fontSize="sm" mt={2}>
                        {errors.privacyPolicy.message}
                      </Text>
                    )}
                  </Flex>

                  {/* Submit Button */}
                  <PurpleButton
                    type="submit"
                    w="70%"
                    mx="auto"
                    loading={isSubmitting}
                    loadingText="Küldés"
                    disabled={isFormIncomplete}
                    title={
                      isFormIncomplete
                        ? 'Töltse ki az összes mezőt!'
                        : 'Regisztráció'
                    }
                  >
                    Regisztráció
                  </PurpleButton>
                </Stack>
              </form>

              <Separator my={5} mx="auto" w="30%" borderColor="gray.400" />

              {/* Login Link */}
              <Heading
                as="h2"
                size="lg"
                fontWeight="bold"
                textAlign="center"
                mb={4}
              >
                Már találkoztunk?
              </Heading>
              <Flex justifyContent="center">
                <WhiteButton
                  w="70%"
                  onClick={() => router.push('/login')}
                  mb="20px"
                >
                  Belépés
                </WhiteButton>
              </Flex>
            </Container>
          </Flex>
        </Flex>
      </Box>
  );
}
