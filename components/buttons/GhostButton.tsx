import { Button, ButtonProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

type GhostButtonProps = Omit<ButtonProps, 'css'> & {
  children: ReactNode;
};

// Tertiary ghost button
export default function GhostButton({ children, ...props }: GhostButtonProps) {
  return (
    <Button
      color="brand.700"
      variant="ghost"
      fontSize="md"
      _hover={{
        color: 'brand.300',
        bg: 'transparent',
      }}
      _active={{ color: 'brand.600' }}
      fontWeight="extrabold"
      {...props}
    >
      {children}
    </Button>
  );
}
