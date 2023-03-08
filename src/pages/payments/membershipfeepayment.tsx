import {
  Avatar,
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spacer,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  IoCheckmarkDone,
  IoCloseCircle,
  IoMailUnreadOutline,
  IoPencil,
  IoTodayOutline,
} from "react-icons/io5";
import React, { useState, useEffect } from "react";
import {
  IoChevronDownOutline,
  IoSearchOutline,
  IoFilter,
  IoAdd,
} from "react-icons/io5";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  updateDoc,
  where,
} from "firebase/firestore";
import { database } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";
import axios from "axios";
import products from "../products";
import { Select, OptionBase } from "chakra-react-select";
import NavigationBar from "../../components/NavigationBar";
import {
  addMembershipPayment,
  getAllMembers,
  getAllMembershipPrograms,
  getMembershipPayments,
  getMessageTemplate,
  getMonths,
  getYears,
  updateMembershipPaymentStatus,
} from "../../services/firebaseService";
import { Member, MembershipPayment, MembershipProgram, Month, Template, Year } from "../../types";
import {
  formulateMessage,
  validateMobileNumber,
} from "../../services/fastsmsService";

interface PaymentTypeProps {
  updatePaymentType: (value: number) => void;
}

function MembershipFeePayment({ updatePaymentType }: PaymentTypeProps) {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [members, setMembers] = useState<Array<Member>>();
  const [selectedMember, setSelectedMember] = useState<Member>();
  const [programs, setPrograms] = useState<Array<MembershipProgram>>();
  const [selectedProgram, setSelectedProgram] = useState<MembershipProgram>();
  const [month, setMonth] = useState<Array<Month>>();
  const [year, setYear] = useState<Array<Year>>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Month>({
    docId: "",
    name: "",
    value: 0,
  });
  const [currentYear, setCurrentYear] = useState<Year>({
    docId: "",
    value: 0,
  });
  const [payments, setPayments] = useState<Array<MembershipPayment>>();

  const generatePaymentStatements = async () => {
     if (members != undefined && members != null && members.length > 0) {
       members.forEach(async (member) => {
        if (programs != undefined && programs != null && programs.length > 0) {
          let membershipProgram = programs.find(
            (program) =>
              program.membershipProgramId ==
              member.membership_program.membershipProgramId
          );
          console.log(membershipProgram)
          await addDoc(collection(database, "membership_payments"), {
            member: member,
            membership_program: membershipProgram,
            month: currentMonth.value,
            year: currentYear.value,
            status: "Due",
          });
        }
      });
    }
    generatePayments();
  };

  async function addPayment() {
    await addMembershipPayment({
      member: selectedMember!,
      membership_program: selectedProgram!,
      month: currentMonth.value,
      year: currentYear.value,
      status: "Due",
    })
    generatePayments();
    onClose();
  }

  async function generatePayments() {
    const payments: Array<MembershipPayment> = await getMembershipPayments(
      currentMonth.value,
      currentYear.value
    );
    setPayments(payments);
  }

  async function initializeMonthAndYear() {
    const months: Array<Month> = await getMonths();
    const years: Array<Year> = await getYears();

    setMonth(months);
    setYear(years);
    setCurrentMonth(
      months.find((month) => month.value == new Date().getMonth() + 1)!
    );
    setCurrentYear(
      years.find((year) => year.value == new Date().getFullYear())!
    );
  }

  async function initializeMembersAndPrograms() {
    const members: Array<Member> = await getAllMembers();
    const programs: Array<MembershipProgram> = await getAllMembershipPrograms();

    setMembers(members);
    setSelectedMember(members[0]);
    setPrograms(programs);
    setSelectedProgram(programs[0]);
  }

  const getSMSTemplate = async () => {
    const templates: Array<Template> = await getMessageTemplate("sms");
    return templates[0];
  };

  const sendPaymentReminderMessage = async (payment: MembershipPayment) => {
    const template: Template = await getSMSTemplate();
    const mobile_phone = payment.member.mobile_phone;
    if (validateMobileNumber(mobile_phone!)) {
      const message = formulateMessage(template, mobile_phone);
      try {
        axios
          .get(message)
          .then((response) => console.log(response.request.response));
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Invalid Phone Number");
    }
  };

  function newPayment() {
    onOpen();
  }

  async function paid(payment: MembershipPayment) {
    await updateMembershipPaymentStatus(payment.docId!, "Paid");
    generatePayments();
  }

  useEffect(() => {
    initializeMonthAndYear();
    initializeMembersAndPrograms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    generatePayments();
  }, [currentMonth, currentYear]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <NavigationBar navIndex={5} />
      <Box pl={{ base: "20%", sm: "18%" }} w="98vw">
        <Stack direction="column" spacing={8} px={[2, null, 10]} py={10}>
          <Text as="b" fontSize="2xl" color="black">
            Payments
          </Text>
          <HStack>
            <Button
              colorScheme="blackAlpha"
              variant="outline"
              onClick={() => updatePaymentType(1)}
            >
              <Text fontSize="sm" color="black" mx="8">
                Membership Fee
              </Text>
            </Button>
            <Button variant="outline" onClick={() => updatePaymentType(2)}>
              <Text fontSize="sm" color="blackAlpha.400" mx="2">
                Product
              </Text>
            </Button>
          </HStack>
          <Stack>
            <HStack>
              <Menu>
                <MenuButton
                  isActive="true"
                  as={Button}
                  rightIcon={<IoChevronDownOutline />}
                  bgColor="blackAlpha.100"
                  color="blackAlpha.600"
                >
                  {currentMonth?.name}
                </MenuButton>
                <MenuList>
                  {month?.map((record) => (
                    <MenuItem
                      key={record.docId}
                      onClick={() => setCurrentMonth(record)}
                    >
                      {record.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <Menu>
                <MenuButton
                  isActive="true"
                  as={Button}
                  rightIcon={<IoChevronDownOutline />}
                  bgColor="blackAlpha.100"
                  color="blackAlpha.600"
                >
                  {currentYear?.value.toString()}
                </MenuButton>
                <MenuList>
                  {year?.map((record) => (
                    <MenuItem
                      key={record.docId}
                      onClick={() => setCurrentYear(record)}
                    >
                      {record.value.toString()}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              {!isMobile ? (
                <>
                  <Spacer />
                  {currentYear.value === new Date().getFullYear() &&
                    currentMonth.value === new Date().getMonth() + 1 && (
                      <Button
                        rightIcon={<IoAdd size="26" />}
                        colorScheme="blackAlpha"
                        bgColor="black"
                        variant="solid"
                        onClick={newPayment}
                      >
                        {!isMobile ? <Text>Add</Text> : null}
                      </Button>
                    )}
                </>
              ) : (
                <>
                  {currentYear.value === new Date().getFullYear() &&
                    currentMonth.value === new Date().getMonth() + 1 && (
                      <IconButton
                        aria-label="Add Product Payment"
                        icon={<IoAdd size={24} />}
                        colorScheme="blackAlpha"
                        bgColor="black"
                        variant="solid"
                        onClick={newPayment}
                      />
                    )}
                </>
              )}
            </HStack>
          </Stack>
          {payments != null && payments.length > 0 ? (
            !isMobile ? (
              <Table>
                <Thead>
                  <Tr>
                    <Th></Th>
                    <Th>MEMBER</Th>
                    <Th>DUE</Th>
                    <Th>STATUS</Th>
                    <Th w="12">REMINDER</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {payments.map((payment) => (
                    <Tr key={payment.docId} color="black">
                      {payment.status === "Due" ? (
                        <Td>
                          <IoCloseCircle size="30" color="red" />
                        </Td>
                      ) : (
                        <Td>
                          <IoCheckmarkDone size="30" color="green" />
                        </Td>
                      )}
                      <Td>
                        <Button
                          onClick={() =>
                            router.push({
                              pathname: "../payments/membershipfeepaymentedit",
                              query: {
                                formType: "edit",
                                paymentId: payment.docId,
                              },
                            })
                          }
                        >
                          {payment.member.name.first_name +
                            " " +
                            payment.member.name.last_name}
                        </Button>
                      </Td>
                      <Td>{payment.membership_program.price.toString()}</Td>
                      <Td>{payment.status}</Td>
                      {payment.status === "Due" ? (
                        <Td>
                          <Button
                            w="28"
                            leftIcon={<IoMailUnreadOutline size="20" />}
                            p="6"
                            onClick={() => sendPaymentReminderMessage(payment)}
                            mb="1"
                          >
                            Send
                          </Button>
                          <Button
                            w="28"
                            leftIcon={<IoCheckmarkDone size="20" />}
                            py="6"
                            onClick={() => paid(payment)}
                            mt="1"
                          >
                            Paid
                          </Button>
                        </Td>
                      ) : (
                        <></>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <SimpleGrid columns={1} spacing={4}>
                {payments?.map((payment) => (
                  <Box
                    key={payment.docId}
                    display="flex"
                    alignItems="center"
                    borderRadius="xl"
                    boxShadow="2xl"
                    _hover={{
                      boxShadow: "xl",
                      color: "gray",
                      cursor: 3,
                    }}
                    onClick={() =>
                      router.push({
                        pathname: "../payments/membershipfeepaymentedit",
                        query: { formType: "edit", paymentId: payment.docId },
                      })
                    }
                  >
                    <HStack spacing={12}>
                      <Stack direction="column" px={6} py={4} width="170px">
                        <Text fontSize="md" color="black" fontWeight="bold">
                          {payment.member.name.first_name +
                            " " +
                            payment.member.name.last_name}
                        </Text>
                        <Text fontSize="sm" color="black">
                          {payment.membership_program.price.toString()}
                        </Text>
                        <Text fontSize="sm" color="black">
                          {payment.status}
                        </Text>
                      </Stack>
                      {payment.status === "Due" ? (
                        <VStack>
                          <IconButton
                            aria-label="Send Reminder Message"
                            icon={<IoMailUnreadOutline />}
                            onClick={(e) => {
                              e.stopPropagation();
                              sendPaymentReminderMessage(payment);
                            }}
                          />
                          <IconButton
                            aria-label="Send Reminder Message"
                            icon={<IoCheckmarkDone />}
                            onClick={(e) => {
                              e.stopPropagation();
                              paid(payment);
                            }}
                          />
                        </VStack>
                      ) : null}
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            )
          ) : currentYear.value === new Date().getFullYear() &&
            currentMonth.value === new Date().getMonth() + 1 ? (
            <Center pt="100">
              <Button
                size="lg"
                leftIcon={<IoTodayOutline size="26" />}
                colorScheme="blackAlpha"
                bgColor="black"
                variant="solid"
                onClick={() => generatePaymentStatements()}
              >
                Generate Payment Statements
              </Button>
            </Center>
          ) : (
            <Center pt="100">
              <VStack>
                <IoCloseCircle size={40} color="red" />
                <Text>Payment Details not available</Text>
              </VStack>
            </Center>
          )}
        </Stack>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Member</FormLabel>
              <Box
                borderRadius="md"
                backgroundColor="gray.100"
                pl="5"
                pt="3"
                h={12}
                w="100%"
              >
                <Menu>
                  <MenuButton>{selectedMember?.name.first_name}</MenuButton>
                  <MenuList>
                    {members?.map((record) => (
                      <MenuItem
                        key={record.docId}
                        onClick={() => setSelectedMember(record)}
                      >
                        {record.name.first_name}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Box>
            </FormControl>
            <FormControl>
              <FormLabel>Program</FormLabel>
              <Box
                borderRadius="md"
                backgroundColor="gray.100"
                pl="5"
                pt="3"
                h={12}
                w="100%"
              >
                <Menu>
                  <MenuButton>{selectedProgram?.name}</MenuButton>
                  <MenuList>
                    {programs?.map((record) => (
                      <MenuItem
                        // key={record.docId}
                        onClick={() => setSelectedProgram(record)}
                      >
                        {record.name}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Box>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                addPayment();
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default MembershipFeePayment;
