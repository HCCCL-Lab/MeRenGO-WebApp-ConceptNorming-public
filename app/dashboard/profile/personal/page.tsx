'use client';

import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Spinner,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../../lib/UserContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestoredb } from '../../../api/firebase';
import { updateProfile } from 'firebase/auth';
import PurpleButton from '@/components/buttons/PurpleButton';
import { DataForm } from './components/DataForm';
import StatusMessage from '@/components/StatusMessage';

export default function PersonalDataPage() {
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
  }>(/* initial data */);

  const [initialFormData, setInitialFormData] = useState(formData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const locationOptions = ['Főváros', 'Megyeszékhely', 'Város', 'Falu'];

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (userLoading) return;

      if (user) {
        const docRef = doc(firestoredb, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          let parsedBirthdate = null;
          if (data.birthdate) {
            try {
              // Convert "YYYY. MM. DD." to "YYYY-MM-DD" for safe parsing
              const fixedDate = data.birthdate.replace(/\./g, '').trim().split(' ').join('-');
              parsedBirthdate = new Date(fixedDate);

              // If invalid, reset it
              if (isNaN(parsedBirthdate.getTime())) {
                parsedBirthdate = null;
              }
            } catch (error) {
              console.error('Invalid birthdate format:', data.birthdate);
              parsedBirthdate = null;
            }
          }
          setFormData({
            nickname: data.nickname || '',
            birthdate: parsedBirthdate,
            location: data.location || '',
            gender: data.gender || '',
            school: data.school || '',
            grade: data.grade || '',
            days: data.days || 0,
            daily_count: data.daily_count || 0,
            first_dashboard_today: data.first_dashoard_today || true,
          });
          setInitialFormData({
            nickname: data.nickname || '',
            birthdate: parsedBirthdate,
            location: data.location || '',
            gender: data.gender || '',
            school: data.school || '',
            grade: data.grade || '',
            days: data.days || 0,
            daily_count: data.daily_count || 0,
            first_dashboard_today: data.first_dashboard_today || true,
          }); // Set initial form data on fetch
        }
      }
    };

    fetchUserData();
  }, [user, userLoading]);

  // Check if form data has changed
  const isFormChanged =
    JSON.stringify(formData) !== JSON.stringify(initialFormData);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formData || !formData.nickname.trim()) {
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
      // Save to Firestore
      await setDoc(doc(firestoredb, 'users', user!.uid), {
        ...formData,
        birthdate: formData.birthdate?.toLocaleDateString() || null,
      });

      // Update Firebase Auth Profile
      await updateProfile(user!, { displayName: formData.nickname.trim() });
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 2000);
      setSuccess('Az adatok sikeresen mentésre kerültek!');
      setError(null);
    } catch (err) {
      setError('Hiba történt a mentés során. Próbálja újra később.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="100vh">
        <Text color="red.500">
          Kérjük, jelentkezzen be az űrlap kitöltéséhez!
        </Text>
      </Center>
    );
  }

  return (
    <Container
      maxW="xl"
      pt={8}
      mt={isMobile ? '-10' : '0'}
      centerContent
      backdropFilter="blur(10px)"
      backgroundColor="rgb(54 52 87 / 15%)"
      rounded="lg"
      w="90%"
      mx="auto"
      minH="auto" // ✅ No forced height
      overflow="visible" // ✅ Prevents extra scrolling inside this component
    >
      <StatusMessage show={showStatus} top="-40">Sikeres mentés!</StatusMessage>

      <Container maxW="2xl" pb={10} w="90%">
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            {formData && (
              <DataForm formData={formData} setFormData={setFormData} />
            )}
            <PurpleButton
              type="submit"
              w="70%"
              mx="auto"
              loading={isSubmitting}
              loadingText="Mentés..."
              disabled={!isFormChanged}
            >
              Mentés
            </PurpleButton>
          </Stack>
        </form>
      </Container>
    </Container>
  );
}
