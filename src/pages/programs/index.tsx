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
import { MembershipProgram } from "../../types";
import {
  addMembershipProgram,
  deleteMembershipProgram,
  getAllMembershipPrograms,
  updateMembershipProgram,
} from "../../services/firebaseService";
import NavigationBar from "../../components/NavigationBar";

function Programs() {
  const { user } = useAuth();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [membershipPrograms, setMembershipPrograms] =
    useState<Array<MembershipProgram>>();
  const [selectedMembershipProgram, setSelectedMembershipProgram] =
    useState<MembershipProgram>({
      membershipProgramId: "",
      name: "",
      price: 0,
    });
  const router = useRouter();

  async function getMembershipPrograms() {
    let membershipPrograms: Array<MembershipProgram> =
      await getAllMembershipPrograms();
    setMembershipPrograms(membershipPrograms);
  }

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setSelectedMembershipProgram((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  async function addProgram() {
    addMembershipProgram({
      name: selectedMembershipProgram.name,
      price: Number.parseInt(selectedMembershipProgram.price.toString()),
    });
    getMembershipPrograms();
  }

  async function updateProgram() {
    updateMembershipProgram(selectedMembershipProgram.membershipProgramId!, {
      name: selectedMembershipProgram.name,
      price: Number.parseInt(selectedMembershipProgram.price.toString()),
    });
    getMembershipPrograms();
  }

  async function deleteProgram() {
    await deleteMembershipProgram(
      selectedMembershipProgram.membershipProgramId!
    );
    getMembershipPrograms();
  }

  useEffect(() => {
    getMembershipPrograms();
  }, []);

  return (
    <>
      <NavigationBar navIndex={2} />
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
                  membershipProgramId: "",
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
                key={program.membershipProgramId}
                display="flex"
                alignItems="center"
                justifyContent="center"
                height={{ base: "140px", sm: "200px" }}
                borderRadius="xl"
                boxShadow="xl"
                onClick={() => {
                  setSelectedMembershipProgram({
                    membershipProgramId: program.membershipProgramId,
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
            {selectedMembershipProgram.membershipProgramId === "" ? (
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  addProgram();
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
                    updateProgram();
                    onClose();
                  }}
                >
                  Update
                </Button>
                <Button
                  colorScheme="red"
                  mr={3}
                  onClick={() => {
                    deleteProgram();
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
  );
}

export default Programs;
