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
import { Product } from "../../types";
import {
  addProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../../services/firebaseService";

function AddProduct() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const [formFields, setFormFields] = useState<Product>({
    name: "",
    price: 0,
    total_stock: 0,
    available_stock: 0,
  });

  async function addOrUpdateProduct() {
    const product: Product = {
      name: formFields.name,
      price: Number.parseInt(formFields.price.toString()),
      total_stock: Number.parseInt(formFields.total_stock.toString()),
      available_stock: Number.parseInt(formFields.available_stock.toString()),
    };

    router.query.formType === "new"
      ? await addProduct(product)
      : await updateProduct(router.query.productId as string, product);
    router.back();
  }

  async function removeProduct() {
    await deleteProduct(router.query.productId as string);
    router.back();
  }

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormFields((prevState) => ({ ...prevState, [name]: value }));
  };

  async function getEditableProduct() {
    const id: string = router.query.productId as string;
    const product: Product = await getProductById(id);

    setFormFields({
      name: product.name,
      price: product.price,
      total_stock: product.total_stock,
      available_stock: product.available_stock,
    });
  }

  useEffect(() => {
    router.query.formType === "edit" && getEditableProduct();
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
            New Product
          </Text>
          <HStack>
            <Button
              onClick={addOrUpdateProduct}
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
                            removeProduct();
                            onClose();
                          }}
                          ml={3}
                        >
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>{" "}
              </>
            ) : null}
          </HStack>
          <Grid templateColumns="repeat(4, 1fr)" gap={{ base: 2, sm: 6 }}>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  focusBorderColor="black"
                  placeholder="Product Name"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.name}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Price</FormLabel>
                <Input
                  name="price"
                  focusBorderColor="black"
                  placeholder="Product Price"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.price}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Total Stock</FormLabel>
                <Input
                  name="total_stock"
                  type="tel"
                  focusBorderColor="black"
                  placeholder="Total Product bought"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.total_stock}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
              <FormControl isRequired>
                <FormLabel>Available Stock</FormLabel>
                <Input
                  name="available_stock"
                  focusBorderColor="black"
                  placeholder="City"
                  size="lg"
                  onChange={handleInputChange}
                  value={formFields.available_stock}
                />
              </FormControl>
            </GridItem>
          </Grid>
        </Stack>
      </Box>
    </>
  );
}

export default AddProduct;
