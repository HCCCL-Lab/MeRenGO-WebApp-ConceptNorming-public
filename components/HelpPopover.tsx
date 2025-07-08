import { Box, BoxProps, Image, Text, Flex } from '@chakra-ui/react';
import PurpleButton from './buttons/PurpleButton';
import { motion, AnimatePresence } from 'framer-motion';

const NAVBAR_HEIGHT = '64px';

type HelpPopoverProps = Omit<BoxProps, 'css'> & {
  show: boolean;
  close: () => void;
  mode: 'voice' | 'text';
};

const HelpPopover = ({ show, close, mode, ...props }: HelpPopoverProps): JSX.Element => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0 }}
      >
        <Box
          position="fixed"
          top={NAVBAR_HEIGHT}
          left="0"
          width="100vw"
          height={`calc(100vh - ${NAVBAR_HEIGHT})`}
          backgroundColor="rgba(0, 0, 0, 0.2)"
          backdropFilter="blur(6px)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex="1000"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Box
              backgroundColor="brand.50"
              shadow="5px 5px 15px rgba(70, 70, 70, 0.4)"
              rounded="md"
              w={['90vw', '80vw']}
              maxH="calc(100vh - 2rem - 64px)"
              overflowY="auto"
              display="flex"
              flexDir="column"
              alignItems="center"
              p="4"
              {...props}
              onClick={(e) => e.stopPropagation()}
            >
              <Text fontWeight="bold" fontSize={['md', 'lg']} mb="4">
                Segítség
              </Text>

              <Image
                src={
                  mode === 'text'
                    ? '/mobile_help_keyboard.png'
                    : '/mobile_help_voice.png'
                }
                alt="Segítség kép"
                maxW={['90%', '85%', '70%']}
                objectFit="contain"
                mb="4"
              />

              <PurpleButton onClick={close} mb="4">
                Vissza
              </PurpleButton>
            </Box>
          </motion.div>
        </Box>
      </motion.div>
    )}
  </AnimatePresence>
);

export default HelpPopover;
