import {
  Box,
  Button,
  HStack,
  Text,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  FormControl,
  FormLabel,
  Input,
  GridItem,
  Grid,
  Select,
  Spacer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import {
  IoAdd,
  IoChevronDownOutline,
  IoSave,
  IoSaveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import { database } from "../../firebaseConfig";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";
import { MembershipPayment, ProductPayment } from "../../types";
import {
  deleteMembershipPayment,
  getMembershipPaymentById,
  updateMembershipPaymentStatus,
} from "../../services/firebaseService";

// interface Payment {
//   memberName: string;
//   due: number;
//   status: string;
// }

function EditFeePayment() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const [formFields, setFormFields] = useState<MembershipPayment>({
    member: {
      name: {
        first_name: "",
        last_name: "",
      },
      email: "",
      mobile_phone: 0,
      joining_date: new Date(),
      address: {
        city: "",
        state: "",
        country: "",
      },
      membership_program: {
        name: "",
        price: 0,
      },
    },
    membership_program: {
      name: "",
      price: 0,
    },
    month: 0,
    year: 0,
    status: "",
  });

  async function addPayment() {
    router.query.formType === "new"
      ? null
      : await updateMembershipPaymentStatus(router.query.paymentId as string, formFields.status)
    router.back();
  }

  async function removePayment() {
    await deleteMembershipPayment(router.query.paymentId as string);
    router.back();
  }

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormFields((prevState) => ({ ...prevState, [name]: value }));
  };

  async function getEditablePayment() {
    let id: string = router.query.paymentId as string;

    const payment: MembershipPayment = await getMembershipPaymentById(id);
    setFormFields({
      member: payment.member,
      membership_program: payment.membership_program,
      month: payment.month,
      year: payment.year,
      status: payment.status,
    });
  }

  useEffect(() => {
    router.query.formType === "edit" && getEditablePayment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav navIndex={4} />
        </Box>
      ) : null}
      <Box pl={[2, null, "18%"]} w="98vw">
        <Stack direction="column" spacing={8} px={[2, null, 10]} py={10}>
          <Text as="b" fontSize="2xl" color="black">
            Edit Payment
          </Text>
          <HStack>
            <Button
              onClick={addPayment}
              leftIcon={<IoSave size="20" />}
              colorScheme="blackAlpha"
              variant="outline"
            >
              <Text fontSize="lg" color="black">
                Save
              </Text>
            </Button>
            <Spacer />
            {router.query.formType !== "new" ? (
              <>
                <Button
                  leftIcon={<IoTrashOutline size="20" />}
                  colorScheme="red"
                  onClick={onOpen}
                >
                  <Text fontSize="lg" color="white">
                    Delete
                  </Text>
                </Button>
                <AlertDialog
                  isOpen={isOpen}
                  leastDestructiveRef={cancelRef}
                  onClose={onClose}
                >
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Delete Customer
                      </AlertDialogHeader>

                      <AlertDialogBody>
                        Are you sure? You can&apos;t undo this action
                        afterwards.
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                          Cancel
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={() => {
                            removePayment();
                            onClose();
                          }}
                          ml={3}
                        >
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
              </>
            ) : null}
          </HStack>
          <Grid templateColumns="repeat(4, 1fr)" gap={{ base: 2, sm: 6 }}>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl>
                <FormLabel>Member</FormLabel>
                <Button width="100%">
                  <Text color="gray.400">
                    {formFields.member.name.first_name +
                      " " +
                      formFields.member.name.last_name}
                  </Text>
                </Button>
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl>
                <FormLabel>Due</FormLabel>
                <Button width="100%">
                  <Text color="gray.400">
                    {formFields.membership_program.price.toString()}
                  </Text>
                </Button>
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Input
                  name="status"
                  focusBorderColor="black"
                  size="lg"
                  onChange={handleInputChange}
                  placeholder={formFields.status}
                />
              </FormControl>
            </GridItem>
          </Grid>
        </Stack>
      </Box>
    </>
  );
}

export default EditFeePayment;
