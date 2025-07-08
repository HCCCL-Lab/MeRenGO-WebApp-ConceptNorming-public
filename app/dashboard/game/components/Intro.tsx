import React from 'react';
import { Box, Button, Heading, Image, Text, VStack } from '@chakra-ui/react';
import PurpleButton from '@/components/buttons/PurpleButton';
import Video from '@/components/Video';
import { soundManager } from '@/lib/sounds';
import useConcepts from '@/hooks/useConcepts';

interface IntroProps {
  show: boolean;
  handleClose: () => void;
}

const Intro: React.FC<IntroProps> = ({ show, handleClose }) => {
  // Determine which video to show based on the user's gender
  const { practice } = useConcepts();
  const videoId = practice === 'female' ? 'FdQFZShGV4k' : 'JP2VIkYYrng';

  // Map practice to the concept-specific voice line ID
  const conceptId = `cat_00_${practice}`;

  if (!show) return null;

  const onClick = () => {
    // Play the intro group and then the gender-specific concept voice line
    soundManager
      .playSequence([
        { type: 'group', group: 'gyakorlasEleje', opts: { once: true } },
        { type: 'concept', id: conceptId },
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
          Kérlek, hogy nézd meg ezt a rövid mesét Mimóval, mielőtt kipróbálod a játékot!
        </Text>

        <Box zIndex={10} width="90vw" maxWidth="800px" mt="2">
          <Video videoId={videoId} />
        </Box>

        <PurpleButton onClick={onClick} w="200px" mt="2rem">
          Próbáld ki a játékot!
        </PurpleButton>
      </VStack>
    </Box>
  );
};

export default Intro;
