import React from 'react';
import { Box, Heading, Image, Text, VStack } from '@chakra-ui/react';
import PurpleButton from '@/components/buttons/PurpleButton';

interface PopupProps {
  show: boolean;
  handleClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ show, handleClose }) => {
  if (!show) return null;

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex="2001"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="blackAlpha.200"
      backdropFilter="blur(5px)"
    >
      <Box
        bg="white"
        p={6}
        rounded="lg"
        maxW="lg"
        w={['9/12', '9/12', 'full']}
        h={['60vh', '50vh', '50vh']}
        textAlign="center"
        shadow="lg"
        mt="-10"
      >
        <VStack position="relative">
          <Heading as="h2" size="3xl" color="black" fontWeight="bold">
            Szuper!
          </Heading>

          <Text fontSize="xl" fontWeight="bold">
            Viszont lenne pár kérdésem.
          </Text>
          <Image
            src="/mimo-frontal.png"
            height="30vh"
            filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
            alt="Main Character"
          ></Image>
          <PurpleButton
            onClick={handleClose}
            w="200px"
            position="absolute"
            bottom="-11"
          >
            Örömmel válaszolok!
          </PurpleButton>
        </VStack>
      </Box>
    </Box>
  );
};

export default Popup;
