import {
  Box,
  Stack,
  Table,
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
  useMediaQuery,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { IoChevronDownOutline, IoAdd, IoCheckmarkDone } from "react-icons/io5";
import { useRouter } from "next/router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { database } from "../../firebaseConfig";
import NavigationBar from "../../components/NavigationBar";
import {
  Member,
  MembershipProgram,
  Month,
  Product,
  ProductPayment,
  Year,
} from "../../types";
import {
  addProductPayment,
  getAllMembers,
  getAvailableProducts,
  getMonths,
  getProductById,
  getProductPayments,
  getYears,
  updateProduct,
  updateProductPaymentStatus,
} from "../../services/firebaseService";

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
  const [quantity, setQuanity] = useState<number>(0);
  const [payments, setPayments] = useState<Array<ProductPayment>>();
  const router = useRouter();

  async function generatePayments() {
    let payments: Array<ProductPayment> = await getProductPayments(
      currentMonth.value,
      currentYear.value
    );
    setPayments(payments);
  }

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setQuanity(Number.parseInt(value));
  };

  function newPayment() {
    onOpen();
  }

  async function updateProductAvailability() {
    const product = await getProductById(selectedProduct?.product_id as string);

    if (product != null && product.available_stock > 0) {
      await updateProduct(selectedProduct?.product_id as string, {
        name: product.name,
        total_stock: product.total_stock,
        available_stock: product.available_stock - quantity,
        price: product.price,
      });
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  async function addPayment() {
    addProductPayment({
      member: selectedMember!,
      product: selectedProduct!,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      status: "Due",
      quantity: quantity,
      total: selectedProduct != null ? selectedProduct.price * quantity : 0,
      due: selectedProduct != null ? selectedProduct.price * quantity : 0,
    });
    updateProductAvailability();
    generatePayments();
    onClose();
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

  async function initializeMembersAndProducts() {
    const members: Array<Member> = await getAllMembers();
    const products: Array<Product> = await getAvailableProducts();

    setMembers(members);
    setSelectedMember(members[0]);
    setProducts(products);
    setSelectedProduct(products[0]);
  }
  useEffect(() => {
    initializeMonthAndYear();
    initializeMembersAndProducts();
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
                  <Th>Quantity</Th>
                  <Th>DUE</Th>
                  <Th>STATUS</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payments?.map((payment) => (
                  <Tr key={payment.docId} color="black">
                    <Td>
                      <Button
                        onClick={() =>
                          router.push({
                            pathname: "../payments/productpaymentedit",
                            query: {
                              formType: "edit",
                              paymentId: payment.docId,
                            },
                          })
                        }
                      >
                        {payment.member.name.first_name}
                      </Button>
                    </Td>
                    <Td>{payment.product.name}</Td>
                    <Td>{payment.quantity.toString()}</Td>
                    <Td>{payment.due.toString()}</Td>
                    <Td>{payment.status}</Td>
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
                      pathname: "../payments/productpaymentedit",
                      query: {
                        formType: "edit",
                        paymentId: payment.docId,
                      },
                    })
                  }
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
                        {payment.quantity.toString()}
                      </Text>
                      <Text fontSize="sm" color="black">
                        {payment.due.toString()}
                      </Text>
                      <Text fontSize="sm" color="black">
                        {payment.status}
                      </Text>
                    </Stack>
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
            <FormControl>
              <FormLabel>Quantity</FormLabel>
              <Input name="quantity" onChange={handleInputChange} defaultValue={1} />
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
