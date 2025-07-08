'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useExperimenterCheck } from '../../../hooks/useExperimenterCheck';
import { FaPlus } from 'react-icons/fa';
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
import PurpleButton from '@/components/buttons/PurpleButton';
import WhiteButton from '@/components/buttons/WhiteButton';
import ConfirmPopup from '@/components/ConfirmPopup';
import { FiArrowLeft } from 'react-icons/fi';
import useExperimenterGame from '@/hooks/useExperimenterGame';
import Practice from './components/Practice';
import { soundManager } from '@/lib/sounds';
import QuestionsPopover from './components/QuestionsPopopver';

const Home = () => {
  // State, variable and hook initializations
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isMdScreen = useBreakpointValue({ base: true, lg: false });
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { isCheckingExperimenter, experimenterLoading } =
    useExperimenterCheck();
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [finalConceptName, setFinalConceptName] = useState<string | null>(null);
  const [finalConceptCategory, setFinalConceptCategory] = useState<
    string | null
  >(null);
  const [saveButton, setSaveButton] = useState<Boolean>(false);
  const [maxRecs, setMaxRecs] = useState<number>(4);
  const [showLikertFeedback, setShowLikertFeedback] = useState<boolean>(false);
  const [savedLikertValue, setSavedLikertValue] = useState<number | null>(null);
  const [showGeneralFeedback, setShowGeneralFeedback] =
    useState<boolean>(false);
  const [showConfirmSkip, setShowConfirmSkip] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [progressHeight, setProgressHeight] = useState<number>(0);
  const [showIntro, setShowIntro] = useState(false);
  const [showPracticeFeedback, setShowPracticeFeedback] = useState(false);
  const [pseudoUID, setPseudoUID] = useState<string>('');
  const hasPlayedFirstSeqRef = useRef(false);
  const [showQuestions, setShowQuestions] = useState(false);

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
    MAX_FIELDS,
    handleDeleteRecording,
    handleStartRecording,
    handleSaveAndReset,
    inputFields,
    setInputFields,
    subcatRepeat,
    sessionAnswered,
    timer,
    handleSave,
    handleInputChangeForDynamicFields,
    handleKeyDown,
    handleAddField,
    canAddField,
    practice,
    setPracticeDone,
    handleReset,
    showingQuestions,
    setShowingQuestions,
  } = useExperimenterGame(pseudoUID);

  const [progressbarCounter, setProgressbarCounter] =
    useState(dailyAnsweredCount);

  const [answeredWithoutQuestions, setAnsweredWithoutQuestions] = useState<{
    [key: number]: string;
  }>({});

  const [showCurrentProgress, setShowCurrentProgress] = useState(true);

  const questionsRefText = useRef<HTMLDivElement>(null);
  const questionsRefVoice = useRef<HTMLDivElement>(null);

  // 2) Experiment‐end line
  useEffect(() => {
    if (practice !== 'done') return;
    if (dailyAnsweredCount === 10) {
      soundManager.playGroup('experimentVegen');
    }
  }, [dailyAnsweredCount, practice]);

  // Effect to reset state when currentConcept changes
  useEffect(() => {
    if (practice !== 'done') return;

    setLoaded(false);
    if (currentConcept && renderReady) {
      setSaveButton(false);
      setMaxRecs(4);
      setFinalConceptName('');
      const timer = setTimeout(() => {
        setFinalConceptName(currentConcept.concept_name);
        setFinalConceptCategory(currentConcept.concept_id.slice(0, 6));
        setLoaded(true);
        if (dailyAnsweredCount === 0 && !hasPlayedFirstSeqRef.current) {
          // very first concept of the session
          hasPlayedFirstSeqRef.current = true;
          soundManager
            .playSequence([
              { type: 'group', group: 'elsoFogalom' },
              { type: 'concept', id: currentConcept.concept_id },
            ])
            .catch(console.error);
        } else if (dailyAnsweredCount < 10) {
          // concepts #2 through #10
          soundManager
            .playConcept(currentConcept.concept_id)
            .catch(console.error);
        }
      }, 100);

      // Cleanup the timeout if the component is unmounted or dependencies change
      return () => clearTimeout(timer);
    }
  }, [currentConcept, renderReady, practice, dailyAnsweredCount]);
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

  useEffect(() => {
    setProgressbarCounter(dailyAnsweredCount);
  }, [dailyAnsweredCount]);

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

  const handleMarkAnswered = () => {
    setAnsweredWithoutQuestions((prev) => {
      const newAnswered = { ...prev };
      inputFields.forEach((val, idx) => {
        if (val.trim() !== '') {
          newAnswered[idx] = val;
        }
      });
      return newAnswered;
    });
  };

  // Dummy save function to handle save button click
  const dummySave = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowingQuestions(true);
    handleMarkAnswered();

    if (recordingStatus === 'recording') {
      stopRecording();
    }

    if (dailyAnsweredCount === 0 || dailyAnsweredCount === 1) {
      soundManager.playGroup('kerdesek');
    }

    if (inputFieldsCount < MAX_FIELDS && recordings.length < 4) {
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
    } else if (inputFieldsCount === MAX_FIELDS) {
      handleFeedback(event);
    } else {
      handleFeedback(event);
    }
  };

  useEffect(() => {
    const answeredValues = Object.values(answeredWithoutQuestions); 
    const updatedFields = inputFields.map((field) => 
      answeredValues.includes(field) ? `${field}⠀` : field 
    ); 
    setInputFields(updatedFields); 
  }, [answeredWithoutQuestions, inputFields, setInputFields]);

  const handleFeedback = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnsweredWithoutQuestions({});
    setShowingQuestions(false);
    stopRecording();
    setTimeout(() => {
      if (
        sessionAnswered === 4 || // Trigger for 5
        sessionAnswered === 8 // Trigger for 9
      ) {
        if (inputFields.some((field) => field !== '')) {
          setProgressbarCounter((prev) => prev + 1);
          setShowLikertFeedback(true);
          setShowCurrentProgress(false);
          handleSaveAndReset(event);
        } else {
          handleSaveAndReset(event);
        }
      } else if (
        sessionAnswered === 0 || // Trigger for 1
        sessionAnswered === 2 || // Trigger for 3
        sessionAnswered === 6 // Trigger for 7
      ) {
        setShowGeneralFeedback(true);
        setShowCurrentProgress(false);
        handleSaveAndReset(event);
        setProgressbarCounter((prev) => prev + 1);
      } else {
        handleSaveAndReset(event);
      }
    }, 100);
  };

  const handleShowConfirmSkip = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (recordingStatus === 'recording') {
      stopRecording();
    }
    setShowConfirmSkip(true);
  };

  const handleSkip = (event: React.MouseEvent<HTMLButtonElement>) => {
    handleSaveAndReset(event);
    setShowConfirmSkip(false);
  };

  // Loading and authentication check
  if (isCheckingExperimenter || !user || !user.uid || !renderReady) {
    return (
      <>
        <Flex
          bg="transparent"
          minH="100vh"
          minW="100vw"
          direction="column"
          align="center"
          textAlign="center"
        >
          <Spinner color="black" m="auto" size="xl" />
        </Flex>
      </>
    );
  }

  // Main return block
  return (
    <>
      {practice === 'done' ? (
        <Box
          flex="1"
          overflowX="hidden"
          height="100%"
          width="100%"
          px={[4, 8]}
          id="content"
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
          {saveButton ||
            (!currentConcept && (
              <Image
                src="/mimo-frontal.png"
                height={['120px', '140px', '180px', '200px']}
                hidden={isMdScreen || !loaded}
                position="relative"
                right={['10px', '10px', '10px', '60px', '160px', '280px']}
                top="150px"
                filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                zIndex="5"
                alt="Main Character"
              />
            ))}

          <Box
            id="progressbar-main"
            position="absolute"
            top="2rem" // adjust based on your navbar height
            left="0"
            w="100%"
            zIndex="3"
            display={'block'}
            minHeight={'undefined'}
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
                action={handleSkip}
                actionText="Átugrás"
                backText="Vissza"
                popupTitle="Biztosan átugrod ezt a fogalmat?"
              />
              <Box
                position="relative"
                id="progress"
                left="50%"
                transform="translateX(-50%)"
              >
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
                        {renderReady && finalConceptName && loaded ? (
                          <Heading
                            as="h2"
                            size={['3xl', '3xl', '4xl']}
                            mb={['0', '0', '1vh']}
                            fontWeight="bold"
                            color="black"
                            textTransform="uppercase"
                          >
                            {finalConceptName}
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
                              minHeight="2rem" // FIX: Reserve space so it never pushes elements down
                              maxWidth="90vw"
                              px="4" // Ensures padding for readability
                              mx="auto"
                            >
                              Emlékezzen, csak a gyermek önálló, pontos
                              válaszait írja be!
                            </Text>

                            <Box display="flex" justifyContent="center" alignItems="center">
                              {/* Mimó favicon */}
                              <Image
                                height="100px"
                                src="/favicon.ico"
                                filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                                alt="Mimó Icon"
                              />

                              {/* Always-show Kérdések button */}
                              <WhiteButton
                                onClick={() => setShowQuestions(true)}
                                rounded="full"
                                ml="1.5rem"
                                fontSize="1.3rem"
                              >
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
                            </Box>
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
                                disabled={answeredWithoutQuestions.hasOwnProperty(
                                  index
                                )}
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
                                                onClick={handleFeedback}
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
                                                onClick={handleFeedback}
                                                width="300px"
                                                disabled
                                              >
                                                Jöhet a következő!
                                              </WhiteButton>
                                            ) : (
                                              <PurpleButton
                                                onClick={handleFeedback}
                                                width="300px"
                                              >
                                                Jöhet a következő!
                                              </PurpleButton>
                                            )}
                                          </Flex>

                                          <Flex
                                            justify="center"
                                            gap={4}
                                            mt={[2, 4]}
                                          ></Flex>
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

            {dailyAnsweredCount === 10 && (
              <Box mt="10dvh" left="50%" h="80dvh">
                <Heading
                  as="h1"
                  fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                  bg="#f2bf05"
                  p={10}
                  rounded="lg"
                  w={{ base: '90%', md: '70%', lg: '50%' }}
                  mx="auto"
                  mb="2"
                  boxShadow="5px 5px 8px 1px rgba(70, 70, 70, 0.2)"
                  zIndex={20}
                  textAlign="center"
                >
                  <b>
                    Ma már sikeresen megmagyaráztál 10 fogalmat
                    <br /> Nézz vissza holnap!
                  </b>
                </Heading>
                {isMobile ? (
                  <Image
                    src="/favicon.ico"
                    height="160px"
                    width="160px"
                    mt="4"
                    mx="auto"
                    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                    alt="Main Character"
                  />
                ) : (
                  <></>
                )}
              </Box>
            )}
            {loaded && !currentConcept ? (
              <>
                <Heading
                  as="h1"
                  size="2xl"
                  mt="12vh"
                  bg="brand.200"
                  p={10}
                  rounded="lg"
                  w={{ base: '90%', md: '36%', lg: '34%' }}
                  mx="auto"
                  mb="2"
                  shadow="5px 5px 8px 1px rgba(70, 70, 70, 0.2)"
                  textAlign="center"
                >
                  {subcatRepeat ? (
                    <b>
                      Egyelőre nincs több fogalom.
                      <br /> Nézz vissza később!
                    </b>
                  ) : (
                    <b>
                      Mára sajnos elfogytak a fogalmak.
                      <br /> Nézz vissza holnap!
                    </b>
                  )}
                </Heading>
                {isMobile ? (
                  <Image
                    src="/favicon.ico"
                    height="160px"
                    width="160px"
                    mt="4"
                    mx="auto"
                    filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                    alt="Main Character"
                  />
                ) : (
                  <></>
                )}
              </>
            ) : (
              <></>
            )}
          </Box>
        </Box>
      ) : (
        <Practice show={practice !== 'done'} setDone={setPracticeDone} />
      )}
    </>
  );
};

export default Home;
