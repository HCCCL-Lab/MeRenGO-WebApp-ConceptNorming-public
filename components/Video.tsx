'use client';

import { Box } from '@chakra-ui/react';

interface YouTubeEmbedProps {
  videoId: string;
}

const Video: React.FC<YouTubeEmbedProps> = ({ videoId }) => {
  const url = `https://www.youtube.com/embed/${videoId}`;

  return (
    <Box
      className="youtube-embed"
      rounded="md"
      width="90%"
      position="relative"
      paddingBottom="50.6%"
      overflow="hidden"
      shadow="2px 2px 10px 4px rgba(70, 70, 70, 0.3)"
      m="auto"
    >
      <iframe
        width="100%"
        height="100%"
        src={url}
        title="Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      ></iframe>
    </Box>
  );
};

export default Video;
