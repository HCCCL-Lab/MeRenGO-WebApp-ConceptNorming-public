'use client';

import {
  Box,
  Flex,
  Spinner,
  Stack,
  useBreakpointValue,
  Container,
  Text,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import 'react-datepicker/dist/react-datepicker.css';
import { useExperimenterCheck } from '@/hooks/useExperimenterCheck';
import { useUser } from '@/lib/UserContext';
import { firestoredb } from '@/app/api/firebase';
import { DataForm } from './components/DataForm';
import PurpleButton from '@/components/buttons/PurpleButton';

export default function ParticipantDataPage() {
  const { isCheckingExperimenter, experimenterLoading } = useExperimenterCheck();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  // Ref for background container
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);

  // State: Form Data
  const [formData, setFormData] = useState({
    nickname: '',
    birthdate: null as Date | null,
    location: '',
    gender: '',
    school: '',
    grade: '',
  });

  // State: Submission, Error, Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State: Pseudo UID
  const [pseudoUID, setPseudoUID] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let uid = sessionStorage.getItem('pseudoUID');
      if (!uid) {
        uid = Array.from({ length: 28 }, () =>
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 62))
        ).join('');
        sessionStorage.setItem('pseudoUID', uid);
      }
      setPseudoUID(uid);
    }
  }, []);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!pseudoUID) {
      setError('Egyedi azonosító nem generálódott. Frissítse az oldalt.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.nickname.trim()) {
      setError('A név megadása kötelező!');
      setIsSubmitting(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('A lakóhely megadása kötelező!');
      setIsSubmitting(false);
      return;
    }

    try {
      const sanitizedData: Record<string, any> = {
        ...formData,
        birthdate: formData.birthdate
          ? formData.birthdate.toLocaleDateString('hu-HU', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).replace(/\//g, '. ')
          : null,
      };

      // Replace undefined with null
      Object.keys(sanitizedData).forEach((key) => {
        if (sanitizedData[key] === undefined) sanitizedData[key] = null;
      });

      console.log('Saving doc for pseudoUID:', pseudoUID, sanitizedData);

      await setDoc(doc(firestoredb, 'users', pseudoUID), sanitizedData);

      setSuccess('Az adatok sikeresen mentésre kerültek!');
      router.push('/experimenter/game');
    } catch (err: any) {
      console.error('Firestore write error:', err);
      setError('Hiba történt a mentés során. Próbálja újra később.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (experimenterLoading || isCheckingExperimenter) {
    return (
      <Flex
        bg="transparent"
        minH="100vh"
        minW="100vw"
        direction="column"
        align="center"
        justify="center"
      >
        <Spinner color="black" size="xl" />
      </Flex>
    );
  }

  return (
    <Box
      bg="transparent"
      rounded="md"
      display="flex"
      flexDir="column"
      overflowY="hidden"
      mt="10"
    >
      <Flex
        width="90vw"
        maxWidth="800px"
        backdropFilter="blur(10px)"
        backgroundColor="rgb(54 52 87 / 15%)"
        rounded="lg"
        direction="column"
        alignItems="center"
        justifyContent="flex-start"
        pt="20px"
        px={6}
        ref={scrollableContainerRef}
        zIndex={10}
        m="auto"
        mb="10"
      >
        <Container maxW="xl" pb={10}>
          <Text fontWeight="bold" textAlign="center" fontSize="2xl" mb="6">
            Gyermek adatai
          </Text>
          <form onSubmit={handleSubmit}>
            <Stack gap={7}>
              <DataForm
                initialFormData={formData}
                onFormDataChange={setFormData}
              />
              {error && (
                <Text color="red.500" fontSize="md" textAlign="center">
                  {error}
                </Text>
              )}
              <PurpleButton
                type="submit"
                w="70%"
                mx="auto"
                mt="8"
                loading={isSubmitting}
                loadingText="Mentés..."
              >
                Mentés
              </PurpleButton>
            </Stack>
          </form>
        </Container>
      </Flex>
    </Box>
  );
}
