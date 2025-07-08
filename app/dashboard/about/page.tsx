"use client";

import Image from "next/image";
import { useAuthCheck } from "../../../hooks/useAuthCheck";
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
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
import PurpleButton from "@/components/buttons/PurpleButton";
import { doc, setDoc } from "firebase/firestore";
import { firestoredb } from "@/app/api/firebase";
import StatusMessage from "@/components/StatusMessage";

export default function HelpPage() {
  const { isCheckingAuth, authLoading } = useAuthCheck();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const textBoxRef = useRef<HTMLDivElement>(null);
  const [isStacked, setIsStacked] = useState(false);
  const [showStatusMessage, setShowStatusMessage] = useState(false);

  useEffect(() => {
    if (!authLoading && !isCheckingAuth) {
      const updateLayout = () => {
        if (textBoxRef.current) {
          setIsStacked(textBoxRef.current.offsetWidth < 650);
        }
      };

      updateLayout();
      window.addEventListener("resize", updateLayout);
      return () => window.removeEventListener("resize", updateLayout);
    }
  }, [authLoading, isCheckingAuth]);

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

  if (authLoading || isCheckingAuth) {
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
      <Box>
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
        <Box
          as="main"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          overflowY="auto"
          backdropFilter="blur(10px)"
        >
          {/* Website Description */}
          <Box
            as="section"
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={8}
          >
            <Heading size="xl" mb={4} mt={4}>
              Örülünk, hogy szeretne megtudni többet kutatásunkról!
            </Heading>
            <Text fontSize="lg" color="gray.700" mb={2} textAlign="center">
              Kutatásunk célja, hogy elsőként feltárjuk hogyan gondolkodnak a
              magyar 6-8 éves gyermekek a világ hétköznapi dolgairól.
            </Text>
            <Text fontSize="lg" color="gray.700">
              Köszönjük, hogy részt vesznek a megalkotásában!
            </Text>
          </Box>

          {/* Website Description */}
          <Box
            as="section"
            display="flex"
            flexDirection={["column-reverse", "row"]}
            justifyContent="center"
            alignItems="center"
            gap={6}
            p={8}
            mx="auto" // Center the section horizontally
            backdropFilter="blur(10px)"
            brightness="100"
          >
            <Box
              width={["100%", "60%"]}
              p={6}
              bg="white"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Heading size="lg" mb={4}>
                A MERENGŐ web-alkalmazásról
              </Heading>
              <Box mb={6}>
                <Text color="gray.600">
                  Alkalmazásunk a MERENGŐ kutatási projekt segédeszköze, amely
                  segít feltárni, hogy a 6-8 éves gyermekek a gondolkodásuk
                  során milyen jellemzőket kapcsolnak egyes fogalmakhoz. A
                  gyermekek játékos feladat során adott válaszaiból
                  kutatócsoportunk egy gyermeki “fogalmi térképet” hoz majd
                  létre (szakszóval “jellemző-alapú fogalmi normát”). Ilyen
                  fogalmi normát gyermekek körében Magyarországon elsőként a mi
                  kutatócsoportunk készít.
                </Text>
                <Text color="gray.600">
                  Köszönjük, hogy részt vesznek a fogalmi norma megalkotásában,
                  és hogy ezzel hozzájárulnak a tudomány fejlődéséhez!
                </Text>
              </Box>
            </Box>

            {/* Image on the Right without Backdrop */}
            <Box
              width={["100%", "33%"]}
              mt={[6, 0]}
              ml={[0, 8]}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Image
                src="/mimo-frontal.png"
                alt="mimó"
                width={150}
                height={150}
                className="rounded-lg object-cover shadow-lg"
              />
            </Box>
          </Box>

          {/* Image & Research Description (Dynamic Layout) */}
          <Box
            as="section"
            display="flex"
            flexDirection={isStacked ? "column" : "row-reverse"}
            justifyContent="center"
            alignItems="center"
            gap={6}
            p={8}
          >
            {/* Move Image Above Text If Stacked */}
            {isStacked && (
              <Image
                src="/lab.png"
                alt="lab"
                width={500}
                height={500}
                className="rounded-lg"
              />
            )}

            {/* Research Description Box */}
            <Box
              ref={textBoxRef}
              width={["100%", "66%"]}
              p={6}
              bg="white"
              borderRadius="lg"
              boxShadow="lg"
            >
              <Heading size="lg" color="black" mb={2}>
                A kutatócsoportunkról
              </Heading>
              <Text color="gray.600" mb={2}>
                A kutatást a Hippocampal Circuit and Code for Cognition
                (Hippokampális Hálózat és Kód a Kogníció Szolgálatában) Labor
                (HCCCL) végzi, mely a berlini Max Planck Institute for Human
                Development kutatóintézet partnercsoportját képezi a HUN-REN
                Természettudományi Kutatóközpontban 2018 óta.
                Kutatócsoportunkban az emberi emlékezet egész életen át tartó
                fejlődését és az ezzel kapcsolatos agyi változásokat vizsgáljuk
                több korosztályon átívelve.
              </Text>
              <Text color="gray.600" mb={2}>
                Az emlékezetünk működésének javarészéért egy mindössze 4-5
                centiméteres agyterület, a hippokampusz felel, amely nevét a
                “csikóhalról” kapta, hiszen megszólalásig hasonlít a kis tengeri
                állatra. Újabb javaslatok szerint a hippokampusz nem csak egyedi
                emlékeink megvalósításáért felel, hanem segít a korábbi
                ismereteink, fogalmi hálózataink szervezésében, rendszerezésében
                is.
              </Text>
              <Text color="gray.600">
                További információért látogasson el{" "}
                <a
                  href="https://www.attilakeresztes.com/#home"
                  style={{ color: "#1a202c", textDecoration: "underline" }}
                >
                  weboldalunkra
                </a>
                .
              </Text>
            </Box>

            {/* Image Stays Beside Text If Not Stacked */}
            {!isStacked && (
              <Image
                src="/lab.png"
                alt="lab"
                width={500}
                height={500}
                className="rounded-lg"
              />
            )}
          </Box>

          {/* FAQ Section */}
          <Box
            as="section"
            display="flex"
            flexDirection={["column-reverse", "row"]}
            justifyContent="center"
            alignItems="center"
            gap={6}
            p={8}
            mx="auto" // Center the section horizontally
            backdropFilter="blur(10px)"
            brightness="100"
          >
            <Box
              width={["100%", "60%"]}
              p={6}
              bg="white"
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
                <Text color="gray.600">
                  A részvétel során elegendő összesen 10 fogalom jellemzőit
                  ismertetni, ugyanakkor amennyiben Ön és gyermeke élvezik a
                  játékot és szívesen részt vennének a továbbiakban is a
                  vizsgálatban, lehetőség van mind a 300 szó közös
                  felfedezésére.
                </Text>
              </Box>
              <Box mb={6}>
                <Heading size="md" fontWeight="semibold">
                  Hogyan rögzíthetők a gyermek válaszai?
                </Heading>
                <Text color="gray.600">
                  A gyermek válaszai kétféleképpen rögzíthetőek: hangfelvétellel
                  és billentyűzettel. Hatékonyabb és számunkra a legelőnyösebb,
                  ha a gyermeke által mondott jellemzőket a hangfelvétel
                  funkcióval rögzítik.
                </Text>
              </Box>
              <Box></Box>
              <Box mb={6}>
                <Heading size="md" fontWeight="semibold">
                  Van-e helyes válasz?
                </Heading>
                <Text color="gray.600">
                  A szavak jellemzésére nincs “jó válasz” - minden jellemzőre
                  kíváncsiak vagyunk, melyet gyermekük az adott fogalomhoz
                  kapcsol. Számunkra minden válasz információval bír arról,
                  hogyan képezi le a 6-8 éves korosztály a világot, akkor is, ha
                  a felnőttek számára egy-egy válasz nem tűnik logikusnak, vagy
                  a fogalomra szerintük nem jellemző.
                </Text>
              </Box>
              <Box>
                <Heading size="md" fontWeight="semibold">
                  Kapunk-e visszajelzést a gyermek teljesítményéről?
                </Heading>
                <Text color="gray.600">
                  Egyéni szinten nem áll módunkban visszajelzést adni, de a
                  csoportszintű eredmények alapján elkészült fogalmi térképet,
                  valamint az elkészült publikációkat e-mailben fogjuk elküldeni
                  Önöknek.
                </Text>
              </Box>
            </Box>

            {/* Image on the Right without Backdrop */}
            <Box width={["100%", "33%"]} mt={[10, 10]} ml={[0, 8]}>
              <Image
                src="/HCCCL Logo_MPG_green.png"
                alt="HCCCL_logo"
                width={260}
                height={260}
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
            mx="auto"
            w="80%"
            p={8}
            bg="white"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            boxShadow="2xl"
          >
            <Heading size="lg" fontWeight="bold" mb={4}>
              Szüksége van további segítségre?
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

          <Box as="footer" w="full" pb={5} mt={8}>
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
