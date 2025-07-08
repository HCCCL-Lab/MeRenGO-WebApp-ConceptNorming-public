import { Box, BoxProps, Flex, Text } from '@chakra-ui/react';
import WhiteButton from './buttons/WhiteButton';
import PurpleButton from './buttons/PurpleButton';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type ConfirmPopupProps = Omit<BoxProps, 'css'> & {
  show: boolean;
  close: () => void;
  action: Function;
  actionText: string;
  backText: string;
  popupTitle: string;
};

const ConfirmPopup = ({
  close,
  action,
  show,
  actionText,
  backText,
  popupTitle,
  ...props
}: ConfirmPopupProps): JSX.Element => {
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
            overflowX: 'hidden',
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
              w="fit-content"
              h="fit-content"
              gap={6}
              m="auto"
              display="flex"
              flexDir="column"
              justifyContent="center"
              alignItems="center"
              p="4"
              mt="-60"
              {...props}
            >
              <Text color="black" fontWeight="bold" fontSize="lg">
                {popupTitle}
              </Text>
              <Flex gap={6}>
                <WhiteButton onClick={close}>{backText}</WhiteButton>
                <PurpleButton onClick={() => action()}>
                  {actionText}
                </PurpleButton>
              </Flex>
            </Box>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmPopup;
