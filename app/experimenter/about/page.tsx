"use client";

import Image from "next/image";
import { useExperimenterCheck } from "../../../hooks/useExperimenterCheck";
import { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Heading,
  Input,
  Textarea,
  Container,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import DashboardBar from "@/components/bars/DashboardBar";
import ExperimenterBar from "@/components/bars/ExperimenterBar";
import PurpleButton from "@/components/buttons/PurpleButton";
import { doc, setDoc } from "firebase/firestore";
import { firestoredb } from "@/app/api/firebase";
import StatusMessage from "@/components/StatusMessage";

export default function HelpPage() {
  const { isCheckingExperimenter, experimenterLoading } =
    useExperimenterCheck();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  const textBoxRef = useRef<HTMLDivElement>(null);
  const [isStacked, setIsStacked] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      if (textBoxRef.current) {
        setIsStacked(textBoxRef.current.offsetWidth < 650);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  function generateRandomNumber(length: number = 16): string {
    const chars = "0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const issueID = generateRandomNumber();
    const now = new Date();
    try {
      await setDoc(doc(firestoredb, "contact", `SUPPORT_${issueID}`), {
        ...formData,
        name: formData.name,
        email: formData.email,
        message: formData.message,
        date: now.toLocaleString(),
      });
    } catch (error) {
      console.error("Error:", error);
    }
    setFormData({
      name: "",
      email: "",
      message: "",
    });
    setShowStatusMessage(true);
    setTimeout(() => {
      setShowStatusMessage(false);
    }, 3500);
  };

  if (experimenterLoading || isCheckingExperimenter) {
    return (
      <>
        <Flex
          bg="white"
          minH="100vh"
          minW="100vw"
          direction="column"
          align="center"
          textAlign="center"
        >
          <Spinner color="black" m="auto" size="xl" />
        </Flex>
      </>
    );
  }

  return (
    <>
      <StatusMessage show={showStatusMessage} top="-100px">
        <Box
          display="flex"
          flexDirection="column"
          textAlign="center"
          justifyContent="center"
        >
          <h2 style={{ fontWeight: "bold" }}>Üzenet elküldve!</h2>
          <p>A választ hamarosan elküldjük a megadott email címre.</p>
        </Box>
      </StatusMessage>
      <Box bg="white" h={["100vh", "100vh", "94vh"]}>
        <Box
          as="main"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          height="100%"
          overflowY="auto"
          minHeight="100%"
        >
          {/* Website Description */}
          <Box
            as="section"
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={8}
            bg="white"
            backdropFilter="blur(10px)"
          >
            <Heading size="xl" mb={4}>
              A MERENGŐ Webapp-ról
            </Heading>
            <Text fontSize="lg" color="gray.700" mb={2}>
              A webapp célja az első magyar jellemző-alapú fogalmi norma
              létrehozása, kutatási célra jött létre.
            </Text>
            <Text fontSize="lg" color="gray.700">
              Köszönjük, hogy részt vesznek a megalkotásában!
            </Text>
          </Box>

          {/* Image and Description of Research */}
          <Box
            as="section"
            display="flex"
            flexDirection={["column", "row"]}
            justifyContent="center"
            alignItems="center"
            gap={6}
            p={8}
            backdropFilter="blur(10px)"
            brightness="100"
          >
            <Image
              src="/scanner.webp"
              alt="lab"
              width={250}
              height={250}
              className="rounded-lg"
            />
            <Box
              width={["100%", "66%"]}
              p={6}
              bg="white"
              backdropFilter="blur(10px)"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Heading size="lg" color="black" mb={2}>
                A MERENGŐ kutatásról
              </Heading>
              <Text fontSize="lg" color="gray.600" mb={2}>
                Kutatásunkban 6-10 éves gyermekek fogalmi tudás-szerveződésének
                érését vizsgáljuk, ennek első lépése egy fogalmi norma
                megalkotása. A norma alapján további kutatást végzünk fMRI
                képalkotó eljárással, ami agyi felvételeket készítve pontosabb
                képet adhat a gyermekek fogalmi világának agyi leképződéséről.
              </Text>
              <Text fontSize="lg" color="gray.600">
                A kutatást a Hippocampal Circuit and Code for Cognition Lab
                (HCCCL) végzi, látogass el{" "}
                <a
                  href="https://www.attilakeresztes.com/#home"
                  style={{ color: "#1a202c", textDecoration: "underline" }}
                >
                  weboldalunkra
                </a>{" "}
                további információkért.
              </Text>
            </Box>
          </Box>

          {/* FAQ Section */}
          <Box
            as="section"
            display="flex"
            flexDirection={["column", "row"]}
            justifyContent="space-between"
            alignItems="start"
            p={8}
            backdropFilter="blur(10px)"
            brightness="100"
          >
            <Box
              width={["100%", "66%"]}
              p={6}
              bg="white"
              backdropFilter="blur(10px)"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Heading size="lg" mb={4}>
                GYIK (Gyakran Ismételt Kérdések)
              </Heading>
              <Box mb={6}>
                <Heading size="md" fontWeight="semibold">
                  Hány fogalomra kell választ adni?
                </Heading>
                <Text>
                  Nincs megkötve. A játék bármeddig játszható, amíg azt Önök
                  élvezetesnek tartják.
                </Text>
              </Box>
              <Box mb={6}>
                <Heading size="md" fontWeight="semibold">
                  Van-e jó válasz?
                </Heading>
                <Text>
                  Nincs, mindenképpen a gyermek saját válaszára vagyunk
                  kíváncsiak.
                </Text>
              </Box>
              <Box>
                <Heading size="md" fontWeight="semibold">
                  Kapunk-e visszajelzést a gyermek teljesítményéről?
                </Heading>
                <Text>
                  Egyéni szinten nem áll módunkban visszajelzést adni, de a
                  csoportszintű eredményeket a regisztrált email címre elküldjük
                  a kutatás lezárultával.
                </Text>
              </Box>
            </Box>

            {/* Image on the Right without Backdrop */}
            <Box width={["100%", "33%"]} mt={[6, 0]} ml={[0, 8]}>
              <Image
                src="/lab.png"
                alt="laboroskép"
                width={300}
                height={300}
                className="rounded-lg object-cover shadow-lg"
              />
            </Box>
          </Box>

          {/* Help Form */}
          <Box
            as="section"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            w="full"
            p={8}
            bg="white"
            backdropFilter="blur(10px)"
          >
            <Heading size="lg" fontWeight="bold" mb={4}>
              Szükséged van segítségre?
            </Heading>
            {submitted ? (
              <Text color="green.600">Sikeresen elküldted az üzeneted!</Text>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ width: "100%", maxWidth: "600px" }}
              >
                <FormControl mb={4}>
                  <FormLabel htmlFor="name" fontSize="sm">
                    Név:
                  </FormLabel>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    borderColor="gray.300"
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel htmlFor="email" fontSize="sm">
                    Email:
                  </FormLabel>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    borderColor="gray.300"
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel htmlFor="message" fontSize="sm">
                    Kérdés vagy üzenet:
                  </FormLabel>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    borderColor="gray.300"
                    rows={4}
                  />
                </FormControl>
                <PurpleButton
                  type="submit"
                  size="lg"
                  maxWidth="full"
                  width="full"
                >
                  Küldés
                </PurpleButton>
              </form>
            )}
          </Box>

          <Box
            as="footer"
            bg="white"
            backdropFilter="blur(10px)"
            w="full"
            pb={5}
            mt={8}
          >
            <Container
              maxW="container.lg"
              display="flex"
              flexDirection={["column", "row"]}
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Contact Information */}
              <Box textAlign={["center", "left"]} mb="12vh">
                <Text fontSize="lg" fontWeight="semibold">
                  Kapcsolat
                </Text>
                <Text color="gray.700">
                  1117 Budapest, Magyar tudósok körútja 2.
                </Text>
                <Text color="gray.700">Email: merengo@ttk.hu</Text>
                <Text color="gray.700">Telefon: +36 1 3826-903</Text>
              </Box>

              {/* Logok */}
              <Box
                display="flex"
                flexDirection={["column", "row"]}
                justifyContent="center"
                alignItems="center"
                gap={6}
                maxW={"vw"}
                mb="12vh"
                textAlign="center"
              >
                <Image
                  src="/hcccl_logo.png"
                  alt="Logo 1"
                  width={100}
                  height={50}
                  className="object-contain"
                />
                <Image
                  src="/hunrenttk_logo.png"
                  alt="Logo 2"
                  width={250}
                  height={30}
                  className="object-contain"
                />
              </Box>
            </Container>
          </Box>
        </Box>
      </Box>
    </>
  );
}
