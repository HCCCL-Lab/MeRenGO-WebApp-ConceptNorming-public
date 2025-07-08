'use client';

import { Box, Text, Flex, Image, Link } from '@chakra-ui/react';
import DashboardBar from '@/components/bars/DashboardBar';
import GhostButton from '@/components/buttons/GhostButton';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ScrollableBackground from '@/components/ScrollableBackground';

export default function OverloadPage() {
  const router = useRouter();
  const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

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

  return (
    <>
      {/* Back Button */}
      <Flex
        alignItems="center"
        px={4}
        mt="8"
        mb="-8"
        marginLeft={{
          base: '0',
          sm: '8vw',
          md: '15vw',
          lg: '25vw',
          xl: '30vw',
        }}
        zIndex={20}
      >
        <GhostButton
          onClick={() => router.push('/experimenter')}
          variant="ghost"
          display="inline-flex"
          alignItems="center"
          p={0}
          minW="auto"
          mr={0}
          zIndex={2}
        >
          <FiArrowLeft size={32} />
        </GhostButton>
      </Flex>
      {/* Main Content */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="center"
        align="center"
        h="100vh"
        position="relative"
        bg="transparent"
        ref={scrollableContainerRef}
      >
        {/* Main Content Box */}
        <Box
          position="relative"
          bgColor="brand.100"
          py="8"
          px="4"
          rounded="lg"
          shadow="lg"
          w="90%"
          maxW="500px"
          display="flex"
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          zIndex={1}
          mt="-80"
        >
          {/* Message */}
          <Text
            textAlign="center"
            fontSize={['lg', '3xl']}
            fontWeight="bold"
            lineHeight="relaxed"
          >
            Sajnos most nagyon elfoglalt vagyok. Kérlek próbálj meg később
            meglátogatni!
          </Text>
        </Box>
      </Flex>
    </>
  );
}
