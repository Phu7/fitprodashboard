import {
  Box,
  Center,
  Flex,
  Square,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  IconButton,
  Spacer,
  HStack,
  Link,
  SimpleGrid,
  VStack,
  Grid,
  GridItem,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import {
  IoChevronDownOutline,
  IoSearchOutline,
  IoFilter,
  IoAdd,
  IoPencil,
} from "react-icons/io5";
import React, { useEffect, useState } from "react";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import { useDispatch, useSelector } from "react-redux";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, database } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth } from "../../context/AuthContext";

interface MembershipProgram {
  id: string;
  name: string;
  price: Number;
}

function Programs() {
  const {user} = useAuth();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [membershipPrograms, setMembershipPrograms] =
    useState<Array<MembershipProgram>>();
  const [selectedMembershipProgram, setSelectedMembershipProgram] =
    useState<MembershipProgram>({
      id: "",
      name: "",
      price: 0,
    });
  const [formFields, setFormFields] = useState<MembershipProgram>({
    id: "",
    name: "",
    price: 0,
  });
  const router = useRouter();

  async function getMembershipPrograms() {
    const querySnapshot = await getDocs(
      collection(database, "membership_programs")
    );
    let temp: Array<MembershipProgram> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
      });
    });
    setMembershipPrograms(temp);
  }

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormFields((prevState) => ({ ...prevState, [name]: value }));
  };

  async function addMembershipProgram() {
    await addDoc(collection(database, "membership_programs"), {
      name: formFields.name,
      price: Number.parseInt(formFields.price.toString()),
    });
    getMembershipPrograms();
  }

  async function updateMembershipProgram() {
    await setDoc(
      doc(database, "membership_programs", selectedMembershipProgram.id),
      {
        name: formFields.name,
        price: Number.parseInt(formFields.price.toString()),
      }
    );
    getMembershipPrograms();
  }

  async function deleteMembershipProgram() {
    await deleteDoc(
      doc(database, "membership_programs", selectedMembershipProgram.id)
    );
    getMembershipPrograms();
  }

  useEffect(() => {
    getMembershipPrograms();
  }, []);

    return (
      <>
        {!isMobile ? (
          <Box width="18%" pos="fixed">
            <ExpandedSideNav navIndex={1}/>
          </Box>
        ) : (
          <Box width="18%" pos="fixed">
            <SideNav navIndex={1}/>
          </Box>
        )}
        <Box pl={{ base: "20%", sm: "18%" }} w="98vw">
          <Stack direction="column" spacing={8} px={[2, null, 10]} py={10}>
            <Text as="b" fontSize="2xl" color="black">
              Membership Programs
            </Text>
            <SimpleGrid
              columns={[2, null, 4]}
              spacing={[4, null, 10]}
              pt={[null, null, 12]}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height={{ base: "140px", sm: "200px" }}
                borderRadius="xl"
                boxShadow="2xl"
                onClick={() => {
                  setSelectedMembershipProgram({
                    id: "",
                    name: "Program Name",
                    price: 0,
                  });
                  onOpen();
                }}
                _hover={{
                  boxShadow: "xl",
                  color: "gray",
                }}
              >
                <IoAdd size={isMobile ? 40 : 80} />
              </Box>
              {membershipPrograms?.map((program) => (
                <Box
                  key={program.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height={{ base: "140px", sm: "200px" }}
                  borderRadius="xl"
                  boxShadow="xl"
                  onClick={() => {
                    setSelectedMembershipProgram({
                      id: program.id,
                      name: program.name,
                      price: program.price,
                    });
                    onOpen();
                  }}
                  _hover={{
                    boxShadow: "sm",
                    color: "gray",
                    cursor: 3,
                  }}
                >
                  <Text
                    fontSize={{ base: "md", sm: "xl" }}
                    color="gray"
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {program.name}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Box>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add new program</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  focusBorderColor="black"
                  placeholder={selectedMembershipProgram.name}
                  size="lg"
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Price</FormLabel>
                <Input
                  name="price"
                  focusBorderColor="black"
                  placeholder={selectedMembershipProgram.price?.toString()}
                  size="lg"
                  onChange={handleInputChange}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              {selectedMembershipProgram.id === "" ? (
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={() => {
                    addMembershipProgram();
                    onClose();
                  }}
                >
                  Save
                </Button>
              ) : (
                <>
                  <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={() => {
                      updateMembershipProgram();
                      onClose();
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    colorScheme="red"
                    mr={3}
                    onClick={() => {
                      deleteMembershipProgram();
                      onClose();
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
}

export default Programs;
