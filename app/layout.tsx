'use client';

import { Kumbh_Sans } from 'next/font/google';
import { Provider } from '@/components/ui/provider';
import ScrollableBackground from '@/components/ScrollableBackground';
import { Box, Image } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import DashboardBar from '@/components/bars/DashboardBar';
import ExperimenterBar from '@/components/bars/ExperimenterBar';
import PageBar from '@/components/bars/PageBar';
import { useMemo } from 'react';

const kumbh_sans = Kumbh_Sans({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure total content height for scrollable background
  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [contentRef.current?.scrollHeight]);

  const MOBILE_BAR_HEIGHT = 64; // 4rem
  const pageBarRef = useRef<HTMLDivElement | null>(null);
  const [pageBarHeight, setPageBarHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Watch for screen size changes
  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  // Watch PageBar height
  useEffect(() => {
    if (!pageBarRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setPageBarHeight(entry.contentRect.height);
    });

    observer.observe(pageBarRef.current);
    return () => observer.disconnect();
  }, []);

  const pathname = usePathname();

  const NavigationBar = useMemo(() => {
    if (pathname.startsWith('/dashboard')) {
      const mode = pathname === '/dashboard/game' ? 'voice' : undefined;
      return <DashboardBar mode={mode} />;
    } else if (pathname.startsWith('/experimenter')) {
      return <ExperimenterBar />;
    } else {
      return <PageBar />;
    }
  }, [pathname]);

  return (
    <html lang="hu" className={kumbh_sans.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>MeReNGŐ</title>
      </head>
      <body>
        <Provider>
          <Global
            styles={`
              html, body {
                margin: 0;
                padding: 0;
                width: 100dvw;
                max-width: 100dvw;
                height: 100dvh;
                overflow: hidden;
              }

              *, *::before, *::after {
                box-sizing: border-box;
              }
            `}
          />
          <Box ref={contentRef} id="content-ref" h="100dvh">
            {/* 📌 Sticky PageBar */}
            <Box ref={pageBarRef} position="sticky" top="0" zIndex={1000} id="navbar" h="${navbarHeight}">
              {NavigationBar}
            </Box> 

            {/* Spacer that fills the rest of the mobile navbar's space */}
            {isMobile && pageBarHeight < MOBILE_BAR_HEIGHT && (
              <Box height={`${MOBILE_BAR_HEIGHT - pageBarHeight}px`} />
            )}

            {/* 🧱 Fixed Background Decorations */}
            <Box zIndex={0} pointerEvents="none" position="relative" id="backgrounds">
              <Image position="fixed" top="12" src="/crystals.png" opacity="0.7" height="12vh" zIndex={1} alt="crystals" />
              <Image position="fixed" bottom="32" src="/crystals.png" opacity="1" height="12vh" zIndex={1} alt="crystals" />
              <Image position="fixed" bottom="-20" right="-40" src="/mushroomsright.svg" opacity="1" height="auto" zIndex={1} alt="mushrooms" />
              <Image position="fixed" bottom="-20" left="-40" src="/mushroomsleft.svg" opacity="1" height="auto" zIndex={1} alt="mushrooms" />
              <Box
                position="fixed"
                bottom="0"
                width="100vw"
                minH="180px"
                bgImage="url('/grass.svg')"
                bgRepeat="repeat-x"
                bgSize="auto 100%"
                opacity="0.4"
                zIndex={1}
              />
              <ScrollableBackground scrollContainerRef={scrollableContainerRef} />
            </Box>

            {/* 📜 Scrollable Main Content */}
            <Box
              ref={scrollableContainerRef}
              overflowY="auto"
              overflowX="hidden"
              width="100vw"
              maxW="100vw"
              height={`calc(100dvh - ${isMobile ? MOBILE_BAR_HEIGHT : pageBarHeight}px)`}// 🧠 Dynamic offset
              zIndex={1}
              id="scrollable-content"
            >
              {children}
            </Box>
          </Box>
        </Provider>
      </body>
    </html>
  );
}
