'use client';

import { useEffect, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { select } from '@nextui-org/react';
import { text } from 'stream/consumers';

const helpItems = [
  {
    id: 'sun-icon',
    selector: '#sun-icon',
    text: 'Egy nap 10 fogalom megtanítására van lehetőség, mielőtt Mimó elfárad. Azonban nem szükséges mind a 10 fogalmat megtanítani.',
    position: 'bottom',
  },
  {
    id: 'record-button',
    selector: '#record-button',
    text: 'A gombbal felveheti gyermeke válaszait. Adatfelvételünkhöz legalább öt, legfeljebb 15 tulajdonság megnevezését várjuk.',
    alternativeText: 'Ezekbe a mezőkbe gépelheti be gyermeke válaszait.',
    position: 'right',
  },
  {
    id: 'next-questions',
    selector: '#next-questions',
    text: 'Néhány további kérdéssel segítjük a válaszadást. Nem szükséges mindegyiket felolvasni, ha már válaszolt a gyermek.',
    position: 'left',
  },
  {
    id: 'keyboard-toggle',
    selector: '#keyboard-toggle',
    text: 'Áttérhetnek billentyűzetre, ha nem kényelmes felvenni a gyermek hangját.',
    alternativeText:
      'Visszatérhetnek a hangfelvételhez, ha van lehetőségük rá.',
    position: 'right',
  },
  {
    id: 'unknown-word',
    selector: '#unknown-word',
    text: 'Amennyiben gyermeke nem ismeri a fogalmat, kihagyhatják azt.',
    position: 'left',
  },
  {
    id: 'questions-button',
    selector: '#questions-button',
    text: 'A gomb segítségével megnézheti Mimó leggyakoribb kérdéseit, amely segíthet gyermeke válaszadásában.',
    position: 'right',
  }
];

export default function OverlayHelp({
  mode,
  closeOverlay,
}: {
  mode: 'voice' | 'text';
  closeOverlay: () => void;
}) {
  const [positions, setPositions] = useState<
    {
      id: string;
      top: number;
      left: number;
      position: string;
      visible: boolean;
    }[]
  >([]);

  useEffect(() => {
    const updatePositions = () => {
      const newPositions = helpItems
        .map(({ id, selector, position }) => {
          const element = document.querySelector(selector);
          if (!element) return null;

          const rect = element.getBoundingClientRect();
          const tooltipWidth = 250;
          const tooltipHeight = 50;
          const spacing = 10; // Space between tooltip and element

          let top = rect.top + spacing;
          let left = rect.left + spacing;
          let visible = rect.bottom > 0 && rect.top < window.innerHeight;

          switch (position) {
            case 'bottom':
              top = rect.bottom + spacing;
              left = rect.left + rect.width / 2;
              break;
            case 'right':
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.right + spacing;
              break;
            case 'left':
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.left - tooltipWidth - spacing;
              break;
          }

          // Ensure tooltip stays within viewport
          if (top + tooltipHeight > window.innerHeight) {
            top = window.innerHeight - tooltipHeight - 10;
          }
          if (top < 0) {
            top = 10;
          }
          if (left + tooltipWidth > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - 10;
          }
          if (left < 0) {
            left = 10;
          }

          return { id, top, left, position, visible };
        })
        .filter(Boolean) as {
        id: string;
        top: number;
        left: number;
        position: string;
        visible: boolean;
      }[];

      setPositions(newPositions);
    };

    // Run on mount & every scroll
    const container = document.getElementById('content');

    updatePositions();
    container?.addEventListener('scroll', updatePositions, { passive: true });
    window.addEventListener('resize', updatePositions);

    return () => {
      container?.removeEventListener('scroll', updatePositions);
      window.removeEventListener('resize', updatePositions);
    };
  }, []);

  return (
    <>
      {/* Dimmed background overlay: allows scroll through */}
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100vh"
        background="rgba(0, 0, 0, 0.5)"
        zIndex="999"
        pointerEvents="none"
      />

      {/* Tooltips (also clickable to close) */}
      {positions.map(({ id, top, left, position, visible }) => {
        const helpItem = helpItems.find((item) => item.id === id);
        if (!helpItem || !visible) return null;

        return (
          <Box
            key={id}
            position="fixed"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              transform: position === 'bottom' ? 'translateX(-50%)' : 'none',
            }}
            background="white"
            color="black"
            padding="10px"
            borderRadius="8px"
            boxShadow="md"
            maxWidth="250px"
            fontSize="sm"
            zIndex="1001"
            textAlign="center"
          >
            <Text>
              {id === 'record-button' && mode === 'text'
                ? helpItem.alternativeText
                : id === 'keyboard-toggle' && mode === 'text'
                ? helpItem.alternativeText
                : helpItem.text}
            </Text>
          </Box>
        );
      })}
    </>
  );
}
