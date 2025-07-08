import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import useConcepts from '../../../../hooks/useConcepts';
import RecordingControls from './RecordingControls';
import { FaKeyboard, FaMicrophone, FaPlus } from 'react-icons/fa';
import { IoSunny } from 'react-icons/io5';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  Spinner,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import GhostButton from '@/components/buttons/GhostButton';
import PurpleButton from '@/components/buttons/PurpleButton';
import WhiteButton from '@/components/buttons/WhiteButton';
import ConfirmPopup from '@/components/ConfirmPopup';
import { FiArrowLeft } from 'react-icons/fi';
import ExperimenterIntro from '@/app/experimenter/game/components/Intro';
import useExperimenterGame from '@/hooks/useExperimenterGame';
import { soundManager } from '@/lib/sounds';
import QuestionsPopover from './QuestionsPopopver';

interface PracticeProps {
  show: boolean;
  setDone: () => void;
}

const Practice: React.FC<PracticeProps> = ({ show, setDone }) => {
  // State, variable and hook initializations
  const isMobile = useBreakpointValue({ base: true, md: false });
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [finalConceptName, setFinalConceptName] = useState<string | null>(null);
  const [saveButton, setSaveButton] = useState<Boolean>(false);
  const [maxRecs, setMaxRecs] = useState<number>(2);
  const [showLikertFeedback, setShowLikertFeedback] = useState<boolean>(false);
  const [showGeneralFeedback, setShowGeneralFeedback] =
    useState<boolean>(false);
  const [showConfirmSkip, setShowConfirmSkip] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [progressHeight, setProgressHeight] = useState<number>(0);
  const [showIntro, setShowIntro] = useState(false);
  const [showPracticeFeedback, setShowPracticeFeedback] = useState(false);
  const [pseudoUID, setPseudoUID] = useState<string>('');

  // Fetch pseudoUID from session storage
  useEffect(() => {
    const storedUID = sessionStorage.getItem('pseudoUID');
    if (storedUID) {
      setPseudoUID(storedUID);
    } else {
      router.push('/experimenter');
    }
  }, [router]);

  const {
    unansweredConcepts,
    currentConcept,
    isLoading,
    recordingStatus,
    recordings,
    getMicrophonePermission,
    stopRecording,
    user,
    renderReady,
    dailyAnsweredCount,
    inputFieldsCount,
    handleInputChangeForDynamicFields,
    MAX_FIELDS,
    handleAddField,
    canAddField,
    handleKeyDown,
    handleDeleteRecording,
    handleStartRecording,
    handleSaveAndReset,
    inputFields,
    subcatRepeat,
    sessionAnswered,
    timer,
    handleSave,
    practice,
    setPracticeDone,
    handleReset,
  } = useExperimenterGame(pseudoUID);

  const [progressbarCounter, setProgressbarCounter] =
    useState(dailyAnsweredCount);

  const [showCurrentProgress, setShowCurrentProgress] = useState(true);

  const questionsRefText = useRef<HTMLDivElement>(null);
  const questionsRefVoice = useRef<HTMLDivElement>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const scrollOffsetBeforeQuestionsRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      setProgressHeight(rect.height);
    }
  }, [renderReady, finalConceptName, showCurrentProgress]); // update when content changes

  // Effect to reset state when currentConcept changes
  useEffect(() => {
    setLoaded(false);
    if (currentConcept && renderReady) {
      setSaveButton(false);
      setMaxRecs(2);
      setFinalConceptName('');
      const timer = setTimeout(() => {
        setFinalConceptName(currentConcept.concept_name);
        setLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentConcept, renderReady]);

  useEffect(() => {
    setProgressbarCounter(dailyAnsweredCount);
  }, [dailyAnsweredCount]);

  useEffect(() => {
    if (practice !== 'done') {
      setShowIntro(true);
    }
  }, [practice]);

  const handleCloseIntro = () => {
    setShowIntro(false);
  };

  function scrollToElementWithOffset(
    container: HTMLDivElement,
    target: HTMLElement,
    offset: number = 64 // adjust to match navbar height
  ) {
    const targetPosition = target.offsetTop - offset;
    container.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  }

  // Dummy save function to handle save button click
  const dummySave = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (recordingStatus === 'recording') {
      stopRecording();
    }

    soundManager.playGroup('kerdesek');

    if (inputFieldsCount < 10 && recordings.length < 4) {
      setSaveButton(true);
      if (scrollableContainerRef.current) {
        const container = scrollableContainerRef.current;
        const offset = 64; // or your exact navbar height in px

        if (mode === 'voice' && questionsRefVoice.current) {
          scrollToElementWithOffset(
            container,
            questionsRefVoice.current,
            offset
          );
        } else if (mode === 'text' && questionsRefText.current) {
          scrollToElementWithOffset(
            container,
            questionsRefText.current,
            offset
          );
        }
      }
      setMaxRecs(4);
    }
  };

  const handleShowConfirmSkip = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (recordingStatus === 'recording') {
      stopRecording();
    }
    setShowConfirmSkip(true);
  };

  useEffect(() => {
    if (mode === 'text') {
      document.getElementById(`input-field-${0}`)?.focus();
    }
  }, [mode]);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (scrollableContainerRef.current) {
        const measured = scrollableContainerRef.current.scrollHeight;
        console.log('Measured height:', measured);
        setContentHeight(measured);
      }
    };

    updateHeight();

    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [recordings.length, inputFields.length, renderReady]);

  console.log('contentHeight:', contentHeight);

  // Force re-render on 10 concepts
  useEffect(() => {
    if (dailyAnsweredCount === 10) {
      setMode('text'); // Reset mode to default
    }
  }, [dailyAnsweredCount]);

  const handleEndPractice = () => {
    handleReset();
    setDone();
  };

  if (practice !== 'female' && practice !== 'male' && practice !== 'neutral') {
    return null;
  }

  if (!show) return null;

  return (
    <>
      {showIntro ? (
        <ExperimenterIntro show={showIntro} handleClose={handleCloseIntro} pseudoUID={pseudoUID} />
      ) : (
        <Box
          flex="1"
          overflowX="hidden"
          height="100%"
          width="100%"
          px={[4, 8]}
          id="practice-content"
          position="relative"
          onClick={() => {
            if (showHelpOverlay) setShowHelpOverlay(false);
          }}
        >
          <QuestionsPopover
            show={showQuestions}
            close={() => setShowQuestions(false)}
            closeText="Bezárás"
          />
          <Flex
            zIndex={1000}
            alignItems="center"
            justifyContent="center"
            mt="5dvh"
            overflow="visible"
          >
            <Box height="20px" />
          </Flex>
          <Box
            id="progressbar-main"
            position="absolute"
            top="2rem"
            left="0"
            w="100%"
            zIndex="3"
            display="block"
            minHeight="6rem"
          >
            <Box id="true-progress" position="relative">
              {/* Close Button */}
              <Button
                onClick={() => router.push('/experimenter')}
                zIndex="1"
                color="black"
                background="transparent"
                fontSize="2xl"
                borderRadius="50%"
                height="10"
                width="10"
                display="flex"
                justifyContent="center"
                alignItems="center"
                aria-label="Close"
                _hover={{ bgColor: 'gray.200' }}
                marginLeft={{
                  base: '0',
                  sm: '4vw',
                  md: '10vw',
                  lg: '20vw',
                  xl: '25vw',
                }}
                marginTop={{
                  base: '30px',
                  sm: '30px',
                  md: '70px',
                  lg: '70px',
                  xl: '70px',
                }}
                position="absolute"
                _portrait={{ top: '1' }}
                left="0"
                _landscape={{ top: '1' }}
              >
                <FiArrowLeft size={32} />
              </Button>
              <ConfirmPopup
                show={showConfirmSkip}
                close={() => {
                  setShowConfirmSkip(false);
                }}
                action={() => {
                  if (saveButton) {
                    setShowConfirmSkip(false);
                    handleEndPractice();
                  } else {
                    setShowConfirmSkip(false);
                  }
                }}
                actionText="Átugrás"
                backText="Vissza"
                popupTitle="Biztosan átugrod ezt a fogalmat?"
              />
              <Box position="relative" left="50%" transform="translateX(-50%)">
                <Box bg="transparent" px="auto" w="1/2" marginX="auto">
                  {/* Progress Indicator */}
                  {renderReady && !isLoading && finalConceptName ? (
                    <Flex
                      align="center"
                      justify="center"
                      gap={2}
                      marginLeft="6"
                      mt="-2"
                    >
                      <Flex align="center" gap={1}>
                        {Array.from({ length: 10 }).map((_, index) => (
                          <Box
                            key={index}
                            h={['2', '2', '4']}
                            w="5vw"
                            borderRadius="8px"
                            border="1px solid"
                            borderColor={
                              progressbarCounter === 10
                                ? '#f2bf05'
                                : 'brand.500'
                            }
                            bg={
                              showCurrentProgress &&
                              progressbarCounter === index
                                ? '#b3b1de'
                                : progressbarCounter === 0
                                ? 'white'
                                : progressbarCounter === 10
                                ? '#f2bf05'
                                : index < progressbarCounter
                                ? 'brand.500'
                                : 'white'
                            }
                          />
                        ))}
                      </Flex>
                      <Text
                        fontSize="3vh"
                        display="flex"
                        alignItems="center"
                        gap={1}
                        id="sun-icon"
                      >
                        <IoSunny
                          color={
                            progressbarCounter === 0
                              ? '#4a4a4a'
                              : progressbarCounter === 10
                              ? '#f2bf05'
                              : '#65638f'
                          }
                        />
                        <span>
                          {progressbarCounter !== 10 ? (
                            <>
                              <Text
                                as="span"
                                color={
                                  progressbarCounter === 0
                                    ? '#4a4a4a'
                                    : 'brand.500'
                                }
                                fontWeight="semibold"
                              >
                                {progressbarCounter || '0'}
                              </Text>
                              <span>/10</span>
                            </>
                          ) : (
                            <Text
                              as="span"
                              color="#f2bf05"
                              fontWeight="semibold"
                            >
                              {progressbarCounter || '0'}/10
                            </Text>
                          )}
                        </span>
                      </Text>
                    </Flex>
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      gap={2}
                      marginLeft="6"
                      mt="-2"
                    >
                      <Flex align="center" gap={1}>
                        {Array.from({ length: 10 }).map((_, index) => (
                          <Box
                            key={index}
                            h={['2', '2', '4']}
                            w="5vw"
                            borderRadius="8px"
                            border="1px solid"
                            borderColor={
                              progressbarCounter === 10
                                ? '#f2bf05'
                                : 'brand.500'
                            }
                            bg={
                              progressbarCounter === 0
                                ? 'white'
                                : progressbarCounter === 10
                                ? '#f2bf05'
                                : index < progressbarCounter
                                ? 'brand.500'
                                : 'white'
                            }
                          />
                        ))}
                      </Flex>
                      <Text
                        fontSize="3vh"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <IoSunny
                          color={
                            progressbarCounter === 0
                              ? '#4a4a4a'
                              : progressbarCounter === 10
                              ? '#f2bf05'
                              : '#65638f'
                          }
                        />
                        <span>
                          {progressbarCounter !== 10 ? (
                            <>
                              <Text
                                as="span"
                                color={
                                  progressbarCounter === 0
                                    ? '#4a4a4a'
                                    : 'brand.500'
                                }
                                fontWeight="semibold"
                              >
                                {progressbarCounter || '0'}
                              </Text>
                              <span>/10</span>
                            </>
                          ) : (
                            <Text
                              as="span"
                              color="#f2bf05"
                              fontWeight="semibold"
                            >
                              {progressbarCounter || '0'}/10
                            </Text>
                          )}
                        </span>
                      </Text>
                    </Flex>
                  )}
                </Box>

                <>
                  {dailyAnsweredCount < 10 && currentConcept ? (
                    <>
                      {saveButton ? (
                        <Heading
                          as="h1"
                          size={['lg', 'xl', '2xl']}
                          mb={['0', '0', '1vh']}
                          textAlign="center"
                          fontWeight="bold"
                          marginX="auto"
                        >
                          Válaszolj a kérdéseimre!
                        </Heading>
                      ) : (
                        <Heading
                          as="h1"
                          size={['lg', 'xl', '2xl']}
                          mb={['0', '0', '1vh']}
                          textAlign="center"
                          fontWeight="bold"
                        >
                          Magyarázd el nekem, mi az, hogy…
                        </Heading>
                      )}
                      <Box textAlign="center">
                        <Box
                          id="concept"
                          w="80%"
                          maxW="400px"
                          minW="300px"
                          h="100px"
                          position="absolute"
                          left="50%"
                          transform="translateX(-50%) translateY(-40%)"
                        ></Box>
                        {renderReady && finalConceptName && loaded ? (
                          <Heading
                            as="h2"
                            size={['3xl', '3xl', '4xl']}
                            mb={['0', '0', '1vh']}
                            fontWeight="bold"
                            color="black"
                            textTransform="uppercase"
                          >
                            {practice === 'female'
                              ? 'KATICABOGÁR'
                              : practice === 'male'
                              ? 'ŰRHAJÓ'
                              : practice === 'neutral'
                              ? 'HOMOKOZÓ'
                              : null}
                          </Heading>
                        ) : (
                          <Heading
                            as="h2"
                            size={['3xl', '3xl', '4xl']}
                            mb={['0', '0', '1vh']}
                            fontWeight="bold"
                            color="black"
                            textTransform="uppercase"
                          >
                            <Spinner />
                          </Heading>
                        )}
                        {mode === 'text' && (
                          <Box mb="2" ref={questionsRefText}>
                            <Text
                              fontSize={['sm', 'md']}
                              color="orange.600"
                              fontWeight="semibold"
                              textAlign="center"
                              minHeight="2rem"
                              maxWidth="90vw"
                              px="4"
                              mx="auto"
                            >
                              Emlékezzen, csak a gyermek önálló, pontos
                              válaszait írja be!
                            </Text>

                            {/* 1) Always show the icon + button */}
                            <Flex justify="center" align="center" gap="8px">
                                <Image
                                  height="100px"
                                  src="/favicon.ico"
                                  filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.5))"
                                  alt="Mimó Icon"
                                />
                                <WhiteButton onClick={() => setShowQuestions(true)} rounded="full" fontSize="1.3rem">
                                  {isMobile ? (
                                    <>
                                      Mimó
                                      <br />
                                      kérdései
                                    </>
                                  ) : (
                                    'Mimó kérdései'
                                  )}
                                </WhiteButton>
                              </Flex>

                              {/* 2) Only show the full question list once saveButton is true */}
                              {saveButton && (
                                <Box mt="1rem" textAlign="left" mx="auto" maxW="400px">
                                  <Image
                                    src="/mimo-questions.png"
                                    alt="Kérdések részletek"
                                    boxSize={isMobile ? '6rem' : '8rem'}
                                    mx="auto"
                                  />
                                </Box>
                              )}
                          </Box>
                        )}
                      </Box>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              </Box>

              <Flex
                id="records"
                flexDir="column"
                zIndex={mode === 'text' ? '1' : '0'}
                maxH="50vh"
              >
                <>
                  {dailyAnsweredCount < 10 && currentConcept ? (
                    <Box
                      position="relative"
                      w="full"
                      textAlign="center"
                      display="flex"
                      flexDirection="column"
                      justifyContent="space-between"
                      maxW="full"
                      id="text-inputs"
                    >
                      {/* Input Fields or Recording Controls */}
                      {mode === 'text' ? (
                        <VStack
                          width={['300px', '400px', '500px', '500px']}
                          mx="auto"
                        >
                          <VStack
                            id="record-button"
                            gap={2}
                            width={['250px', '350px', '450px', '500px']}
                          >
                            {Array.from({
                              length: inputFieldsCount,
                            }).map((_, index) => (
                              <Input
                                _selection={{
                                  backgroundColor: 'brand.100',
                                }}
                                width={[
                                  '300px',
                                  '340px',
                                  '340px',
                                  '440px',
                                  '490px',
                                ]}
                                height={isMobile ? '8' : '10'}
                                mb="-1"
                                key={index}
                                id={`input-field-${index}`}
                                type="text"
                                shadow="1px 1px 3px 1px rgba(70, 70, 70, 0.2)"
                                placeholder={`${index + 1}. tulajdonság`}
                                _placeholder={{
                                  fontWeight: 'normal',
                                }}
                                fontSize="16px"
                                variant="outline"
                                borderColor="gray.300"
                                fontWeight="semibold"
                                bg="white"
                                value={inputFields[index]}
                                onChange={(e) =>
                                  handleInputChangeForDynamicFields(
                                    index,
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => handleKeyDown(e, index)}
                              />
                            ))}
                          </VStack>
                          {inputFieldsCount < MAX_FIELDS ? (
                            <PurpleButton
                              id="add-field-button"
                              onClick={handleAddField}
                              disabled={!canAddField}
                              mt="2"
                              width="300px"
                              mb="-10px"
                            >
                              <FaPlus /> Tulajdonság
                            </PurpleButton>
                          ) : (
                            <></>
                          )}
                        </VStack>
                      ) : (
                        <></>
                      )}
                    </Box>
                  ) : (
                    <></>
                  )}
                </>

                <>
                  {unansweredConcepts ? (
                    <Box
                      marginTop={{
                        base: '2',
                        sm: '2',
                        md: '2',
                        lg: '2',
                        xl: '2',
                      }}
                    >
                      <Box
                        position="relative"
                        w="full"
                        textAlign="center"
                        h="full"
                        display="flex"
                        flexDirection="column"
                        justifyContent="space-between"
                        maxW="full"
                      >
                        <>
                          {mode === 'text' ? (
                            <>
                              {dailyAnsweredCount < 10 ? (
                                <VStack>
                                  {currentConcept ? (
                                    <Box>
                                      <VStack mt={2}>
                                        {/* Heading */}
                                        <VStack
                                          width={[
                                            '440px',
                                            '540px',
                                            '540px',
                                            '540px',
                                          ]}
                                        >
                                          <Flex
                                            justify="center"
                                            gap={0}
                                            mt={[0, 0]}
                                          >
                                            {inputFieldsCount === MAX_FIELDS ||
                                            recordings.length === 4 ? (
                                              <PurpleButton
                                                onClick={handleEndPractice}
                                                width="300px"
                                                disabled={
                                                  recordings.length === 0 &&
                                                  !inputFields.some(
                                                    (item) => item.trim() !== ''
                                                  )
                                                }
                                              >
                                                Jöhet a következő!
                                              </PurpleButton>
                                            ) : recordings.length === 0 &&
                                              !inputFields.some(
                                                (item) => item.trim() !== ''
                                              ) ? (
                                              <WhiteButton
                                                onClick={handleEndPractice}
                                                width="300px"
                                                disabled
                                              >
                                                Jöhet a következő!
                                              </WhiteButton>
                                            ) : (
                                              <PurpleButton
                                                onClick={handleEndPractice}
                                                width="300px"
                                              >
                                                Jöhet a következő!
                                              </PurpleButton>
                                            )}
                                          </Flex>

                                          <WhiteButton
                                            id="unknown-word"
                                            onClick={handleShowConfirmSkip}
                                            width="300px"
                                          >
                                            Nem ismerem a fogalmat
                                          </WhiteButton>
                                          <Box height="2rem" />
                                        </VStack>
                                      </VStack>
                                    </Box>
                                  ) : (
                                    <></>
                                  )}
                                </VStack>
                              ) : (
                                <></>
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                        </>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Heading
                        as="h1"
                        size="lg"
                        mt="12vh"
                        bg="#f2bf05"
                        p={10}
                        rounded="lg"
                        w={{ base: '90%', md: '36%' }}
                        mx="auto"
                        mb="2"
                        shadow="5px 5px 8px 1px rgba(70, 70, 70, 0.2)"
                      >
                        Sikeresen megmagyaráztad az összes elérhető fogalmat!{' '}
                        <br />
                        Köszönjük, hogy játszottál!
                      </Heading>
                      {isMobile ? (
                        <Image
                          src="/favicon.ico"
                          filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                          height="160px"
                          width="160px"
                          mt="4"
                          mx="auto"
                          alt="Main Character"
                        />
                      ) : (
                        <></>
                      )}
                    </>
                  )}
                </>
              </Flex>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Practice;
