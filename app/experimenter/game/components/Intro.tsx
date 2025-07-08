import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import PurpleButton from '@/components/buttons/PurpleButton';
import Video from '@/components/Video';
import { soundManager } from '@/lib/sounds';
import useExperimenterGame from '@/hooks/useExperimenterGame';

// Now accepting pseudoUID to fetch practice/gender
interface IntroProps {
  show: boolean;
  handleClose: () => void;
  pseudoUID: string;
}

const ExperimenterIntro: React.FC<IntroProps> = ({ show, handleClose, pseudoUID }) => {
  const { practice } = useExperimenterGame(pseudoUID);
  if (!show) return null;

  // Grab practice (gender) from experimenter hook using pseudoUID
  const videoId = practice === 'female' ? 'FdQFZShGV4k' : 'JP2VIkYYrng';

  const onClick = () => {
    soundManager
      .playSequence([
        { type: 'group', group: 'gyakorlasEleje' },
        { type: 'group', group: 'beirasBemutato' },
      ])
      .catch(console.error);
    handleClose();
  };

  return (
    <Box
      bg="transparent"
      position="relative"
      p={2}
      width="full"
      textAlign="center"
      overflow="visible"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <VStack position="relative" width="100%" justifyContent="flex-start">
        <Heading as="h2" size="3xl" color="black" fontWeight="bold">
          Szervusz!
        </Heading>

        <Text fontSize="xl" fontWeight="bold" mt="2">
          Elsőként nézzünk meg egy rövid mesét Mimóról!
        </Text>

        <Box zIndex={10} width="90vw" maxWidth="800px" mt="2">
          <Video videoId={videoId} />
        </Box>

        <PurpleButton onClick={onClick} w="200px" mt="2rem">
          Tovább a gyakorlásra!
        </PurpleButton>
      </VStack>
    </Box>
  );
};

export default ExperimenterIntro;
