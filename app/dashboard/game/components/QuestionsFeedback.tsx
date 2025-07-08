import React from 'react';
import { Box, Button, Heading, Image, Text, VStack } from '@chakra-ui/react';
import PurpleButton from '@/components/buttons/PurpleButton';

interface QuestionsFeedbackProps {
  show: boolean;
  handleClose: () => void;
}

const QuestionsFeedback: React.FC<QuestionsFeedbackProps> = ({
  show,
  handleClose,
}) => {
  if (!show) return null;

  return (
    <Box
      bg="transparent"
      position="relative"
      p={2}
      width="full"
      textAlign="center"
      overflow="visible" // Prevent extra scrolling
      flexDirection="column"
      justifyContent="center" // Centers the content
      alignItems="center"
    >
      <Box
        id="feedback"
        position="absolute"
        top="0"
        w="90%"
        maxW={'800px'}
        h="100%"
        left="50%"
        transform="translateX(-50%)"
      ></Box>
      <VStack position="relative" width="100%" justifyContent="flex-start">
        <Heading as="h2" size="3xl" color="black" fontWeight="bold">
          Szuper!
        </Heading>

        <Text fontSize="xl" fontWeight="bold" mt="2">
          Mint mindig, lenne pár kérdésem.
        </Text>
        <Image
          src="/mimo-frontal.png"
          height={['260px', '300px', '400px']}
          filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
          mt="6"
          alt="Main Character"
        ></Image>
        <PurpleButton onClick={handleClose} w="200px" mt="2rem">
          Örömmel válaszolok!
        </PurpleButton>
      </VStack>
    </Box>
  );
};

export default QuestionsFeedback;
