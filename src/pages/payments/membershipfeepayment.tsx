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

interface Name {
  first_name: string;
  last_name: string;
}

interface Member {
  docId: string;
  name: Name;
  mobile_phone?: Number;
}

interface Template {
  docId: string;
  channel: string;
  message: string;
}

interface MembershipProgram {
  docId?: string;
  name: string;
  price: Number;
}

interface Payment {
  docId: string;
  member: Member;
  membership_program: MembershipProgram;
  month: Number;
  year: Number;
  status: string;
}

interface Month {
  docId: string;
  name: string;
  value: Number;
}

interface Year {
  docId: string;
  value: Number;
}

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
    name: "November",
    value: 11,
  });
  const [currentYear, setCurrentYear] = useState<Year>({
    docId: "",
    value: 2022,
  });
  const [payments, setPayments] = useState<Array<Payment>>();

  const generatePaymentStatements = async () => {
    const q = query(
      collection(database, "members"),
      where("is_active", "==", true)
    );
    const members = await getDocs(q);

    members.forEach(async (member) => {
      const membershipProgramRef = doc(
        database,
        "membership_programs",
        member.data().membership_program.membershipProgramId
      );
      const membershipProgram = await getDoc(membershipProgramRef);

      if (membershipProgram.exists()) {
        await addDoc(collection(database, "membership_payments"), {
          member: member.data(),
          membership_program: membershipProgram.data(),
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          status: "Due",
        });
        getPayments();
      }
    });
  };

  async function addPayment() {
    await addDoc(collection(database, "membership_payments"), {
      member: selectedMember,
      membership_program: selectedProgram,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      status: "Due",
    });
    getPayments();
    onClose();
  }

  async function getAllMembers() {
    const querySnapshot = await getDocs(collection(database, "members"));
    let temp: Array<any> = [];
    querySnapshot.forEach((doc) => {
      temp.push(doc.data());
    });
    setMembers(temp);
    setSelectedMember(temp[0]);
  }

  async function getAllPrograms() {
    const querySnapshot = await getDocs(
      collection(database, "membership_programs")
    );
    let temp: Array<MembershipProgram> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        docId: doc.id,
        name: doc.data().name,
        price: doc.data().price,
      });
    });
    setPrograms(temp);
    setSelectedProgram(temp[0]);
  }

  async function getPayments() {
    const querySnapshot = await getDocs(
      query(
        collection(database, "membership_payments"),
        where("month", "==", currentMonth.value),
        where("year", "==", currentYear.value)
      )
    );
    let temp: Array<Payment> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        docId: doc.id,
        member: doc.data().member,
        membership_program: doc.data().membership_program,
        month: doc.data().month,
        status: doc.data().status,
        year: doc.data().year,
      });
    });
    setPayments(temp);
  }

  async function getMonths() {
    const querySnapshot = await getDocs(
      query(collection(database, "months"), orderBy("value"))
    );
    let temp: Array<Month> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        docId: doc.id,
        name: doc.data().name,
        value: doc.data().value,
      });
    });
    setMonth(temp);
    setCurrentMonth(
      temp.find((month) => month.value == new Date().getMonth() + 1)!
    );
  }

  async function getYears() {
    const querySnapshot = await getDocs(
      query(collection(database, "years"), orderBy("value"))
    );
    let temp: Array<Year> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        docId: doc.id,
        value: doc.data().value,
      });
    });
    setYear(temp);
    setCurrentYear(
      temp.find((year) => year.value == new Date().getFullYear())!
    );
  }

  const getSMSTemplate = async () => {
    const q = query(
      collection(database, "templates"),
      where("channel", "==", "sms")
    );
    const templateMessages = await getDocs(q);
    let temp: Array<Template> = [];
    templateMessages.forEach((template) =>
      temp.push({
        docId: template.id,
        channel: template.data().channel,
        message: template.data().message,
      })
    );
    return temp[0];
  };

  const validateMobileNumber = (number: Number) => {
    let expr = /^(0|91)?[6-9][0-9]{9}$/;
    alert(number);
    if (expr.test(number.toString())) {
      return true;
    }
    return false;
  };

  const sendPaymentReminderMessage = async (payment: Payment) => {
    const templateMessage: Template = await getSMSTemplate();
    const APIKEY =
      "qWy2QBMZGjNh8keYimacstT7V4rHvUuwA0IldofDPxbp51FRXCYFOb3yJRfDZ1At5VsjTzlHdnGcWBw7";
    const message =
      "Fit Pro West. \r\nPayment reminder : Dear " +
      payment.member.name.first_name +
      " Your fee payment for the month is pending.";
    const mobile_phone = payment.member.mobile_phone;
    if (validateMobileNumber(mobile_phone!)) {
      const messageContent =
        "https://www.fast2sms.com/dev/bulkV2?authorization=" +
        APIKEY +
        "&message=" +
        templateMessage.message +
        "&language=english&route=v3&numbers=" +
        mobile_phone +
        "&flash=0";
      try {
        axios
          .get(messageContent)
          .then((response) => console.log(response.request.response));
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Invalid Phone Number");
    }
  };

  function newPayment() {
    getAllMembers();
    getAllPrograms();
    onOpen();
  }

  async function paid(payment: Payment) {
    await updateDoc(doc(database, "membership_payments", payment.docId), {
      status: "Paid",
    });
    getPayments();
  }

  useEffect(() => {
    getPayments();
    getMonths();
    getYears();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getPayments();
  }, [currentMonth, currentYear]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav navIndex={5} />
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={5} />
        </Box>
      )}
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
                              query: { formType: "edit", paymentId: payment.docId },
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
                            onClick={(e) =>{e.stopPropagation(); sendPaymentReminderMessage(payment)}}
                          />
                          <IconButton
                            aria-label="Send Reminder Message"
                            icon={<IoCheckmarkDone />}
                            onClick={(e) => {e.stopPropagation(); paid(payment)}}
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
                        key={record.docId}
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
