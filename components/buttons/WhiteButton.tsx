import { Button, ButtonProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

type WhiteButtonProps = Omit<ButtonProps, 'css'> & {
  children: ReactNode;
};

// Secondary white button
export default function WhiteButton({ children, ...props }: WhiteButtonProps) {
  return (
    <Button
      bgColor="white"
      height="10"
      maxWidth="300px"
      borderColor="brand.700"
      color="brand.700"
      fontSize="md"
      fontWeight="extrabold"
      _hover={{
        color: 'black',
        bgColor: 'gray.300',
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
