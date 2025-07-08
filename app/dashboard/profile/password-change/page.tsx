'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Input,
  Separator,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
import { useUser } from '../../../../lib/UserContext';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import PurpleButton from '@/components/buttons/PurpleButton';

export default function PasswordChangePage() {
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!user || !user.email) {
      setMessage({
        text: 'Hiba: Nincs bejelentkezett felhasználó.',
        type: 'error',
      });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        text: 'Az új jelszónak legalább 6 karakter hosszúnak kell lennie.',
        type: 'error',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'A jelszavak nem egyeznek meg.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);

      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      setMessage({ text: 'A jelszó sikeresen megváltozott!', type: 'success' });
    } catch (error: any) {
      let errorMsg = 'Hiba történt a jelszó módosításakor.';
      if (error.code === 'auth/wrong-password')
        errorMsg = 'A jelenlegi jelszó helytelen.';
      if (error.code === 'auth/weak-password')
        errorMsg = 'Az új jelszó túl gyenge.';
      if (error.code === 'auth/requires-recent-login')
        errorMsg = 'Bejelentkezés szükséges a jelszó módosításához.';

      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      maxW="xl"
      py={2}
      mt={isMobile ? '-10' : '0'}
      centerContent
      backdropFilter="blur(10px)"
      backgroundColor="rgb(54 52 87 / 15%)"
      rounded="lg"
      overflow="hidden"
      maxH="calc(100vh - 180px)"
    >
      <Box w="full" py={4} bg="transparent">
        <form onSubmit={handlePasswordChange}>
          <VStack gap={8} align="stretch" minW="200px">
            {!isMobile ? (
              <>
                {' '}
                <Grid
                  templateColumns={{ base: '1fr', md: '3fr 5fr' }}
                  mx="4"
                  gap={6}
                >
                  {/* Current Password */}
                  <GridItem>
                    <Text fontWeight="medium">Jelenlegi jelszó</Text>
                  </GridItem>
                  <GridItem>
                    <Box>
                      <Input
                        _selection={{ backgroundColor: 'brand.100' }}
                        bg="white"
                        type="password"
                        placeholder="Adja meg a jelenlegi jelszót"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        borderWidth="1px"
                        borderColor="gray.300"
                        borderRadius="md"
                        _focus={{ borderColor: 'blue.400' }}
                      />
                    </Box>
                  </GridItem>
                  <GridItem colSpan={2}>
                    <Separator width="full" borderColor="gray.200" mx="auto" />
                  </GridItem>
                  {/* New Password */}
                  <GridItem>
                    <Text fontWeight="medium">Új jelszó</Text>
                  </GridItem>
                  <GridItem>
                    <Box>
                      <Input
                        _selection={{ backgroundColor: 'brand.100' }}
                        bg="white"
                        type="password"
                        placeholder="Adja meg az új jelszót"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        borderWidth="1px"
                        borderColor="gray.300"
                        borderRadius="md"
                        _focus={{ borderColor: 'blue.400' }}
                      />
                    </Box>
                  </GridItem>
                  <GridItem colSpan={2}>
                    <Separator width="full" borderColor="gray.200" mx="auto" />
                  </GridItem>
                  {/* Confirm Password */}
                  <GridItem>
                    <Text fontWeight="medium">Új jelszó megerősítése</Text>
                  </GridItem>
                  <GridItem>
                    <Box>
                      <Input
                        _selection={{ backgroundColor: 'brand.100' }}
                        bg="white"
                        type="password"
                        placeholder="Ismételje meg az új jelszót"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        borderWidth="1px"
                        borderColor="gray.300"
                        borderRadius="md"
                        _focus={{ borderColor: 'blue.400' }}
                      />
                    </Box>
                  </GridItem>
                </Grid>
              </>
            ) : (
              <VStack gap={6}>
                {/* Current Password */}
                <Box w="90%" maxW="300px">
                  <Text fontWeight="medium">Jelenlegi jelszó</Text>
                  <Input
                    _selection={{ backgroundColor: 'brand.100' }}
                    bg="white"
                    type="password"
                    placeholder="Adja meg a jelenlegi jelszót"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    borderWidth="1px"
                    borderColor="gray.300"
                    borderRadius="md"
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>

                {/* New Password */}
                <Box w="90%" maxW="300px">
                  <Text fontWeight="medium">Új jelszó</Text>
                  <Input
                    _selection={{ backgroundColor: 'brand.100' }}
                    bg="white"
                    type="password"
                    placeholder="Adja meg az új jelszót"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    borderWidth="1px"
                    borderColor="gray.300"
                    borderRadius="md"
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>

                {/* Confirm Password */}
                <Box w="90%" maxW="300px">
                  <Text fontWeight="medium">Új jelszó megerősítése</Text>
                  <Input
                    _selection={{ backgroundColor: 'brand.100' }}
                    bg="white"
                    type="password"
                    placeholder="Ismételje meg az új jelszót"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    borderWidth="1px"
                    borderColor="gray.300"
                    borderRadius="md"
                    _focus={{ borderColor: 'blue.400' }}
                  />
                </Box>
              </VStack>
            )}

            {/* Submit Button */}
            <PurpleButton
              type="submit"
              mx="auto"
              width="full"
              loading={isSubmitting}
              loadingText="Mentés..."
              mt="6"
            >
              Jelszó módosítása
            </PurpleButton>

            {/* Success/Error Message */}
            {message && (
              <Text
                color={message.type === 'success' ? 'brand.900' : 'red.500'}
                textAlign="center"
              >
                {message.text}
              </Text>
            )}
          </VStack>
        </form>
      </Box>
    </Container>
  );
}
