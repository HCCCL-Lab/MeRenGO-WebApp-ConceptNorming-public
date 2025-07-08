import { Box, BoxProps, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type StatusMessageProps = Omit<BoxProps, 'css'> & {
  show: boolean;
  children: ReactNode;
  top: string;
};

const StatusMessage = ({
  show,
  children,
  top,
  ...props
}: StatusMessageProps): JSX.Element => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0 }}
        >
          <Box
            backgroundColor="brand.50"
            shadow="5px 5px 15px 1px rgba(70, 70, 70, 0.4)"
            rounded="md"
            zIndex={1001}
            w="300px"
            maxW="fit-content"
            h="fit-content"
            gap={6}
            m="auto"
            position="fixed"
            top={top}
            left="50%"
            transform="translateX(-50%)"
            display="flex"
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            p="4"
            mt="60"
            {...props}
          >
            <Text color="black" fontWeight="semibold" fontSize="lg">
              {children}
            </Text>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusMessage;
