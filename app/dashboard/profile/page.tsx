'use client';

import { Flex, Spinner } from '@chakra-ui/react';

export default function DefaultProfilePage() {
  return (
    <Flex
      id="profile-main"
      minW="100vw"
      direction="column"
      align="center"
      textAlign="center"
    >
      <Spinner color="black" mx="auto" size="xl" mt="40" />
    </Flex>
  );
}
