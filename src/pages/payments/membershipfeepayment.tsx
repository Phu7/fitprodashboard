import {
  Avatar,
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
  VStack,
} from "@chakra-ui/react";
import { IoCheckmarkDone, IoCloseCircle, IoMailUnreadOutline, IoPencil, IoTodayOutline } from "react-icons/io5";
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
  where,
} from "firebase/firestore";
import { database } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";
import axios from "axios";

interface Name {
  first_name: string;
  last_name: string;
}

interface Member {
  docId: string;
  name: Name;
  mobile_phone: Number;
}

interface Template {
  docId: string;
  channel: string;
  message: string;
}

interface MembershipProgram {
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
  const [month, setMonth] = useState<Array<Month>>();
  const [year, setYear] = useState<Array<Year>>();
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
        member.data().membership_program
      );
      const membershipProgram = await getDoc(membershipProgramRef);

      if (membershipProgram.exists()) {
        await addDoc(collection(database, "membership_payments"), {
          member: {
            docId: member.id,
            name: {
              first_name: member.data().name.first_name,
              last_name: member.data().name.last_name,
            },
            mobile_phone: member.data().mobile_phone,
          },
          membership_program: {
            name: membershipProgram.data().name,
            price: membershipProgram.data().price,
          },
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          status: "Due",
        });
        getPayments();
      }
    });
  };

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

  const sendPaymentReminderMessage = async (payment: Payment) => {
    const templateMessage: Template = await getSMSTemplate();
    const APIKEY =
      "qWy2QBMZGjNh8keYimacstT7V4rHvUuwA0IldofDPxbp51FRXCYFOb3yJRfDZ1At5VsjTzlHdnGcWBw7";
    const message =
      "Fit Pro West. \r\nPayment reminder : Dear " +
      payment.member.name.first_name +
      " Your fee payment for the month is pending.";
    const mobile_phone = payment.member.mobile_phone;
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
  };

  useEffect(() => {
    getPayments();
    getMonths();
    getYears();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getPayments();
  }, [currentMonth, currentYear]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav navIndex={4}/>
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={4}/>
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
            <Button
              variant="outline"
              onClick={() => updatePaymentType(2)}
            >
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
                    <MenuItem key={record.docId} onClick={() => setCurrentMonth(record)}>
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
                    <MenuItem key={record.docId} onClick={() => setCurrentYear(record)}>
                      {record.value.toString()}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
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
                      <Th>REMINDER</Th>
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
                          {payment.member.name.first_name +
                            " " +
                            payment.member.name.last_name}
                        </Td>
                        <Td>{payment.membership_program.price.toString()}</Td>
                        <Td>{payment.status}</Td>
                        {payment.status === "Due" ? (
                          <Td>
                            <Button
                              leftIcon={<IoMailUnreadOutline size="20" />}
                              colorScheme="blackAlpha"
                              bgColor="black"
                              variant="solid"
                              p="6"
                              onClick={() =>
                                sendPaymentReminderMessage(payment)
                              }
                            >
                              Send
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
                      {payment.status === "Due" && (
                        <IconButton
                        aria-label="Send Reminder Message"
                        icon={<IoMailUnreadOutline />}
                        onClick={() =>
                          sendPaymentReminderMessage(payment)
                        }
                      />)}
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
    </>
  );
}

export default MembershipFeePayment;
