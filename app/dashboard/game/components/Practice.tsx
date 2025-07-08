import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import useConcepts from '../../../../hooks/useConcepts';
import RecordingControls from './RecordingControls';
import QuestionsFeedback from './QuestionsFeedback';
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
import { TbHelp } from 'react-icons/tb';
import OverlayHelp from './OverlayHelp';
import Intro from './Intro';
import PracticeFeedback from './PracticeFeedback';
import PracticeOverlay from './PracticeOverlay';
import { soundManager } from '@/lib/sounds';
import { soundConfig } from '@/lib/sounds/soundConfig';
import { once } from 'events';
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
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
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
  const [overlayStep, setOverlayStep] = useState(0);
  const startedRef = useRef(false);
  const nextQIdx = 7;
  const questionIdx = 6;
  const feedbackFired = useRef(false);

  const {
    unansweredConcepts,
    currentConcept,
    isLoading,
    dataLoading,
    recordingStatus,
    recordings,
    getMicrophonePermission,
    stopRecording,
    user,
    renderReady,
    setShowQuestionsFeedback,
    showQuestionsFeedback,
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
  } = useConcepts();

  // Progressbar variables
  const [progressbarCounter, setProgressbarCounter] =
    useState(dailyAnsweredCount);

  const [showCurrentProgress, setShowCurrentProgress] = useState(true);

  const [showPracticeOverlay, setShowPracticeOverlay] = useState(true);

  const [showQuestions, setShowQuestions] = useState(false);

  const questionsRefText = useRef<HTMLDivElement>(null);
  const questionsRefVoice = useRef<HTMLDivElement>(null);

  const scrollOffsetBeforeQuestionsRef = useRef<number>(0);

  // Voice effect helpers
  const postQStartCountRef = useRef(0);
  const biztatasPlayedRef = useRef(false);
  const megerositesPlayedRef = useRef(false);
  const QuestionsFeedbackSeen = useRef(false);

  // Handle the recording status and set the mode accordingly
  const handleCloseIntro = () => {
    setShowIntro(false);
  };

  // Handle closing the QuestionsFeedback
  const handleCloseQuestionsFeedback = () => {
    setShowQuestionsFeedback(false);
    setShowPracticeOverlay(true);
  };

  // Handle the confirmation for skipping the concept
  const handleShowConfirmSkip = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (recordingStatus === 'recording') {
      stopRecording();
    }
    setShowConfirmSkip(true);
  };

  // Set up content height and progress bar
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const shouldHideProgressBar =
    showQuestionsFeedback || showGeneralFeedback || showLikertFeedback;

  const felvetelPlayedRef = useRef(false);
  const prevStepRef = useRef<number>(-1 as number);

  // Handle the end of practice and reset the state
  const handleEndPractice = () => {
    handleReset();
    setShowPracticeFeedback(true);
    soundManager.playGroup('gyakorlasVege');
    console.log('handleEndPractice');
  };

  const handleClosePracticeFeedback = () => {
    setDone();
    setShowPracticeFeedback(false);
    setPracticeDone();
    setShowPracticeOverlay(true);
    console.log('handleClosePracticeFeedback');
  };

  // Dummy save function to handle save button click
  const dummySave = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (recordingStatus === 'recording') {
      stopRecording();
    }
    if (inputFieldsCount < 10 && recordings.length < 4) {
      if (dailyAnsweredCount === 0 || dailyAnsweredCount === 1) {
        setShowPracticeOverlay(false);
        setOverlayStep(questionIdx);
      }
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

  // Scroll to the element with an offset
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

  // 1️⃣ Reset when Q-feedback opens:
  useEffect(() => {
    if (showQuestionsFeedback) {
      console.log(
        '[⚡️ Practice] Q-feedback opened; snapshot recordings:',
        recordings.length
      );
      postQStartCountRef.current = recordings.length;
      biztatasPlayedRef.current = false;
      megerositesPlayedRef.current = false;
      QuestionsFeedbackSeen.current = true;
    }
  }, [showQuestionsFeedback, recordings.length]);

  const prevRecCountRef = useRef<number>(0);

  useEffect(() => {
    const prev = prevRecCountRef.current;
    const curr = recordings.length;
  
    if (curr > prev) {
      if (curr === 1) {
        // after first recording
        soundManager.playGroup('biztatas');        // encouragement :contentReference[oaicite:2]{index=2}
      } else if (curr === 2) {
        // after second recording
        soundManager.playGroup('megerosites');     // reinforcement :contentReference[oaicite:3]{index=3}
      }
    }
  
    prevRecCountRef.current = curr;
  }, [recordings.length]);

  useLayoutEffect(() => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      setProgressHeight(rect.height);
    }
  }, [renderReady, finalConceptName, showCurrentProgress]); // update when content changes

  useEffect(() => {
    if (showQuestionsFeedback) {
      const idx = recordings.length === 0 ? 0 : 1;
      const relPath = soundConfig.kerdesek[idx];
      console.log(`[Practice] ▶️ Playing ${relPath}`);
      soundManager.playFile(relPath);
    }
  }, [showQuestionsFeedback, recordings.length]);

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
      setShowPracticeOverlay(true);
    }
  }, [practice]);

  // Effect to handle show/hide the help overlay
  useEffect(() => {
    const shouldLockScroll =
      showQuestionsFeedback || showGeneralFeedback || showLikertFeedback;

    if (!showHelpOverlay) {
      document.body.style.overflowY = shouldLockScroll ? 'hidden' : 'auto';
    }

    return () => {
      if (!showHelpOverlay) {
        document.body.style.overflowY = 'auto';
      }
    };
  }, [
    showQuestionsFeedback,
    showGeneralFeedback,
    showLikertFeedback,
    showHelpOverlay,
  ]);

  useEffect(() => {
    if (mode === 'text') {
      document.getElementById(`input-field-${0}`)?.focus();
    }
  }, [mode]);

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
  }, [
    showQuestionsFeedback,
    showGeneralFeedback,
    showLikertFeedback,
    recordings.length,
    inputFields.length,
    renderReady,
  ]);

  console.log('contentHeight:', contentHeight);

  useEffect(() => {
    if (
      !showQuestionsFeedback &&
      progressRef.current &&
      scrollableContainerRef.current
    ) {
      const observer = new MutationObserver(() => {
        // Scroll to top when a DOM mutation happens (like progress bar visibility/height change)
        scrollableContainerRef.current?.scrollTo({
          top: 0,
          behavior: 'auto',
        });

        observer.disconnect(); // Stop after first scroll
      });

      observer.observe(progressRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [showQuestionsFeedback]);

  // Force re-render on 10 concepts
  useEffect(() => {
    if (dailyAnsweredCount === 10) {
      setShowQuestionsFeedback(false);
      setShowLikertFeedback(false);
      setShowGeneralFeedback(false);
      setMode('voice'); // Reset mode to default
    }
  }, [dailyAnsweredCount, setShowQuestionsFeedback]);

  if (practice !== 'female' && practice !== 'male' && practice !== 'neutral') {
    return null;
  }

  if (!show) return null;

  return (
    <>
      {showIntro ? (
        <Intro show={showIntro} handleClose={handleCloseIntro} />
      ) : showPracticeFeedback ? (
        <PracticeFeedback
          show={showPracticeFeedback}
          handleClose={handleClosePracticeFeedback}
        />
      ) : (
        <Box
          flex="1"
          overflowX="hidden"
          height={showQuestionsFeedback ? '100%' : '100%'}
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
          {showPracticeOverlay && !showQuestionsFeedback && (
            <PracticeOverlay
              mode="voice"
              show={!showPracticeFeedback}
              recordings={recordings}
              currentStep={overlayStep}
              onStepChange={(step) => {
                const newStep =
                  typeof step === 'function' ? step(prevStepRef.current) : step;

                // only fire once when we cross into step #2 (overlayStep===1)
                if (
                  newStep === 1 &&
                  prevStepRef.current !== 1 &&
                  !felvetelPlayedRef.current
                ) {
                  soundManager.playGroup('felvetelBemutato');
                  felvetelPlayedRef.current = true;
                }

                // 👇 record the numeric step into your ref
                prevStepRef.current = newStep;

                // 👇 then update your React state
                setOverlayStep(newStep);
              }}
              onClose={() => {
                setShowPracticeOverlay(false);
                setSaveButton(true);
              }}
            />
          )}
          <Flex
            zIndex={1000}
            alignItems="center"
            justifyContent="center"
            mt="5dvh"
            overflowY="visible"
          >
            <Box height="20px" />
          </Flex>
          {showHelpOverlay && (
            <OverlayHelp
              mode={mode}
              closeOverlay={() => setShowHelpOverlay(false)}
            />
          )}
          <Box
            id="progressbar-main"
            position="absolute"
            top="2rem"
            left="0"
            w="100%"
            zIndex="3"
            display={shouldHideProgressBar ? 'none' : 'block'}
            minHeight={shouldHideProgressBar ? '6rem' : 'undefined'}
          >
            {!isMobile && (
              <WhiteButton
                onClick={(e) => {
                  e.stopPropagation(); // Prevent closing immediately
                  setShowHelpOverlay((prev) => !prev);
                }}
                position="fixed"
                bottom="10%"
                right="10%"
                title="Segítség"
                bgColor="white"
                rounded="full"
                h="90px"
                w="90px"
                border="none"
                zIndex="2"
              >
                <Box transform="scale(4)">
                  <TbHelp />
                </Box>
              </WhiteButton>
            )}

            <Box id="true-progress" position="relative">
              {/* Close Button */}
              <Button
                onClick={() => router.push('/dashboard')}
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
                            <Flex justify="center" align="center" gap="8px">
                              <Image
                                height="100px"
                                src="/favicon.ico"
                                filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.5))"
                                alt="Mimó Icon"
                              />
                              <WhiteButton onClick={() => setShowQuestions(true)} rounded="full" h="4rem" fontSize="1.3rem" id="questions-button">
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
                          </Box>
                        )}
                      </Box>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              </Box>
              {!showGeneralFeedback &&
                !showLikertFeedback &&
                !showQuestionsFeedback && (
                  <Flex
                    id="records"
                    flexDir="column"
                    zIndex={mode === 'text' ? '1' : '0'}
                    maxH="50vh"
                  >
                    {showGeneralFeedback ? null : showLikertFeedback ? null : showQuestionsFeedback ? null : (
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
                    )}

                    {showGeneralFeedback ? null : showLikertFeedback ? null : showQuestionsFeedback ? null : (
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
                                                {saveButton ? (
                                                  <Flex
                                                    justify="center"
                                                    gap={0}
                                                    mt={[0, 0]}
                                                  >
                                                    {inputFieldsCount ===
                                                      MAX_FIELDS ||
                                                    recordings.length === 4 ? (
                                                      <PurpleButton
                                                        onClick={
                                                          handleEndPractice
                                                        }
                                                        width="300px"
                                                        disabled={
                                                          recordings.length ===
                                                            0 &&
                                                          !inputFields.some(
                                                            (item) =>
                                                              item.trim() !== ''
                                                          )
                                                        }
                                                      >
                                                        Jöhet a következő!
                                                      </PurpleButton>
                                                    ) : recordings.length ===
                                                        0 &&
                                                      !inputFields.some(
                                                        (item) =>
                                                          item.trim() !== ''
                                                      ) ? (
                                                      <WhiteButton
                                                        onClick={
                                                          handleEndPractice
                                                        }
                                                        width="300px"
                                                        disabled
                                                      >
                                                        Jöhet a következő!
                                                      </WhiteButton>
                                                    ) : (
                                                      <PurpleButton
                                                        onClick={
                                                          handleEndPractice
                                                        }
                                                        width="300px"
                                                      >
                                                        Jöhet a következő!
                                                      </PurpleButton>
                                                    )}
                                                  </Flex>
                                                ) : (
                                                  <Flex
                                                    justify="center"
                                                    gap={0}
                                                    mt={[0, 0]}
                                                  >
                                                    <PurpleButton
                                                      onClick={dummySave}
                                                      width="300px"
                                                      disabled={
                                                        recordings.length ===
                                                          0 &&
                                                        !inputFields.some(
                                                          (item) =>
                                                            item.trim() !== ''
                                                        )
                                                      }
                                                    >
                                                      Jöhet a következő!
                                                    </PurpleButton>
                                                  </Flex>
                                                )}
                                                <Flex
                                                  justify="center"
                                                  gap={4}
                                                  mt={[2, 4]}
                                                >
                                                  <GhostButton
                                                    id="keyboard-toggle"
                                                    onClick={() =>
                                                      setMode('voice')
                                                    }
                                                    fontWeight="extrabold"
                                                  >
                                                    <FaMicrophone />
                                                    Mikrofon használata
                                                  </GhostButton>
                                                </Flex>
                                                <WhiteButton
                                                  id="unknown-word"
                                                  onClick={
                                                    handleShowConfirmSkip
                                                  }
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
                              Sikeresen megmagyaráztad az összes elérhető
                              fogalmat! <br />
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
                    )}
                  </Flex>
                )}
            </Box>

            {!showGeneralFeedback &&
              !showLikertFeedback &&
              !showQuestionsFeedback && (
                <Flex
                  id="main-content"
                  bg="transparent"
                  flexDirection="column"
                  mt={`${progressHeight}px`}
                  position="relative"
                  top={{
                    base: '1rem',
                    sm: '1rem',
                    md: '1rem',
                    lg: '0rem',
                    xl: '0rem',
                  }}
                >
                  {!showGeneralFeedback &&
                    !showLikertFeedback &&
                    !showQuestionsFeedback &&
                    mode === 'voice' &&
                    currentConcept &&
                    dailyAnsweredCount < 10 && (
                      <Flex
                        id="main-recordings-stuff"
                        alignItems="center"
                        flexDirection="column"
                        ref={questionsRefVoice}
                      >
                        <Flex justify="center" align="center" gap="8px">
                          <Image
                            height="100px"
                            src="/favicon.ico"
                            filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.5))"
                            alt="Mimó Icon"
                          />
                          <WhiteButton onClick={() => setShowQuestions(true)} rounded="full" h="4rem" fontSize="1.3rem" id="questions-button">
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
                        {recordings.length >= 1 ? (
                          <div
                            id="voice-track"
                            style={{ height: 'fit-content' }}
                          >
                            <RecordingControls
                              recordingStatus={recordingStatus}
                              getMicrophonePermission={getMicrophonePermission}
                              startRecording={handleStartRecording}
                              stopRecording={stopRecording}
                              recordings={recordings}
                              deleteRecording={handleDeleteRecording}
                              maxRecordings={maxRecs}
                              timer={timer}
                            />
                            <div style={{ height: '10px' }}></div>
                          </div>
                        ) : (
                          <div id="recording-button">
                            <RecordingControls
                              recordingStatus={recordingStatus}
                              getMicrophonePermission={getMicrophonePermission}
                              startRecording={handleStartRecording}
                              stopRecording={stopRecording}
                              recordings={recordings}
                              deleteRecording={handleDeleteRecording}
                              maxRecordings={maxRecs}
                              timer={timer}
                            />
                          </div>
                        )}
                      </Flex>
                    )}

                  {showGeneralFeedback ? null : showLikertFeedback ? null : showQuestionsFeedback ? null : mode ===
                      'voice' && currentConcept ? (
                    <>
                      {dailyAnsweredCount < 10 ? (
                        <VStack>
                          {currentConcept ? (
                            <Box>
                              <VStack>
                                {/* Heading */}
                                <VStack
                                  width={['440px', '540px', '540px', '540px']}
                                  pb="20px"
                                >
                                  <Flex
                                    justify="center"
                                    gap={0}
                                    mt={[0, 0]}
                                    id="next"
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

                                  <Flex justify="center" gap={4} mt={[2, 4]}>
                                    <GhostButton
                                      id="keyboard-toggle"
                                      fontWeight="extrabold"
                                      onClick={() => {
                                        if (saveButton) {
                                          setMode('text');
                                          soundManager.playGroup('beirasBemutato');
                                        }
                                      }}
                                    >
                                      <FaKeyboard />
                                      Billentyűzet használata
                                    </GhostButton>
                                  </Flex>
                                  <WhiteButton
                                    id="unknown-word"
                                    onClick={handleShowConfirmSkip}
                                    width="300px"
                                  >
                                    Nem ismerem a fogalmat
                                  </WhiteButton>
                                  <Box height="1rem" />
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
                </Flex>
              )}
          </Box>
        </Box>
      )}
    </>
  );
};

export default Practice;
