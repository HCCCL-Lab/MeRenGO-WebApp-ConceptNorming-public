import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

interface ScrollableBackgroundProps {
  scrollContainerRef: React.RefObject<HTMLElement>;
}

const ScrollableBackground: React.FC<ScrollableBackgroundProps> = ({
  scrollContainerRef,
}) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollY(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={0}
      pointerEvents="none"
      backgroundImage="url('/cloudbackground.svg')"
      backgroundRepeat="repeat-y"
      backgroundPosition={`center -${scrollY * 0.33}px`}
      backgroundSize="cover"
    />
  );
};

export default ScrollableBackground;
