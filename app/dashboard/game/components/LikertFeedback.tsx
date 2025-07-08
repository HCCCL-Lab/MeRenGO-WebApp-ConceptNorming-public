import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { User } from 'firebase/auth';
import PurpleButton from '@/components/buttons/PurpleButton';

interface LikertFeedbackProps {
  show: boolean;
  handleLikertClose: (value: number | null) => void;
  user: User;
}

const LikertFeedback: React.FC<LikertFeedbackProps> = ({
  show,
  handleLikertClose,
  user,
}) => {
  const [likertValue, setLikertValue] = useState<number | null>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!show) return null;

  const handleCircleClick = (value: number) => {
    setLikertValue(value);
  };

  const stepTexts = {
    1: 'Egyáltalán nem önálló',
    4: 'Közepesen (adtam valamennyi segítséget)',
    7: 'Teljes mértékben önálló',
  };

  return (
    <Flex
      maxW="74dvw"
      rounded="lg"
      left="50%"
      flex="1"
      overflowY="auto"
      direction="column"
      alignItems="center"
      justifyContent="center"
      mx="auto"
      backdropFilter="blur(10px)"
      backgroundColor="rgb(54 52 87 / 15%)"
      pb="2rem"
      mt="3rem"
    >
      <Box
        bg="transparent"
        px="8"
        rounded="lg"
        width="full"
        textAlign="center"
        overflow="hidden"
      >
        <VStack position="relative" maxW="450px" m="auto">
          <Text mb="-8" mt="8" fontStyle="italic" fontWeight="semibold">
            --- Felnőttnek Szóló Kérdés ---
          </Text>
          <Text fontSize={['xl', '2xl']} fontWeight="bold" mb={4} mt={6}>
            Mennyire tartja önállónak a gyermek válaszait, az utóbbi pár
            fogalomra?
          </Text>
          <Text fontSize="s" mb={8} color="gray.600" fontStyle="italic">
            Válasszon az alábbi 1-től 7-ig terjedő skálán!
          </Text>

          {/* 👉 Mobile Dropdown */}
          {isMobile ? (
            <Box w="full" mb={8}>
              <Box
                as="label"
                display="block"
                fontWeight="semibold"
                fontSize="md"
                mb="2"
                textAlign="left"
              >
                Válasszon értéket
              </Box>
              <Box w="full" mb={8}>
                <Text fontWeight="semibold" mb="2">
                  Válasszon értéket
                </Text>
                <select
                  value={likertValue ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setLikertValue(Number(e.target.value))
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #CBD5E0',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  <option value="" disabled>
                    Válasszon...
                  </option>
                  <option value={7}>7 – Teljes mértékben önálló</option>
                  <option value={6}>6</option>
                  <option value={5}>5</option>
                  <option value={4}>4 – Közepesen (adtam valamennyi segítséget)</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1 – Egyáltalán nem önálló</option>
                </select>
              </Box>
            </Box>
          ) : (
            <>
              {/* 👉 Desktop Circles */}
              <Box display="flex" justifyContent="space-between" mb={8} mx={[0, 6, 10]}>
                {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                  <Button
                    key={value}
                    onClick={() => handleCircleClick(value)}
                    bgColor={likertValue === value ? 'brand.700' : 'white'}
                    color={likertValue === value ? 'white' : 'gray.400'}
                    fontWeight="bold"
                    variant="ghost"
                    rounded="full"
                    mx="1"
                    width={['40px', '50px', '60px']}
                    height={['40px', '50px', '60px']}
                    fontSize={['md', 'md', 'lg']}
                    border={likertValue === value ? '2px solid' : '1px solid'}
                    borderColor={likertValue === value ? 'gray.600' : 'gray.400'}
                    _hover={{
                      transform: 'scale(1.1)',
                      backgroundColor: likertValue !== value ? 'gray.200' : 'brand.600',
                    }}
                    _active={{
                      transform: 'scale(1.2)',
                    }}
                    transform={likertValue === value ? 'scale(1.2)' : 'scale(1)'}
                  >
                    {value}
                  </Button>
                ))}
              </Box>

              {/* Text Labels for 1, 4, 7 */}
              <Box display="flex" justifyContent="center" w="full" position="relative">
                <Text
                  fontSize={['sm', 'md', 'lg']}
                  fontWeight="semibold"
                  position="absolute"
                  width={['30%', '22%', '30%']}
                  left={['11%', '10%', '10%']}
                  transform="translateX(-50%)"
                >
                  {stepTexts[1]}
                </Text>
                <Text
                  fontSize={['sm', 'md', 'lg']}
                  fontWeight="semibold"
                  position="absolute"
                  width={['30%', '22%', '30%']}
                  left="50%"
                  transform="translateX(-50%)"
                >
                  Közepesen{' '}
                  <Text fontWeight="normal" fontStyle="italic">
                    (adtam valamennyi segítséget)
                  </Text>
                </Text>
                <Text
                  fontSize={['sm', 'md', 'lg']}
                  fontWeight="semibold"
                  position="absolute"
                  width={['30%', '22%', '30%']}
                  right={['11%', '10%', '10%']}
                  transform="translateX(50%)"
                >
                  {stepTexts[7]}
                </Text>
              </Box>
            </>
          )}

          {/* Submit Button */}
          <PurpleButton
            position="relative"
            onClick={() => handleLikertClose(likertValue)}
            width="full"
            mt={'120px'}
            fontSize="xl"
            disabled={likertValue === null}
          >
            Tovább
          </PurpleButton>
        </VStack>
      </Box>
    </Flex>
  );
};

export default LikertFeedback;
