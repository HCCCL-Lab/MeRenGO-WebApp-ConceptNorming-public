import React from 'react';
import { Box, Button, Heading, Image, Text, VStack } from '@chakra-ui/react';
import PurpleButton from '@/components/buttons/PurpleButton';

interface GeneralFeedbackProps {
  show: boolean;
  handleClose: () => void;
  count: number;
}

const GeneralFeedback: React.FC<GeneralFeedbackProps> = ({
  show,
  handleClose,
  count,
}) => {
  if (!show) return null;

  const ordinals: { [key: number]: string } = {
    1: 'első',
    2: 'második',
    3: 'harmadik',
    4: 'negyedik',
    5: 'ötödik',
    6: 'hatodik',
    7: 'hetedik',
    8: 'nyolcadik',
    9: 'kilencedik',
    10: 'tizedik',
  };

  return (
    <Box 
      bg="transparent" 
      position="relative"
      width="full" 
      textAlign="center" 
      overflow="visible" // Prevent extra scrolling
      flexDirection="column"
      justifyContent="center" // Centers the content
      alignItems="center"
      pb="2rem"
    >
      <VStack 
        position="relative"
        width="100%"
        justifyContent="flex-start"
      >
        <Heading as="h2" size="3xl" color="black" fontWeight="bold">
          Hurrá!
        </Heading>

        <Text fontSize="xl" fontWeight="bold" mt="2">
          Sikeresen megtanítottad Mimónak a mai {ordinals[count]} fogalmat!
        </Text>
        <Image
          src="/mimo-frontal.png"
          height={['260px', '300px', '400px']}
          filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
          mt="6"
          alt="Main Character"
        ></Image>
        <PurpleButton
          onClick={handleClose}
          w="200px"
          mt="2rem"
        >
          Jöhet a következő!
        </PurpleButton>
      </VStack>
    </Box>
  );
};

export default GeneralFeedback;
