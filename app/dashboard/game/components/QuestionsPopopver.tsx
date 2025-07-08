import { Box, BoxProps, Flex, Image, useBreakpointValue } from '@chakra-ui/react';
import PurpleButton from '../../../../components/buttons/PurpleButton';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type QuestionsPopoverProps = Omit<BoxProps, 'css'> & {
  show: boolean;
  close: () => void;
  closeText: string;
};

const QuestionsPopover = ({ close, show, closeText, ...props }: QuestionsPopoverProps): JSX.Element => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <Box
              backgroundColor="brand.50"
              shadow="5px 5px 15px 1px rgba(70, 70, 70, 0.4)"
              zIndex="1001"
              rounded="md"
              minW='300px'
              maxW="90vw"
              display="flex"
              flexDir="column"
              justifyContent="center"
              alignItems="center"
              p="4"
              {...props}
            >
              {/* Responsive icon replacing questions text */}
              <Image
                src="/mimo-questions.png"
                alt="Kérdések" 
                width={[
                  '80vw',   // larger on mobile
                  '50vw',   // smaller on tablet up
                ]}
                maxW="600px"
                height="auto"
                mb="4"
              />

              <Flex gap={6}>
                <PurpleButton onClick={close}>{closeText}</PurpleButton>
              </Flex>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default QuestionsPopover;
