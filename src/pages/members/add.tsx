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
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogBody,
  AlertDialogFooter,
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
  IoRemove,
  IoSave,
  IoSaveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import { database } from "../../firebaseConfig";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";

interface Member {
  id: number;
  fname: string;
  lname: string;
  email: string;
  mobile_phone: number;
  joining_date: string;
  address_city: string;
  address_state: string;
  address_country: string;
  membership_program: string;
}

interface MembershipPrograms {
  membershipProgramId: string;
  name: string;
}

function AddMember() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const [membershipPrograms, setMembershipPrograms] =
    useState<Array<MembershipPrograms>>();
  const [formFields, setFormFields] = useState<Member>({
    id: 1,
    fname: "",
    lname: "",
    email: "",
    mobile_phone: 0,
    joining_date: "",
    address_city: "",
    address_state: "",
    address_country: "",
    membership_program: "",
  });

  async function addMember() {
    router.query.formType === "new"
      ? await addDoc(collection(database, "members"), {
          name: {
            first_name: formFields.fname,
            last_name: formFields.lname,
          },
          email: formFields.email,
          mobile_phone: Number.parseInt(formFields.mobile_phone.toString()),
          is_active: true,
          address: {
            city: formFields.address_city,
            state: formFields.address_state,
            country: formFields.address_country,
          },
          joining_date: formFields.joining_date,
          membership_program: formFields.membership_program,
        })
      : await updateDoc(
          doc(database, "members", router.query.memberId as string),
          {
            name: {
              first_name: formFields.fname,
              last_name: formFields.lname,
            },
            email: formFields.email,
            mobile_phone: Number.parseInt(formFields.mobile_phone.toString()),
            is_active: true,
            address: {
              city: formFields.address_city,
              state: formFields.address_state,
              country: formFields.address_country,
            },
            joining_date: formFields.joining_date,
            membership_program: formFields.membership_program,
          }
        );
    router.back();
  }

  async function deleteMember() {
    await deleteDoc(doc(database, "members", router.query.memberId as string));
    router.back();
  }

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormFields((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (e: React.FormEvent<HTMLSelectElement>) => {
    const { name, value } = e.currentTarget;
    let currentData = membershipPrograms?.find((obj) => obj.name === value);
    setFormFields((prevState) => ({
      ...prevState,
      [name]: currentData?.membershipProgramId,
    }));
  };

  async function getMembershipPrograms() {
    const querySnapshot = await getDocs(
      collection(database, "membership_programs")
    );
    let temp: Array<MembershipPrograms> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        membershipProgramId: doc.id,
        name: doc.data().name,
      });
    });
    setMembershipPrograms(temp);
  }

  async function getEditableMember() {
    let id: string = router.query.memberId as string;
    const docRef = doc(database, "members", id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      setFormFields({
        id: docSnapshot.data().id,
        fname: docSnapshot.data().name.first_name,
        lname: docSnapshot.data().name.last_name,
        email: docSnapshot.data().email,
        mobile_phone: docSnapshot.data().mobile_phone,
        joining_date: docSnapshot.data().joining_date,
        address_city: docSnapshot.data().address.city,
        address_state: docSnapshot.data().address.state,
        address_country: docSnapshot.data().address.country,
        membership_program: docSnapshot.data().membership_program,
      });
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  useEffect(() => {
    getMembershipPrograms();
    if (router.query.formType === "edit") getEditableMember();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav navIndex={2} />
        </Box>
      ) : null}
      <Box pl={[2, null, "18%"]} w="98vw">
        <Stack direction="column" spacing={8} px={[2, null, 10]} py={10}>
          <Text as="b" fontSize="2xl" color="black">
            New Member
          </Text>
          <HStack>
            <Button
              onClick={addMember}
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
                        Are you sure? You can&apos;t undo this action afterwards.
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                          Cancel
                        </Button>
                        <Button colorScheme="red" onClick={() => {deleteMember(); onClose()}} ml={3}>
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
                <FormLabel>First Name</FormLabel>
                <Input
                  name="fname"
                  focusBorderColor="black"
                  placeholder="First Name"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.fname}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="lname"
                  focusBorderColor="black"
                  placeholder="Last Name"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.lname}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  name="email"
                  type="email"
                  focusBorderColor="black"
                  placeholder="Email"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.email}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="mobile_phone"
                  type="tel"
                  focusBorderColor="black"
                  placeholder="Phone Number"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.mobile_phone}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>City</FormLabel>
                <Input
                  name="address_city"
                  focusBorderColor="black"
                  placeholder="City"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.address_city}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>State</FormLabel>
                <Input
                  name="address_state"
                  focusBorderColor="black"
                  placeholder="State"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.address_state}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Country</FormLabel>
                <Input
                  name="address_country"
                  focusBorderColor="black"
                  placeholder="Country"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.address_country}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Joining Date</FormLabel>
                <Input
                  name="joining_date"
                  type="date"
                  focusBorderColor="black"
                  placeholder="Select Date and Time"
                  size="lg"
                  onChange={handleInputChange}
                  defaultValue={formFields.joining_date}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Membership Program</FormLabel>
                <Select
                  name="membership_program"
                  focusBorderColor="black"
                  placeholder="Select category"
                  onChange={handleSelectChange}
                >
                  {membershipPrograms?.map((program) =>
                    program.membershipProgramId ==
                    formFields.membership_program ? (
                      <option selected>{program.name}</option>
                    ) : (
                      <option>{program.name}</option>
                    )
                  )}
                </Select>
              </FormControl>
            </GridItem>
          </Grid>
        </Stack>
      </Box>
    </>
  );
}

export default AddMember;
