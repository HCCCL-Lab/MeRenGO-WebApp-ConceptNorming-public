import GhostButton from '@/components/buttons/GhostButton';
import StatusMessage from '@/components/StatusMessage';
import {
  Box,
  Text,
  VStack,
  Heading,
  Flex,
  Image,
  Portal,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { doc, setDoc } from 'firebase/firestore';
import { firestoredb } from '@/app/api/firebase';

type Props = {
  concept: Concept;
};

type Concept = {
  concept_id: string;
  concept_name: string;
  user_answer: string;
  answer_timestamp: number;
  answer_time: string;
};

const AnsweredConcepts: React.FC<Props> = ({ concept }) => {
  const { user } = useUser();
  const [showStatusMessage, setShowStatusMessage] = useState(false);

  const formattedDate = new Date(concept.answer_timestamp).toLocaleDateString(
    'hu-HU',
    {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }
  );

  const containsAudio = concept.user_answer.includes('//audio response//');
  const processedText = concept.user_answer
    .replace('//audio response//', '')
    .split(';')
    .map((text) => text.trim())
    .filter((text) => text !== '');

  const hasAnswer = processedText.length > 0 || containsAudio;

  const requestAudioFile = async () => {
    if (!user) return;
    const issueID = `CONCEPT_${user.uid}_${concept.concept_id}_${Date.now()}`;
    const now = new Date();
    try {
      await setDoc(doc(firestoredb, 'contact', issueID), {
        userID: user.uid,
        conceptID: concept.concept_id,
        date: now.toLocaleString(),
        message: `Audio file requested for concept ${concept.concept_id}`,
      });
    } catch (error) {
      console.error('Error logging audio request:', error);
    }
    setShowStatusMessage(true);
    setTimeout(() => setShowStatusMessage(false), 2000);
  };

  return (
    <>
      {/* Use Portal to ensure overlay is above all layout elements */}
      <Portal>
        <StatusMessage 
          show={showStatusMessage} 
          position="absolute"
          top="20%"
          left="50%"
          zIndex="toast" 
        >
          <Text textAlign="center">Kérését jeleztük a kutatócsoportnak!</Text>
        </StatusMessage>
      </Portal>
      <VStack align="stretch" gap={4} overflowY="visible" maxH="60vh">
        {/* Concept Name + Date */}
        {hasAnswer && (
          <Flex justifyContent="space-between">
            <Box
              bg={
                ['purple.300', 'blue.300', 'red.300', 'green.300', 'yellow.300'][
                  Math.floor(Math.random() * 5)
                ]
              }
              rounded="3xl"
              boxShadow="8px 8px 16px 5px rgba(0, 0, 0, 0.2)"
              p={4}
              h="220px"
              w="220px"
              mx="auto"
            >
              <Heading
                size="lg"
                textTransform="uppercase"
                textAlign="center"
                fontWeight="bold"
              >
                {concept.concept_name}
              </Heading>
              <Image
                src={`/stickers/${concept.concept_id}.png`}
                alt="Sticker"
                h="146px"
                w="146px"
                mx="auto"
                borderRadius="lg"
                filter="drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.5))"
              />
              <Text
                fontSize="md"
                color="gray.500"
                fontStyle="italic"
                textAlign="center"
              >
                {formattedDate}
              </Text>
            </Box>
          </Flex>
        )}

        {/* Answer Content */}
        <Text fontSize="md" mt="4">
          Válaszok:
        </Text>
        <Box p={4} bg="gray.100" borderRadius="md" overflowY="visible">
          {processedText.length > 0 ? (
            <>
              {processedText.map((line, index) => (
                <Text key={index} fontSize="xl" fontWeight="medium">
                  {line}
                </Text>
              ))}
              {containsAudio && (
                <Text fontSize="xl" fontWeight="medium">
                  / hangfelvétel /
                </Text>
              )}
            </>
          ) : (
            <>
              {containsAudio ? (
                <Text fontSize="xl" fontWeight="medium">
                  / hangfelvétel /
                </Text>
              ) : (
                <Text fontSize="xl" fontWeight="medium">
                  / nincs válasz /
                </Text>
              )}
            </>
          )}
        </Box>

        {/* Audio Response Button */}
        {containsAudio && (
          <Flex justifyContent="center" w="100%">
            <GhostButton onClick={requestAudioFile}>Lekérés</GhostButton>
          </Flex>
        )}
      </VStack>
    </>
  );
};

export default AnsweredConcepts;
