'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import useConcepts from '../../../hooks/useConcepts';
import RecordingControls from './components/RecordingControls';
import { useAuthCheck } from '../../../hooks/useAuthCheck';
import QuestionsFeedback from './components/QuestionsFeedback';
import { firestoredb } from '../../api/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
  HStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import DashboardBar from '@/components/bars/DashboardBar';
import LikertFeedback from './components/LikertFeedback';
import GhostButton from '@/components/buttons/GhostButton';
import PurpleButton from '@/components/buttons/PurpleButton';
import WhiteButton from '@/components/buttons/WhiteButton';
import GeneralFeedback from './components/GeneralFeedback';
import ConfirmPopup from '@/components/ConfirmPopup';
import { FiArrowLeft } from 'react-icons/fi';
import { TbHelp } from 'react-icons/tb';
import HelpPopover from '@/components/HelpPopover';
import ScrollableBackground from '@/components/ScrollableBackground';
import OverlayHelp from './components/OverlayHelp';
import Intro from './components/Intro';
import { set } from 'firebase/database';
import PracticeFeedback from './components/PracticeFeedback';
import Practice from './components/Practice';
import { soundManager } from '@/lib/sounds';
import { soundConfig } from '@/lib/sounds/soundConfig';
import QuestionsPopover from './components/QuestionsPopopver';

