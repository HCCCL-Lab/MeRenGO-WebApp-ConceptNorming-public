import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { FaTrashAlt, FaMicrophone, FaStop } from 'react-icons/fa';
import ConfirmPopup from '@/components/ConfirmPopup';
import { soundManager } from '@/lib/sounds'; // 🔁 ADD this at the top


type Recording = {
  id: number;
  url: string;
  blob?: Blob;
};

type Props = {
  recordingStatus: string;
  getMicrophonePermission: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  recordings: Recording[];
  deleteRecording: (id: number) => void;
  maxRecordings: number;
  timer: number;
};

const RecordingControls: React.FC<Props> = ({
  recordingStatus,
  startRecording,
  stopRecording,
  recordings = [],
  deleteRecording,
  maxRecordings,
  timer,
}) => {
  const [deletePopupVisible, setDeletePopupVisible] = useState<Record<number, boolean>>({});
  const [currentRecordingIndex, setCurrentRecordingIndex] = useState(0);
  const [canRecordMore, setCanRecordMore] = useState<boolean>(
    recordings.length < maxRecordings
  );
  const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
  const [tempDisabled, setTempDisabled] = useState<boolean>(false);

  useEffect(() => {
    setCanRecordMore(recordings.length < maxRecordings);
  }, [recordings, maxRecordings]);

  const handleStartRecording = () => {
    soundManager.stopAll();
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    setTempDisabled(true);
    setTimeout(() => setTempDisabled(false), 1000);
  };

  const handleDeleteRecording = (recording: Recording) => {
    deleteRecording(recording.id);
    setDeletePopupVisible(prev => ({ ...prev, [recording.id]: false }));
  };

  const handleShowDeletePopup = (recordingId: number) => {
    setDeletePopupVisible(prev => ({ ...prev, [recordingId]: true }));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  };

  return (
    <VStack
      align="center"
      height="fit-content"
      width={['100%']}
      bg="transparent"
      rounded="md"
      position="relative"
      mt="1.5rem"
      mb="2"
      overflow="hidden"
      id="recording-controls"
    >
      <Box>
        {recordingStatus === 'inactive' ? (
          <Button
            bgColor="brand.700"
            color="white"
            onClick={canRecordMore ? handleStartRecording : undefined}
            disabled={!canRecordMore || tempDisabled}
            width="140px"
            height="140px"
            borderRadius="50%"
            border="1px solid"
            padding={0}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            fontSize="md"
          >
            <Icon as={FaMicrophone} boxSize="3rem" />
            Felvétel
          </Button>
        ) : (
          <Button
            bgColor="red.600"
            color="white"
            border="1px solid"
            onClick={handleStopRecording}
            width="140px"
            height="140px"
            borderRadius="50%"
            padding={0}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            animation="pulse"
            animationDuration="800ms"
            fontSize="md"
            fontWeight="bold"
            mt="2"
          >
            <Icon as={FaStop} boxSize="3rem" color="white"/>
            Megállítás
          </Button>
        )}
        <Text fontSize="xl" fontWeight="semibold" mt="2" textAlign="center">
          {formatTime(timer)}
        </Text>
      </Box>
      {recordings.length >= maxRecordings ? (
        <VStack
          minW="300px"
          width={['80vw', '60vw', '50vw']}
          maxW="500px"
        >
          {recordings.map((recording, index) => (
            <React.Fragment key={recording.id || `recording-${index}`}>
              <HStack
                bg="brand.100"
                shadow="sm"
                rounded="md"
                p={1}
                w="100%"
                height="35px"
                justify="space-between"
              >
                <style>
                  {`
            audio::-webkit-media-controls-current-time-display,
            audio::-webkit-media-controls-time-remaining-display {
              font-size: 12px;
              background-color: brand.100;
            }
            audio::-webkit-media-controls-panel {
              background-color: #B7A8C8;
            }
            @media (max-width: 768px) {
              audio::-webkit-media-controls-time-remaining-display {
                display: none !important;
                background-color: brand.100;
              }
            }
            audio::-webkit-media-controls-timeline {
              margin-left: -2px;
              background-color: brand.100;
            }
            audio::-webkit-media-controls-play-button {
              margin-left: -8px;
              background-color: brand.100;
            }
            audio::-webkit-media-controls-mute-button {
              margin-left: 0px;
              background-color: brand.100;
            }
          `}
                </style>
                <audio
                  src={recording.url}
                  controls
                  style={{
                    width: '100%',
                    height: '20px',
                    background: 'transparent',
                  }}
                />
                <IconButton
                  aria-label="Delete recording"
                  color="red"
                  bgColor="brand.100"
                  size="xs"
                  onClick={() => handleShowDeletePopup(recording.id)}
                >
                  <FaTrashAlt />
                </IconButton>
              </HStack>
              <ConfirmPopup
                show={deletePopupVisible[recording.id] || false} 
                close={() => setDeletePopupVisible(prev => ({ ...prev, [recording.id]: false }))}
                action={() => handleDeleteRecording(recording)}
                actionText="Törlés"
                backText="Mégse"
                popupTitle="Biztosan törli a felvételt?"
              />
            </React.Fragment >
          ))}
        </VStack>
      ) : (
        <VStack
          minW="300px"
          width={['80vw', '60vw', '50vw']}
          maxW="500px"
        >
          {recordings.map((recording, index) => (
            <React.Fragment   key={recording.id || `recording-${index}`}>
              <HStack
                bg="brand.100"
                shadow="sm"
                rounded="md"
                p={1}
                w="100%"
                height="35px"
                justify="space-between"
              >
                <style>
                  {`
            audio::-webkit-media-controls-current-time-display,
            audio::-webkit-media-controls-time-remaining-display {
              font-size: 12px;
              background-color: brand.100;
            }
            audio::-webkit-media-controls-panel {
              background-color: #B7A8C8;
            }
            @media (max-width: 768px) {
              audio::-webkit-media-controls-time-remaining-display {
                display: none !important;
                background-color: brand.100;
              }
            }
            audio::-webkit-media-controls-timeline {
              margin-left: -2px;
              background-color: brand.100;
            }
            audio::-webkit-media-controls-play-button {
              margin-left: -8px;
              background-color: brand.100;
            }
            audio::-webkit-media-controls-mute-button {
              margin-left: 0px;
              background-color: brand.100;
            }
          `}
                </style>
                <audio
                  src={recording.url}
                  controls
                  style={{
                    width: '100%',
                    height: '20px',
                    background: 'transparent',
                  }}
                />
                <IconButton
                  aria-label="Delete recording"
                  color="red"
                  bgColor="brand.100"
                  size="xs"
                  onClick={() => handleShowDeletePopup(recording.id)}
                >
                  <FaTrashAlt />
                </IconButton>
              </HStack>
              <ConfirmPopup
                show={deletePopupVisible[recording.id] || false} 
                close={() => setDeletePopupVisible(prev => ({ ...prev, [recording.id]: false }))}
                action={() => handleDeleteRecording(recording)}
                actionText="Törlés"
                backText="Mégse"
                popupTitle="Biztosan törli a felvételt?"
              />
            </React.Fragment >
          ))}
        </VStack>
      )}
    </VStack>
  );
};

export default RecordingControls;
