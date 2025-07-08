import { Button, ButtonProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

type PurpleButtonProps = Omit<ButtonProps, 'css'> & {
  children: ReactNode;
};

// Primary purple button
export default function PurpleButton({
  children,
  ...props
}: PurpleButtonProps) {
  return (
    <Button
      bgColor="brand.700"
      height="10"
      maxWidth="300px"
      borderColor="brand.700"
      color="white"
      fontSize="md"
      fontWeight="extrabold"
      _hover={{ bgColor: 'brand.600', borderColor: 'brand.600' }}
      {...props}
    >
      {children}
    </Button>
  );
}
