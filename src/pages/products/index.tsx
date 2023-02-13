import {
  Avatar,
  Box,
  Button,
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
} from "@chakra-ui/react";
import { IoPencil } from "react-icons/io5";
import React, { useState, useEffect } from "react";
import {
  IoChevronDownOutline,
  IoSearchOutline,
  IoFilter,
  IoAdd,
} from "react-icons/io5";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import {
  collection,
  Firestore,
  getDocs,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";
import { database } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";

interface Product {
  product_id: string;
  name: string;
  total_stock: number;
  available_stock: number;
  price: number;
}

function Products() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [productAvailability, setProductAvailability] =
    useState<string>("In Stock");
  const [products, setProducts] = useState<Array<Product>>();
  const router = useRouter()

  async function getProducts() {
    const q =
      productAvailability === "In Stock"
        ? query(
            collection(database, "products"),
            where("available_stock", ">", 0)
          )
        : query(
            collection(database, "products"),
            where("available_stock", "==", 0)
          );
    const querySnapshot = await getDocs(q);
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
  }

  useEffect(() => {
    getProducts();
  }, [productAvailability]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav navIndex={3}/>
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={3}/>
        </Box>
      )}
      <Box pl={{ base: "20%", sm: "18%" }} w="98vw">
        <Stack direction="column" spacing={8} px={[2, null, 10]} py={10}>
          <Text as="b" fontSize="2xl" color="black">
            Products
          </Text>
          <HStack>
            <Menu>
              <MenuButton
                isActive="true"
                as={Button}
                rightIcon={<IoChevronDownOutline />}
                bgColor="blackAlpha.100"
                color="blackAlpha.600"
                _hover={{ bgColor: "blackAlpha.300" }}
                _expanded={{ bg: "blackAlpha.300" }}
              >
                {productAvailability}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setProductAvailability("In Stock")}>
                  In Stock
                </MenuItem>
                <MenuItem
                  onClick={() => setProductAvailability("Out of Stock")}
                >
                  Out of Stock
                </MenuItem>
              </MenuList>
            </Menu>
            <Spacer />
            <Button
              rightIcon={<IoAdd size="26" />}
              colorScheme="blackAlpha"
              bgColor="black"
              variant="solid"
              onClick={() =>  router.push({pathname: '../products/add', query: { formType: 'new', productId: ''}})}
            >
              Add
            </Button>
          </HStack>
          {!isMobile ? (
          <Table>
            <Thead>
              <Tr>
                <Th>Product</Th>
                <Th>PRICE</Th>
                <Th>Total Stock</Th>
                <Th>Available Stock</Th>
                <Th w="20"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {products?.map((product) => (
                <Tr key={product.product_id} color="black">
                  <Td>{product.name}</Td>
                  <Td>{product.price}</Td>
                  <Td>{product.total_stock}</Td>
                  <Td>{product.available_stock}</Td>
                  <Td>
                    <Button
                      rightIcon={<IoPencil size="16" />}
                      colorScheme="blackAlpha"
                      variant="outline"
                      onClick={() => router.push({pathname: '../products/add', query: { formType: 'edit', productId: product.product_id}})}
                    >
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>) : 
          (
            <SimpleGrid columns={1} spacing={4}>
              {products?.map((product) => (
                <Box
                  key={product.product_id}
                  display="flex"
                  alignItems="center"
                  borderRadius="xl"
                  boxShadow="2xl"
                  _hover={{
                    boxShadow: "xl",
                    color: "gray",
                    cursor: 3,
                  }}
                  onClick={() => router.push({pathname: '../products/add', query: { formType: 'edit', productId: product.product_id}})}
                >
                  <Stack direction="column" px={6} py={4}>
                    <Text fontSize="md" color="black" fontWeight="bold">
                      {product.name}
                    </Text>
                    <Text fontSize="sm" color="black">
                      {product.price}
                    </Text>
                    <Text fontSize="sm" color="black">
                      {"Total : " + product.total_stock}
                    </Text>
                    <Text fontSize="sm" color="black">
                      {"Available : " + product.available_stock}
                    </Text>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Box>
    </>
  );
}

export default Products;
