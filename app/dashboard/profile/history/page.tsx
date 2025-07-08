'use client';

import {
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  VStack,
  HStack,
  Separator,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaAngleRight } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import useHistory from '@/hooks/useHistory';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import AnsweredConcepts from './components/AnsweredConcepts';
import GhostButton from '@/components/buttons/GhostButton';

const HistoryPage = () => {
  const { answeredConcepts } = useHistory();
  const { isCheckingAuth, authLoading } = useAuthCheck();

  interface Concept {
    concept_id: string;
    concept_name: string;
    answer_timestamp: number;
    user_answer: string;
    answer_time: string;
    visible: boolean;
  }

  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [sortBy, setSortBy] = useState<'abc' | 'date'>('date');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timeout);
  }, []);

  const toggleSort = () => {
    setSortBy((prevSort) => (prevSort === 'abc' ? 'date' : 'abc'));
  };

  // Sorting logic
  const sortedConcepts = [...answeredConcepts].sort((a, b) => {
    if (sortBy === 'abc') return a.concept_name.localeCompare(b.concept_name);
    return b.answer_timestamp - a.answer_timestamp;
  });

  const displayedConcepts = sortedConcepts.filter((concept) => {
    // strip out any “//audio response//” marker and split-on semicolons 
    const processed = concept.user_answer 
      .replace('//audio response//', '') 
      .split(';') 
      .map((t) => t.trim()) 
      .filter((t) => t !== ''); 
    const hasAudio = concept.user_answer.includes('//audio response//'); 
    return processed.length > 0 || hasAudio;   
  });

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    // Prevent body scrolling when concept details are open
    if (isMobile && selectedConcept) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, selectedConcept]);

  if (!showContent || authLoading || isCheckingAuth || !sortedConcepts) {
    return (
      <Flex minH="100vh" minW="100vw" align="center" justify="center">
        <Spinner color="black" size="xl" />
      </Flex>
    );
  }

  return (
    <Flex
      w="80vw"
      margin="auto"
      px="8px"
      overflow="hidden"
    >
      {/* ✅ White Box - Fully Contained in Viewport */}
      <Box
        w="100%"
        maxW="85dvw"
        maxH="55dvh"
        bg="white"
        borderRadius="md"
        shadow="md"
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        overflow="hidden"
        zIndex="20"
        position="relative"
      >
        {/* ✅ Mobile: Show List OR Concept Details */}
        {isMobile ? (
          selectedConcept ? (
            // ✅ Mobile: Concept Details (Scrollable Inside White Box)
            <Box w="100%" h="100%" display="flex" flexDir="column">
              {/* 🔙 Back Button (Top Left, Does NOT Move Sticker) */}
              <Button
                aria-label="Back to list"
                onClick={() => setSelectedConcept(null)}
                position="absolute"
                top="12px"
                left="12px"
                zIndex="50"
                variant="ghost"
                size="lg"
              >
                <IoArrowBack size={24} />
              </Button>

              {/* 🏷️ Concept Details (Should Scroll Inside White Box) */}
              <Box flex="1" overflowY="auto" pt="50px" px={4}>
                <AnsweredConcepts key={selectedConcept.concept_id} concept={selectedConcept} />
              </Box>
            </Box>
          ) : (
            // ✅ Mobile: Show List of Concepts (Full Box)
            <Box
              w="100%"
              h="100%"
              display="flex"
              flexDirection="column"
              overflowY="auto"
              p={4}
            >
              <HStack justifyContent="space-between" mb={2}>
                <Text fontWeight="bold">Fogalmak</Text>
                <GhostButton onClick={toggleSort} variant="ghost" fontWeight="normal">
                  <Text>Rendezés: {sortBy === 'date' ? 'Dátum' : 'ABC'}</Text>
                </GhostButton>
              </HStack>
              <Separator mb={2} />

              <VStack align="stretch" gap={1} flex="1">
                {displayedConcepts.map((concept) => (
                  <Button
                    key={concept.concept_id}
                    variant="ghost"
                    justifyContent="space-between"
                    colorScheme="gray"
                    onClick={() => setSelectedConcept(concept)}
                    w="full"
                    py={3}
                  >
                    <Text textTransform="uppercase" fontWeight="medium">
                      {concept.concept_name}
                    </Text>
                    <Flex alignItems="center">
                      <Text fontSize="sm" color="gray.500">
                        {new Date(concept.answer_timestamp).toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </Text>
                      <FaAngleRight color="#696969" style={{ marginLeft: 8 }} />
                    </Flex>
                  </Button>
                ))}
              </VStack>
            </Box>
          )
        ) : (
          // ✅ Desktop: Show Both (List + Details Side by Side)
          <>
            {/* Left: Scrollable Concept List */}
            <Box
              w="40%"
              p={4}
              borderRight="1px solid"
              borderColor="gray.200"
              display="flex"
              flexDirection="column"
              maxH="100%"
              overflowY="auto"
            >
              <HStack justifyContent="space-between" mb={2}>
                <Text fontWeight="bold">Fogalmak</Text>
                <GhostButton onClick={toggleSort} variant="ghost" fontWeight="normal">
                  <Text>Rendezés: {sortBy === 'date' ? 'Dátum' : 'ABC'}</Text>
                </GhostButton>
              </HStack>
              <Separator mb={2} />

              <VStack align="stretch" gap={1} flex="1">
                {displayedConcepts.map((concept) => (
                  <Button
                    key={concept.concept_id}
                    variant="ghost"
                    justifyContent="space-between"
                    colorScheme="gray"
                    onClick={() => setSelectedConcept(concept)}
                    w="full"
                    py={3}
                  >
                    <Text textTransform="uppercase" fontWeight="medium">
                      {concept.concept_name}
                    </Text>
                    <Flex alignItems="center">
                      <Text fontSize="sm" color="gray.500">
                        {new Date(concept.answer_timestamp).toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </Text>
                      <FaAngleRight color="#696969" style={{ marginLeft: 8 }} />
                    </Flex>
                  </Button>
                ))}
              </VStack>
            </Box>

            {/* Right: Concept Details (Fixed, No Scroll) */}
            <Box w="60%" p={6} display="flex" flexDir="column" flex="1" maxH="100%" overflowY="auto">
              {selectedConcept && <AnsweredConcepts key={selectedConcept.concept_id} concept={selectedConcept} />}
            </Box>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default HistoryPage;
