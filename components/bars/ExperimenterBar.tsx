'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiLogIn } from 'react-icons/fi';
import { FaBars, FaHome } from 'react-icons/fa';
import {
  Box,
  Flex,
  Button,
  IconButton,
  VStack,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { IoHome, IoInformationCircleOutline } from 'react-icons/io5';
import { MdManageAccounts } from 'react-icons/md';
import { BiHappyHeartEyes } from 'react-icons/bi';
import { useLogout } from '@/hooks/useLogout';
import { motion } from 'framer-motion';
import { Ribeye_Marrow } from 'next/font/google';

const ribeye_marrow = Ribeye_Marrow({
  subsets: ['latin'],
  weight: '400',
});

export default function DashboardBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const menuRef = useRef<HTMLDivElement>(null);
  const [buttonWidths, setButtonWidths] = useState<Record<string, number>>({});

  // Toggle the menu open/close state
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const { logout } = useLogout();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Determine if the current path is active
  const isActive = (path: string) => pathname.endsWith(path);

  // Capture button widths dynamically
  useEffect(() => {
    const buttons = ['GameButton', 'ProfileButton', 'AboutButton'];
    const widths: Record<string, number> = {};
    buttons.forEach((id) => {
      const button = document.getElementById(id);
      if (button) {
        widths[id] = button.offsetWidth;
      }
    });
    setButtonWidths(widths);
  }, [pathname]);

  // Handle loading state for mobile view
  const [loaded, setLoaded] = useState<Boolean>(false);
  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setLoaded(true);
    }
  }, [isMobile]);

  // Default button properties
  const defaultButtonProps = {
    color: 'black',
    fontWeight: 'bold',
    variant: 'ghost' as const,
    _hover: { color: 'brand.700', bgColor: 'brand.100' },
    fontSize: '1rem',
  };

  // Define roll-out animation for the menu
  const rollOutAnimation = {
    hidden: { transform: 'translateY(-100%)' },
    visible: {
      transform: 'translateY(0)',
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  // Define backdrop animation
  const backdropAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0, ease: 'easeOut' },
    },
  };

  if (isMobile && loaded) {
    return (
      <>
        <Box ref={menuRef} position="fixed" zIndex={100}>
          {/* Menu button for mobile view */}
          <IconButton
            aria-label="Open menu"
            onClick={toggleMenu}
            bg="transparent"
            fontSize="24px"
            position="fixed"
            height="3rem"
            top="8px"
            right="10px"
            zIndex={1002}
            _hover={{ color: 'black' }}
            _icon={{ color: 'black' }}
          >
            {<FaBars />}
          </IconButton>
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            height="4rem"
            bg="brand.100"
            zIndex={1001}
          >
            <Box
              height="100%"
              position="absolute"
              top="-1"
              className={ribeye_marrow.className}
            ></Box>
          </Box>
          {isMenuOpen && (
            <Box width="100vw">
              {/* Animated menu */}
              <motion.div
                variants={rollOutAnimation}
                initial="hidden"
                animate="visible"
                style={{
                  position: 'fixed',
                  top: '0',
                  left: '0',
                  right: '0',
                  zIndex: 1000,
                }}
              ></motion.div>
              <motion.div
                variants={rollOutAnimation}
                initial="hidden"
                animate="visible"
                style={{
                  position: 'absolute',
                  top: '4rem',
                  left: '0',
                  right: '0',
                  zIndex: 1000,
                }}
              >
                <Box bg="brand.100" boxShadow="xl" zIndex={999}>
                  <VStack gap={0}>
                    <VStack gap={0} borderBottom="1px solid">
                      {/* Menu items */}
                      {[
                        {
                          href: '/experimenter',
                          icon: <IoHome />,
                          label: 'Kezdőlap',
                        },
                        {
                          href: '/experimenter/about',
                          icon: <IoInformationCircleOutline />,
                          label: 'Rólunk',
                        },
                      ].map(({ href, icon, label }) => (
                        <Link key={href} href={href} onClick={closeMenu}>
                          <Box rounded="xl">
                            <Button
                              width="100vw"
                              rounded="none"
                              height="12"
                              borderX="none"
                              borderTop="1px solid"
                              borderColor="brand.700"
                              borderBottom="none"
                              {...defaultButtonProps}
                              color={isActive(href) ? 'white' : 'black'}
                              bgColor={
                                isActive(href) ? 'brand.700' : 'brand.100'
                              }
                              _hover={{
                                color: isActive(href) ? 'white' : 'black',
                                bgColor: isActive(href)
                                  ? 'brand.700'
                                  : 'brand.200',
                              }}
                            >
                              {icon}
                              {label}
                            </Button>
                          </Box>
                        </Link>
                      ))}
                    </VStack>

                    <Box>
                      <Button
                        {...defaultButtonProps}
                        bgColor="white"
                        marginTop="40"
                        marginBottom="10"
                        height="12"
                        borderColor="brand.700"
                        width="80vw"
                        _hover={{
                          color: 'black',
                          bgColor: 'gray.300',
                        }}
                        onClick={() => {
                          closeMenu();
                          logout();
                        }}
                      >
                        <FiLogIn />
                        Kijelentkezés
                      </Button>
                    </Box>
                  </VStack>
                </Box>
              </motion.div>

              {/* Animated grey blur backdrop */}
              <motion.div
                variants={backdropAnimation}
                initial="hidden"
                animate="visible"
                onClick={toggleMenu}
              >
                <Box
                  style={{
                    position: 'absolute',
                    top: '10vh',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    zIndex: 999,
                    backdropFilter: 'blur(3px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fallback color if backdrop-filter doesn't work
                    WebkitBackdropFilter: 'blur(3px)', // Safari support
                  }}
                ></Box>
              </motion.div>
            </Box>
          )}
          {/* Logo button */}
          <Box
            height="100%"
            width={'fit-content'}
            position="relative"
            className={ribeye_marrow.className}
            top="1rem"
            zIndex={1003}
          >
            <Link href="/experimenter">
              <Button
                {...defaultButtonProps}
                id="HomeButton"
                height="100%"
                size="2xl"
                fontSize="2xl"
                _hover={{ background: 'transparent', color: 'brand.600' }}
              >
                MRnGO
              </Button>
            </Link>
          </Box>
        </Box>
        <Box height="4vh" bg="transparent" />
      </>
    );
  }

  if (!isMobile) {
    return (
      <Flex
        as="nav"
        bg="brand.100"
        py={2.5}
        px={8}
        alignItems="center"
        justifyContent="flex-end"
        gap={6}
        height="fit-content"
        minWidth="100%"
        position="sticky"
        top="0"
        left="0"
        zIndex="1000"
      >
        {/* Logo button */}
        <Box position="absolute" left="3" className={ribeye_marrow.className}>
          <Link href="/experimenter">
            <Button
              {...defaultButtonProps}
              id="HomeButton"
              height="100%"
              size="2xl"
              fontSize="2xl"
              _hover={{ background: 'transparent', color: 'brand.600' }}
            >
              MRnGO
            </Button>
          </Link>
        </Box>

        {/* Navigation buttons */}
        <Box height="100%">
          <Box
            bg={isActive('/experimenter/game') ? 'black' : 'transparent'}
            height="2px"
            width={
              isActive('/experimenter/game')
                ? `${buttonWidths['GameButton']}px`
                : '0px'
            }
            mt="0.8rem"
            mb="-0.9rem"
            transition="width 0.2s ease"
          />
        </Box>

        <Box height="100%">
          <Link href="/experimenter/about">
            <Button
              {...defaultButtonProps}
              id="AboutButton"
              height="100%" // Make the button take up the full height of the Box
            >
              <IoInformationCircleOutline />
              Rólunk
            </Button>
          </Link>
          <Box
            bg={isActive('/experimenter/about') ? 'black' : 'transparent'}
            height="2px"
            width={
              isActive('/experimenter/about')
                ? `${buttonWidths['AboutButton']}px`
                : '0px'
            }
            mt="0.8rem"
            mb="-0.9rem"
            transition="width 0.2s ease"
          />
        </Box>
        <Box height="100%">
          <Button
            {...defaultButtonProps}
            height="100%" // Make the button take up the full height of the Box
            onClick={logout}
            mt="0.4rem"
            mb="0.2rem"
          >
            <FiLogIn />
            Kijelentkezés
          </Button>
          <Box height="2px" width="0px" /> {/* Consistent height */}
        </Box>
      </Flex>
    );
  }
  return <></>;
}
