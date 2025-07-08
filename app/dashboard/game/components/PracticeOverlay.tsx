'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, Text, useBreakpointValue } from '@chakra-ui/react';
import PurpleButton from '@/components/buttons/PurpleButton';
import { useTheme } from '@chakra-ui/system';
import { soundManager } from '@/lib/sounds';

interface PracticeOverlayProps {
  mode: 'voice' | 'text';
  show: boolean;
  recordings?: any[];
  onClose: () => void;
  initialStep?: number;
  currentStep: number;
  onStepChange: (step: number | ((prevStep: number) => number)) => void;
}

interface HelpItem {
  id: string;
  selector: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  config: {
    tooltipPosition: { top: string; left: string };
    clipPathAdjustments: {
      top: number;
      left: number;
      right: number;
      bottom: number;
    };
  };
}

const helpItems: HelpItem[] = [
  {
    id: 'true-progress',
    selector: '#true-progress',
    text: 'Itt láthatja a fogalmat, amiről szeretnénk, ha gyermeke tulajdonságokat sorolna fel. Adatfelvételünkhöz legalább öt, legfeljebb 15 tulajdonság megnevezését várjuk.',
    position: 'bottom',
    config: {
      tooltipPosition: { top: '140', left: '100' },
      clipPathAdjustments: {
        top: 6,
        left: 0,
        right: 16,
        bottom: 14,
      },
    },
  },
  {
    id: 'record-button',
    selector: '#record-button',
    text: 'Ezzel a gombbal veheti fel gyermeke válaszait. (Ha most nem szeretné kipróbálni, kattintson a "Tovább" gombra.)',
    position: 'right',
    config: {
      tooltipPosition: { top: '-200', left: '-40' },
      clipPathAdjustments: {
        top: -60,
        left: -80,
        right: 80,
        bottom: 112,
      },
    },
  },
  {
    id: 'voice-track',
    selector: '#voice-track',
    text: 'Az elkészült felvételeket visszahallgathatja, illetve törölheti is őket.',
    position: 'right',
    config: {
      tooltipPosition: { top: '-80', left: '135' },
      clipPathAdjustments: {
        top: 210,
        left: -10,
        right: 10,
        bottom: -15,
      },
    },
  },
  {
    id: 'keyboard-toggle',
    selector: '#keyboard-toggle',
    text: 'Később bármikor áttérhetnek billentyűzetre, ha nem kényelmes felvenni a gyermek hangját. A gomb aktív lesz, ha mindent elolvastak.',
    position: 'right',
    config: {
      tooltipPosition: { top: '-200', left: '120' },
      clipPathAdjustments: {
        top: -5,
        left: -35,
        right: 35,
        bottom: 8,
      },
    },
  },
  {
    id: 'unknown-word',
    selector: '#unknown-word',
    text: 'Amennyiben gyermeke nem ismeri a fogalmat, kihagyhatják azt. Most a gomb még nem ugorja át a fogalmat.',
    position: 'left',
    config: {
      tooltipPosition: { top: '-175', left: '120' },
      clipPathAdjustments: {
        top: -5,
        left: -5,
        right: 5,
        bottom: 10,
      },
    },
  },
  {
    id: 'questions-button',
    selector: '#questions-button',
    text: 'Mimó négy leggyakoribb kérdése segíthet a válaszadásban, de elsőként mindig próbáljanak enélkül válaszolni. Kérjük hangosan olvassa fel gyermekének a kérdéseket!',
    position: 'left',
    config: {
      tooltipPosition: { top: '50', left: '-220' },
      clipPathAdjustments: {
        top: -10,
        left: -5,
        right: 5,
        bottom: 16,
      },
    },
  },
  {
    id: 'next',
    selector: '#next',
    text: 'Ha gyermeke adott választ a fogalomra, ezzel a gombbal továbbléphetnek a következőre. A Bezárás gombbal kipróbálhatják a felületet.',
    position: 'left',
    config: {
      tooltipPosition: { top: '-200', left: '120' },
      clipPathAdjustments: {
        top: -5,
        left: -5,
        right: 5,
        bottom: 10,
      },
    },
  },
];