const Home = () => {
  // State, variable and hook initializations
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isMdScreen = useBreakpointValue({ base: true, lg: false });
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { isCheckingAuth, authLoading } = useAuthCheck();
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
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
  const hasPlayedBeirasRef = useRef(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const timedOutRef = useRef(false);
  const prevTimerRef = useRef<number>(0);
  const prevRecCountRef = useRef<number>(0);

  useEffect(() => {
    // when mode flips to 'text' (i.e. keyboard), play the beírás-bemutató once
    if (mode === 'text' && !hasPlayedBeirasRef.current) {
      console.log('[Game] ▶️ Playing beírás-bemutató');
      soundManager.playGroup('beirasBemutato', { once: true });
      hasPlayedBeirasRef.current = true;
    }
  }, [mode]);

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
    setInputFields,
    subcatRepeat,
    sessionAnswered,
    timer,
    handleSave,
    practice,
    setPracticeDone,
    handleReset,
    showingQuestions,
    setShowingQuestions,
  } = useConcepts();

  const [progressbarCounter, setProgressbarCounter] =
    useState(dailyAnsweredCount);

  const [showCurrentProgress, setShowCurrentProgress] = useState(true);

  const [showPracticeOverlay, setShowPracticeOverlay] = useState(false);

  const questionsRefText = useRef<HTMLDivElement>(null);
  const questionsRefVoice = useRef<HTMLDivElement>(null);

  const scrollOffsetBeforeQuestionsRef = useRef<number>(0);

  const autoStopPlayedRef = useRef(false);
  const prevRecStatusRef = useRef<string>(recordingStatus);
  const hasPlayedConceptAudioRef = useRef<string | null>(null);


  const [answeredWithoutQuestions, setAnsweredWithoutQuestions] = useState<{
    [key: number]: string;
  }>({});

  // ① Reset guard whenever a brand-new recording begins:
  useEffect(() => {
    const prev = prevRecStatusRef.current;
    const curr = recordingStatus;

    if (prev !== 'recording' && curr === 'recording') {
      autoStopPlayedRef.current = false;
      console.log('[Game] 🔄 New recording started, reset auto-stop guard');
    }

    prevRecStatusRef.current = curr;
  }, [recordingStatus]);

  // ② Fire exactly once, at the moment we hit (or cross) 120 s:
  useEffect(() => {
    const prevT = prevTimerRef.current;
    const nowT  = timer;
    
    // once we hit 120s, flag and force‐stop
    if (
      recordingStatus === 'recording' &&
      prevT < 119 &&
      nowT  >= 119 &&
      !timedOutRef.current
     ) {
      console.log('[Game] ▶️ 2 min reached → auto‐stop');
      timedOutRef.current = true;
      stopRecording();
    }
    
      prevTimerRef.current = nowT;
    }, [timer, recordingStatus, stopRecording]);

  useLayoutEffect(() => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      setProgressHeight(rect.height);
    }
  }, [renderReady, finalConceptName, showCurrentProgress]); // update when content changes

  useEffect(() => {
    const prevCount = prevRecCountRef.current; 
    const currCount = recordings.length; 
  
    if (currCount > prevCount) { 
      if (timedOutRef.current) { 
        console.log('[Game] ▶️ auto‐timeout → felvetelVege'); 
        setTimeout(() => soundManager.playGroup('felvetelVege'), 500);
        timedOutRef.current = false; 
      } else if (prevCount === 0) { 
        console.log('[Game] ▶️ first recording → biztatas'); 
        soundManager.playGroup('biztatas'); 
      } else { 
        console.log('[Game] ▶️ second recording → megerosites'); 
        soundManager.playGroup('megerosites'); 
      } 
    } 
  
    prevRecCountRef.current = currCount;
  }, [recordings.length]);

  // Effect to reset state when currentConcept changes
  useEffect(() => {
    setLoaded(false);
    if (currentConcept && renderReady) {
      setSaveButton(false);
      setMaxRecs(4);
      setFinalConceptName('');
      const timer = setTimeout(() => {
        setFinalConceptName(currentConcept.concept_name);
        setFinalConceptCategory(currentConcept.concept_id.slice(0, 6));
        setLoaded(true);
      }, 100);

      // Cleanup the timeout if the component is unmounted or dependencies change
      return () => clearTimeout(timer);
    }
  }, [currentConcept, renderReady]);

  useEffect(() => {
    if (practice !== 'done') {
      setShowIntro(true);
    }
  }, [practice]);

  // at the top of your component:
  useEffect(() => {
    hasPlayedConceptAudioRef.current = null;
    console.log('[Game] reset hasPlayedConceptAudioRef on mount');
  }, []);
  


  // … down in your effects block …
  useEffect(() => {
    if (
      practice !== 'done' || // only after practice
      showQuestionsFeedback || // any overlay open?
      showGeneralFeedback ||
      showLikertFeedback ||
      dailyAnsweredCount === 10 ||
      !currentConcept?.concept_id ||
      recordingStatus === 'recording'
    ) {
      return;
    }
  
    const id = currentConcept.concept_id;
  
    // Only play once per concept per page visit
    if (hasPlayedConceptAudioRef.current === id) return;
  
    hasPlayedConceptAudioRef.current = id;
  
    console.log('[Game] ▶️ Playing concept intro + name');
    soundManager
      .playSequence([
        { type: 'group', group: 'elsoFogalom', opts: { once: true } },
        { type: 'concept', id },
      ])
      .catch(console.error);
  }, [
    currentConcept?.concept_id,
    practice,
    showQuestionsFeedback,
    showGeneralFeedback,
    showLikertFeedback,
    renderReady,
    dailyAnsweredCount,
    recordingStatus,
  ]);
   
  // … inside your component …
  const prevQRef = useRef(false);

  useEffect(() => {
    // when it flips true, play kerdesek one time
    if (showQuestionsFeedback && !prevQRef.current) {
      console.log('[Game] ▶️ QuestionsFeedback opened → kerdesek');
      if (recordingStatus !== 'recording') {
        soundManager.playGroup('kerdesek');
      }
    }
    prevQRef.current = showQuestionsFeedback;
  }, [recordingStatus, showQuestionsFeedback]);

  const K_PREFIXES = React.useMemo<Array<keyof typeof soundConfig>>(
    () => ['kovetkezoMegtanit', 'kovetkezoErtek', 'kovetkezoTudom'],
    []
  );

  function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // … inside your component …
  const prevGeneralRef = useRef(false);

  useEffect(() => {
    if (
      showGeneralFeedback &&
      !prevGeneralRef.current &&
      dailyAnsweredCount < 9
    ) {
      // 1) randomly pick one of the three “következő” groups
      const prefix = pickRandom(K_PREFIXES);

      // 2) figure out which concept number we just finished:
      //    if dailyAnsweredCount just reached 4, idx = 4
      const idx = Math.min(Math.max(dailyAnsweredCount, 0), 9);

      // 3) pull the exact file for that prefix & index:
      const arr = soundConfig[prefix];
      const path = arr[idx]; // zero-based array

      console.log(`[Game] ▶️ Playing ${prefix}[${idx}] →`, path);
      if (recordingStatus !== 'recording') {
        soundManager.playFile(path);
      }
    }
    prevGeneralRef.current = showGeneralFeedback;
  }, [recordingStatus, showGeneralFeedback, dailyAnsweredCount, K_PREFIXES]);

  const prevDoneRef = useRef(false);

  useEffect(() => {
    const doneNow = dailyAnsweredCount === 10;
    if (doneNow && !prevDoneRef.current) {
      console.log('[Game] ▶️ All done → playing exit line');
      if (recordingStatus !== 'recording') {
        soundManager.playGroup('kilepesVegen');
      }
    }
    prevDoneRef.current = doneNow;
  }, [recordingStatus, dailyAnsweredCount]);

  useEffect(() => {
    setProgressbarCounter(dailyAnsweredCount);
  }, [dailyAnsweredCount]);

  const handleCloseIntro = () => {
    setShowIntro(false);
  };

  // Handle closing the QuestionsFeedback
  const handleCloseQuestionsFeedback = () => {
    setShowQuestionsFeedback(false);
  };

  useEffect(() => {
    const shouldLockScroll =
      showQuestionsFeedback || showGeneralFeedback || showLikertFeedback;

    // ❌ Don't change body overflow when OverlayHelp is open
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

  // Handle showing the QuestionsFeedback
  const showCloseQuestionsFeedback = () => {
    scrollOffsetBeforeQuestionsRef.current =
      scrollableContainerRef.current?.scrollTop || 0;
    setShowQuestionsFeedback(true);
  };
  // Handle closing the LikertFeedback and saving the value
  const handleLikertClose = async (value: number | null) => {
    if (!user || !user.uid) {
      console.error('User ID is missing');
      return;
    }

    if (value == null) {
      console.error('Received null value for Likert score');
      return;
    }

    console.log('Likert value: ', value);
    try {
      await setDoc(
        doc(firestoredb, 'user_help_scores', user!.uid),
        {
          [Math.floor(Date.now() / 1000)]: value || null,
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving Likert value:', error);
    }

    setShowLikertFeedback(false);
    setSavedLikertValue(value);
    setShowCurrentProgress(true);
  };

  const handleGeneralClose = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setShowGeneralFeedback(false);
    setShowCurrentProgress(true);
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
  const dummySave = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (recordingStatus === 'recording') {
      await stopRecording();
    }
    if (inputFieldsCount < 10 && recordings.length < 4) {
      if (dailyAnsweredCount === 0 || dailyAnsweredCount === 1) {
        setShowQuestionsFeedback(true);
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
    } else if (inputFieldsCount === 10) {
      await handleFeedback(event);
    } else {
      await handleFeedback(event);
    }
  };

  const handleFeedback = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (recordingStatus === 'recording') {
      await stopRecording(); // ❗ await stop before navigating away
    }
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
    handleSaveAndReset(event, true);
    setShowConfirmSkip(false);
  };

  const handleShowHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  useEffect(() => {
    if (mode === 'text') {
      document.getElementById(`input-field-${0}`)?.focus();
    }
  }, [mode]);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const shouldHideProgressBar =
    showQuestionsFeedback || showGeneralFeedback || showLikertFeedback;

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

  const handleClosePractice = () => {
    setPracticeDone();
  };

  // Loading and authentication check
  if (authLoading || isCheckingAuth || !user || !user.uid || dataLoading) {
    return (
      <Flex
        bg="transparent"
        minH="100vh"
        minW="100vw"
        direction="column"
        align="center"
        textAlign="center"
        zIndex="3"
      >
        <Spinner color="black" m="auto" size="xl" />
      </Flex>
    );
  }

  // Main return block
  return (
    <>
      {practice === 'done' ? (
        <Box
          flex="1"
          overflowX="hidden"
          height={showQuestionsFeedback ? '100%' : '100%'}
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
                hidden={
                  isMdScreen ||
                  showQuestionsFeedback ||
                  showGeneralFeedback ||
                  !loaded
                }
                position="relative"
                right={['10px', '10px', '10px', '60px', '160px', '280px']}
                top="150px"
                filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                zIndex="5"
                alt="Main Character"
              />
            ))}

          {showHelp && (
            <Box key={mode} zIndex={1000} mt="20">
              <HelpPopover
                show={showHelp}
                close={() => handleCloseHelp()}
                mode={mode}
              />
            </Box>
          )}

          {showGeneralFeedback ? (
            <Flex
              zIndex={1000}
              alignItems="center"
              justifyContent="center"
              mt="5dvh"
              overflow="visible"
            >
              <GeneralFeedback
                show={showGeneralFeedback}
                handleClose={() =>
                  handleGeneralClose({} as React.MouseEvent<HTMLButtonElement>)
                }
                count={dailyAnsweredCount}
              />
              <Box height="20px" />
            </Flex>
          ) : showLikertFeedback ? (
            <Flex zIndex={1000} pb="2rem">
              <LikertFeedback
                show={showLikertFeedback}
                handleLikertClose={handleLikertClose}
                user={user.uid}
              />
            </Flex>
          ) : showQuestionsFeedback ? (
            <Flex
              zIndex={1000}
              alignItems="center"
              justifyContent="center"
              mt="5dvh"
              overflow="visible"
            >
              <QuestionsFeedback
                show={showQuestionsFeedback}
                handleClose={handleCloseQuestionsFeedback}
              />
              <Box height="20px" />
            </Flex>
          ) : null}

          {showHelpOverlay && (
            <OverlayHelp
              mode={mode}
              closeOverlay={() => setShowHelpOverlay(false)}
            />
          )}

          <Box
            id="progressbar-main"
            position="absolute"
            top="2rem" // adjust based on your navbar height
            left="0"
            w="100%"
            zIndex="3"
            display={shouldHideProgressBar ? 'none' : 'block'}
            minHeight={shouldHideProgressBar ? '6rem' : 'undefined'}
          >
            {!isMobile && dailyAnsweredCount < 10 && (
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
                {showGeneralFeedback ? null : showLikertFeedback ? null : showQuestionsFeedback ? null : (
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
                                <Image
                                  height="100px"
                                  src="/favicon.ico"
                                  filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                                  alt="Mimó Icon"
                                />
                                <WhiteButton
                                  id="questions-button"
                                  onClick={() => setShowQuestions(true)}
                                  rounded="full"
                                  h="4rem"
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
                )}
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
                                                <Flex
                                                  justify="center"
                                                  gap={0}
                                                  mt={[0, 0]}
                                                >
                                                  {inputFieldsCount ===
                                                    MAX_FIELDS ||
                                                  recordings.length === 4 ? (
                                                    <PurpleButton
                                                      onClick={handleFeedback}
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
                                                  ) : recordings.length === 0 &&
                                                    !inputFields.some(
                                                      (item) =>
                                                        item.trim() !== ''
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
                                                  disabled={
                                                    recordingStatus ===
                                                    'recording'
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
                        <Flex justify="center" align="center" gap="8px" >
                          <Image
                            height="110px"
                            src="/favicon.ico"
                            filter="drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))"
                            alt="Mimó Icon"
                          />
                          <WhiteButton
                            id='questions-button'
                            onClick={() => setShowQuestions(true)}
                            rounded="full"
                            h="4rem"
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
                        </Flex>
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

                                  <Flex justify="center" gap={4} mt={[2, 4]}>
                                    <GhostButton
                                      id="keyboard-toggle"
                                      onClick={() => setMode('text')}
                                      disabled={recordingStatus === 'recording'}
                                      fontWeight="extrabold"
                                    >
                                      <FaKeyboard />
                                      Billentyűzet használata
                                    </GhostButton>
                                  </Flex>
                                  <WhiteButton
                                    id="unknown-word"
                                    onClick={handleShowConfirmSkip}
                                    disabled={recordingStatus === 'recording'}
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

            {dailyAnsweredCount === 10 &&
              !showQuestionsFeedback &&
              !showLikertFeedback &&
              !showGeneralFeedback && (
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
            {loaded &&
            !currentConcept &&
            !showQuestionsFeedback &&
            !showLikertFeedback &&
            !showGeneralFeedback ? (
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
