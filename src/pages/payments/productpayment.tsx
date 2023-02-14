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
  VStack,
  Container,
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
  useDisclosure,
  Portal,
  Select,
  useMediaQuery,
  SimpleGrid,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import {
  IoChevronDownOutline,
  IoSearchOutline,
  IoFilter,
  IoAdd,
  IoMailUnreadOutline,
  IoCloseCircleSharp,
  IoEllipsisHorizontalCircleSharp,
  IoTodayOutline,
  IoCloseCircle,
  IoCheckmarkDone,
} from "react-icons/io5";
import { useRouter } from "next/router";
import {
  addDoc,
  collection,
  getDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { database } from "../../firebaseConfig";
import { getSystemErrorMap } from "util";
import { generateKeyPairSync } from "crypto";
import SideNav from "../../components/SideNav";

interface Name {
  first_name: string;
  last_name: string;
}

interface Member {
  docId: string;
  name: Name;
}

interface Product {
  product_id: string;
  name: string;
  total_stock: number;
  available_stock: number;
  price: number;
}

interface Payment {
  docId: string;
  member: Member;
  product: Product;
  month: Number;
  year: Number;
  quantity: Number;
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

function ProductPayment({ updatePaymentType }: PaymentTypeProps) {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [members, setMembers] = useState<Array<Member>>();
  const [selectedMember, setSelectedMember] = useState<Member>();
  const [products, setProducts] = useState<Array<Product>>();
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [month, setMonth] = useState<Array<Month>>();
  const [year, setYear] = useState<Array<Year>>();
  const [currentMonth, setCurrentMonth] = useState<Month>({
    docId: "",
    name: "November",
    value: new Date().getMonth() + 1,
  });
  const [currentYear, setCurrentYear] = useState<Year>({
    docId: "",
    value: new Date().getFullYear(),
  });
  const [payments, setPayments] = useState<Array<Payment>>();
  const router = useRouter();

  async function getAllMembers() {
    const querySnapshot = await getDocs(collection(database, "members"));
    let temp: Array<Member> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        docId: doc.id,
        name: {
          first_name: doc.data().name.first_name,
          last_name: doc.data().name.last_name,
        },
      });
    });
    setMembers(temp);
    setSelectedMember(temp[0]);
  }

  async function getAllProducts() {
    const querySnapshot = await getDocs(
      query(collection(database, "products"), where("available_stock", ">", 0))
    );
    let temp: Array<Product> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        product_id: doc.id,
        name: doc.data().name,
        total_stock: doc.data().total_stock,
        available_stock: doc.data().available_stock,
        price: doc.data().price,
      });
    });
    setProducts(temp);
    setSelectedProduct(temp[0]);
  }

  async function getPayments() {
    const querySnapshot = await getDocs(
      query(
        collection(database, "product_payments"),
        where("month", "==", currentMonth.value),
        where("year", "==", currentYear.value)
      )
    );
    let temp: Array<Payment> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        docId: doc.id,
        member: doc.data().member,
        product: doc.data().product,
        month: doc.data().month,
        year: doc.data().year,
        quantity: doc.data().quantity,
        status: doc.data().status,
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

  function newPayment() {
    getAllMembers();
    getAllProducts();
    onOpen();
  }

  async function updateProduct() {
    const docRef = doc(
      database,
      "products",
      selectedProduct?.product_id as string
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().available_stock > 0) {
      await updateDoc(
        doc(database, "products", selectedProduct?.product_id as string),
        {
          available_stock:
            Number.parseInt(docSnap.data().available_stock.toString()) - 1,
        }
      );
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  async function addPayment() {
    await addDoc(collection(database, "product_payments"), {
      member: selectedMember,
      product: selectedProduct,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      status: "Due",
      quantity: 1,
    });
    updateProduct();
  }

  // const handleOptionSetChange = (e: React.FormEvent<HTMLOptionElement>) => {
  //   const { name, value } = e.currentTarget
  //   setSelectedMember(value)
  // }

  async function paid(payment: Payment) {
    await updateDoc(doc(database, "product_payments", payment.docId), {
      status: "Paid",
    });
    getPayments();
  }

  useEffect(() => {
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
          <ExpandedSideNav navIndex={4} />
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={4} />
        </Box>
      )}
      <Box pl={{ base: "20%", sm: "18%" }} w="98vw">
        <Stack direction="column" spacing={8} px={[2, null, 10]} py={10}>
          <Text as="b" fontSize="2xl" color="black">
            Payments
          </Text>

          <HStack>
            <Button variant="outline" onClick={() => updatePaymentType(1)}>
              <Text fontSize="sm" color="blackAlpha.400" mx="8">
                Membership Fee
              </Text>
            </Button>
            <Button
              colorScheme="blackAlpha"
              variant="outline"
              onClick={() => updatePaymentType(2)}
            >
              <Text fontSize="sm" color="black" mx="2">
                Product
              </Text>
            </Button>
          </HStack>
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
          {!isMobile ? (
            <Table>
              <Thead>
                <Tr>
                  <Th>MEMBER</Th>
                  <Th>PRODUCT</Th>
                  <Th>DUE</Th>
                  <Th>STATUS</Th>
                  <Th w="12"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments?.map((payment) => (
                  <Tr key={payment.docId} color="black">
                    <Td>{payment.member.name.first_name}</Td>
                    <Td>{payment.product.name}</Td>
                    <Td>{payment.product.price}</Td>
                    <Td>{payment.status}</Td>
                    {payment.status === "Due" ? (
                      <Td>
                        <Button
                          w="28"
                          leftIcon={<IoCheckmarkDone size="20" />}
                          py="6"
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
                >
                  <HStack spacing={12}>
                    <Stack direction="column" px={6} py={4}>
                      <Text fontSize="md" color="black" fontWeight="bold">
                        {payment.member.name.first_name}
                      </Text>
                      <Text fontSize="sm" color="black">
                        {payment.product.name}
                      </Text>
                      <Text fontSize="sm" color="black">
                        {payment.product.price}
                      </Text>
                      <Text fontSize="sm" color="black">
                        {payment.status}
                      </Text>
                    </Stack>
                    {payment.status === "Due" ? (
                      <VStack>
                        <IconButton
                          aria-label="Send Reminder Message"
                          icon={<IoCheckmarkDone />}
                          onClick={() => paid(payment)}
                        />
                      </VStack>
                    ) : null}
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
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
              <FormLabel>Product</FormLabel>
              <Box
                borderRadius="md"
                backgroundColor="gray.100"
                pl="5"
                pt="3"
                h={12}
                w="100%"
              >
                <Menu>
                  <MenuButton>{selectedProduct?.name}</MenuButton>
                  <MenuList>
                    {products?.map((record) => (
                      <MenuItem
                        key={record.product_id}
                        onClick={() => setSelectedProduct(record)}
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

export default ProductPayment;