export default function PracticeOverlay({
  mode,
  show,
  recordings = [],
  onClose,
  currentStep,
  onStepChange,
}: PracticeOverlayProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [clipPath, setClipPath] = useState('none');
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const recordIdx = helpItems.findIndex((h) => h.id === 'record-button');
  const lastIdx = helpItems.findIndex((h) => h.id === 'next');
  const current = currentStep;
  const setCurrent = onStepChange;
  // ensure currentStep is within [0, helpItems.length–1]
  const idx = Math.min(Math.max(current, 0), helpItems.length - 1);

  // track viewport size for re-centering on resize/orientation
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const onResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const toPx = (v: string) =>
    v.endsWith('vw')
      ? (window.innerWidth * parseFloat(v)) / 100
      : v.endsWith('vh')
      ? (window.innerHeight * parseFloat(v)) / 100
      : parseFloat(v);

  // auto-advance from record to voice-track
  useEffect(() => {
    if (show && current === recordIdx && recordings.length > 0) {
      soundManager.playGroup('felvetelBemutato', { once: true });
      setCurrent((i) => i + 1);
    }
  }, [recordings.length, show, current, recordIdx, setCurrent]);

  // (1) re-center on show/current/viewport change
  useLayoutEffect(() => {
    if (!show) return;
    const { selector } = helpItems[current];
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      el.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [show, current, windowSize.width, windowSize.height]);

  // disable scroll
  useEffect(() => {
    if (!show) return;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [show]);

  // compute hole — now also on orientationchange
  useLayoutEffect(() => {
    if (!show) return;
    const update = () => {
      const W = window.innerWidth,
        H = window.innerHeight;
      const { selector, config } = helpItems[current];
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const topClip = r.top + config.clipPathAdjustments.top;
      const bottomClip = r.bottom + config.clipPathAdjustments.bottom;
      const leftClip = r.left + config.clipPathAdjustments.left;
      const rightClip = r.right + config.clipPathAdjustments.right;
      setClipPath(
        `polygon(
          0 0, ${W}px 0, ${W}px ${H}px, 0 ${H}px,
          0 ${bottomClip}px,
          ${rightClip}px ${bottomClip}px,
          ${rightClip}px ${topClip}px,
          ${leftClip}px ${topClip}px,
          ${leftClip}px ${bottomClip}px,
          0 ${bottomClip}px
        )`.replace(/\s+/g, ' ')
      );
    };
    requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.addEventListener('scroll', update, { passive: false });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('scroll', update);
    };
  }, [show, current]);

  // position & clamp tooltip _inside_ #practice-content — also on orientationchange
  useLayoutEffect(() => {
    if (!show) return;
    const container = document.getElementById('practice-content');
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    const updateTip = () => {
      const { selector, config } = helpItems[current];
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      const r = el.getBoundingClientRect();
      let rawLeft = r.left + toPx(config.tooltipPosition.left);
      let rawTop = r.top + toPx(config.tooltipPosition.top);

      if (tooltipRef.current) {
        const tipW = tooltipRef.current.offsetWidth;
        const tipH = tooltipRef.current.offsetHeight;

        // for the final tooltip, clamp to viewport
        if (current === lastIdx) {
          rawLeft = Math.min(Math.max(rawLeft), window.innerWidth - tipW);
          rawTop = Math.min(Math.max(rawTop), window.innerHeight - tipH);
        } else {
          // clamp inside the container for all other tips
          rawLeft = Math.max(cRect.left, Math.min(rawLeft, cRect.right - tipW));
          rawTop = Math.max(cRect.top, Math.min(rawTop, cRect.bottom - tipH));
        }
      }
      setTooltipPos({ left: rawLeft, top: rawTop });
    };

    requestAnimationFrame(updateTip);
    window.addEventListener('resize', updateTip);
    window.addEventListener('orientationchange', updateTip);
    window.addEventListener('scroll', updateTip, { passive: false });
    return () => {
      window.removeEventListener('resize', updateTip);
      window.removeEventListener('orientationchange', updateTip);
      window.removeEventListener('scroll', updateTip);
    };
  }, [show, current, lastIdx]);

  if (!show) return null;
  const item = helpItems[idx];
  const isRecordStep = idx === recordIdx;
  const isLastStep = idx === lastIdx;

  return (
    <>
      <Box
        position="fixed"
        overflowX="hidden"
        top="0"
        left="0"
        width="100%"
        height="100vh"
        bg="rgba(0,0,0,0.5)"
        clipPath={clipPath}
        zIndex={500}
        pointerEvents="auto"
        touchAction="none"
        overscrollBehavior="none"
      />
      <Box
        ref={tooltipRef}
        position="fixed"
        top={`${tooltipPos.top}px`}
        left={`${tooltipPos.left}px`}
        right="8px"
        bg="brand.200"
        color="white"
        p={{ base: 3, md: 6 }}
        borderRadius="md"
        boxShadow="0 2px 8px rgba(0,0,0,0.2)"
        maxW={{ base: '80vw', md: '400px' }}
        fontSize={{ base: 'sm', md: 'lg' }}
        whiteSpace="normal"
        zIndex={502}
      >
        <Text mb={4}>{item.text}</Text>
        <Box display="flex" justifyContent="center">
          <PurpleButton
            size="sm"
            onClick={() => {
              if (isLastStep) {
                onClose();
              } else if (current === recordIdx) {
                // skip record → keyboard
                setCurrent(current + 2);
              } else {
                setCurrent(current + 1);
              }
            }}
          >
            {current === lastIdx ? 'Bezárás' : 'Tovább'}
          </PurpleButton>
        </Box>
      </Box>
    </>
  );
}
