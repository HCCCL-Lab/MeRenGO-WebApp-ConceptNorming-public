import React from 'react';
import { Box, Button, Heading, Image, Text, VStack } from '@chakra-ui/react';
import PurpleButton from '@/components/buttons/PurpleButton';
import useConcepts from '@/hooks/useConcepts';

interface PracticeFeedbackProps {
  show: boolean;
  handleClose: () => void;
}

const PracticeFeedback: React.FC<PracticeFeedbackProps> = ({
  show,
  handleClose,
}) => {
  const { setPracticeDone } = useConcepts();

  const handleClosePracticeFeedback = () => {
    handleClose();
    setPracticeDone();
  };

  if (!show) return null;

  return (
    <Box
      bg="transparent"
      position="relative"
      mt="2rem"
      p={2}
      width="full"
      textAlign="center"
      overflow="visible" // Prevent extra scrolling
      flexDirection="column"
      justifyContent="center" // Centers the content
      alignItems="center"
    >
      <VStack position="relative" width="100%" justifyContent="flex-start">
        <Heading as="h2" size="3xl" color="black" fontWeight="bold">
          Szuper!
        </Heading>

        <Text fontSize="xl" fontWeight="bold" mt="2">
          Vége a gyakorlásnak.
        </Text>
        <Image
          src="/mimo-frontal.png"
          height={['260px', '300px', '400px']}
          filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
          mt="6"
          alt="Main Character"
        ></Image>
        <PurpleButton onClick={handleClosePracticeFeedback} w="200px" mt="2rem">
          Indulhat a kaland!
        </PurpleButton>
      </VStack>
    </Box>
  );
};

export default PracticeFeedback;
