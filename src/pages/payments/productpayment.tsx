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
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { IoChevronDownOutline, IoAdd, IoSearch } from "react-icons/io5";
import { useRouter } from "next/router";
import NavigationBar from "../../components/NavigationBar";
import {
  Member,
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
  updateProductCount,
} from "../../services/firebaseService";
import { Select } from "chakra-react-select";

interface PaymentTypeProps {
  updatePaymentType: (value: number) => void;
}

interface Option {
  value: string;
  label: string;
  id: string;
}

function ProductPayment({ updatePaymentType }: PaymentTypeProps) {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [members, setMembers] = useState<Array<Member>>();
  const [memberOptions, setMemberOptions] = useState<Array<Option>>();
  const [products, setProducts] = useState<Array<Product>>();
  const [productOptions, setProductOptions] = useState<Array<Option>>();
  const [selectedMemberOption, setSelectedMemberOption] = useState<Option>();
  const [selectedProductOption, setSelectedProductOption] = useState<Option>();
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
  const [quantity, setQuantity] = useState<number>(1);
  const [payments, setPayments] = useState<Array<ProductPayment>>();
  const [displayPayments, setDisplayPayments] = useState<Array<ProductPayment>>();
  const [searchUser, setSearchUser] = useState<string>('');
  const router = useRouter();

  async function generatePayments() {
    let payments: Array<ProductPayment> = await getProductPayments(
      currentMonth.value,
      currentYear.value
    );
    setPayments(payments);
    setDisplayPayments(payments);
  }

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setQuantity(Number.parseInt(value));
  };

  function newPayment() {
    onOpen();
  }

  const searchProducts = () => {
    const filteredProducts = payments?.filter((payment) =>
       payment.member.name.first_name.toLowerCase().includes(searchUser.toLowerCase())
    );
    setDisplayPayments(filteredProducts);
  }

  async function updateProductAvailability(selectedProduct: Product) {
    const product = await getProductById(selectedProduct?.product_id as string);

    if (product != null && product.available_stock > 0) {
      await updateProductCount(product?.product_id as string, {
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
    const member: Member = members?.find(
      (member) => member.docId == selectedMemberOption?.id
    )!;
    const product: Product = products?.find(
      (product) => product.product_id == selectedProductOption?.id
    )!;

    await addProductPayment({
      member: member,
      product: product,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      status: "Due",
      quantity: quantity,
      total: product != null ? product.price * quantity : 0,
      due: product != null ? product.price * quantity : 0,
    });
    updateProductAvailability(product);
    generatePayments();
    onClose();
  }

  const updateMemberOption = (value: any) => {
    setSelectedMemberOption(value);
  };

  const updateProductOption = (value: any) => {
    setSelectedProductOption(value);
  };

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
    setProducts(products);

    const memberOptions: Array<Option> = [];
    members.forEach((member) => {
      memberOptions.push({
        label: member.name.first_name,
        value: member.name.first_name,
        id: member.docId!,
      });
    });
    setMemberOptions(memberOptions);

    const productOptions: Array<Option> = [];
    products.forEach((product) => {
      productOptions.push({
        label: product.name,
        value: product.name,
        id: product.product_id!,
      });
    });
    setProductOptions(productOptions);
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
            <Input placeholder='Search User' width={500} onChange={(event) => setSearchUser(event.target.value)}/>  
            <IconButton aria-label='Search database' icon={<IoSearch />} onClick={searchProducts} />          
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
                {displayPayments?.map((payment) => (
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
              {displayPayments?.map((payment) => (
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
              <Select
                name="members"
                options={memberOptions}
                placeholder="Select member..."
                closeMenuOnSelect={false}
                value={selectedMemberOption}
                onChange={updateMemberOption}
              />
              {/* <Box
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
              </Box> */}
            </FormControl>
            <FormControl>
              <FormLabel>Product</FormLabel>
              <Select
                name="products"
                options={productOptions}
                placeholder="Select membership program..."
                closeMenuOnSelect={false}
                value={selectedProductOption}
                onChange={updateProductOption}
              />
              {/* <Box
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
              </Box> */}
            </FormControl>
            <FormControl>
              <FormLabel>Quantity</FormLabel>
              <Input
                name="quantity"
                onChange={handleInputChange}
                defaultValue={1}
              />
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
