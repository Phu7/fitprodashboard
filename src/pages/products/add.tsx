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
} from "@chakra-ui/react";
import { addDoc, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  IoAdd,
  IoChevronDownOutline,
  IoSave,
  IoSaveOutline,
} from "react-icons/io5";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import { database } from "../../firebaseConfig";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";

interface Product {
  name: string;
  price: number;
  total_stock: number;
  available_stock: number;
}

function add() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const [formFields, setFormFields] = useState<Product>({
    name: "",
    price: 0,
    total_stock: 0,
    available_stock: 0,
   });

  async function addProduct() {
    router.query.formType === "new" ?
    await addDoc(collection(database, "products"), {
      name: formFields.name,
      price : Number.parseInt(formFields.price.toString()),
      total_stock : Number.parseInt(formFields.total_stock.toString()),
      available_stock : Number.parseInt(formFields.available_stock.toString())
    })
    :
    await updateDoc(doc(database, "products", router.query.productId as string), {
      name: formFields.name,
      price : Number.parseInt(formFields.price.toString()),
      total_stock : Number.parseInt(formFields.total_stock.toString()),
      available_stock : Number.parseInt(formFields.available_stock.toString())
    })
  }

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setFormFields(prevState => ({ ...prevState, [name]: value }))
  }

  async function getEditableProduct() {
    let id: string = router.query.productId as string
    const docRef = doc(database, "products", id)
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      setFormFields({
        name: docSnapshot.data().name,
        price: docSnapshot.data().price,
        total_stock: docSnapshot.data().total_stock,
        available_stock: docSnapshot.data().available_stock
      })
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  useEffect(() => {
    router.query.formType === "edit" && getEditableProduct();
  }, []);

  return (
    <>
     {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav />
        </Box>
      ) : (        
        <Box width="18%" pos="fixed" >
          <SideNav />
        </Box>
      )}
      <Box pl="18%" w="98vw">
        <Stack direction="column" spacing={8} px={[2, null, 10]} py={10}>
          <Text as="b" fontSize="2xl" color="black">
            New Product
          </Text>
          <HStack>
            <Button
              onClick={addProduct}
              leftIcon={<IoSave size="20" />}
              colorScheme="blackAlpha"
              variant="outline"
            >
              <Text fontSize="lg" color="black">
                Save
              </Text>
            </Button>
            <Button
              leftIcon={<IoAdd size="26" />}
              colorScheme="blackAlpha"
              variant="outline"
            >
              <Text fontSize="lg" color="black">
                New
              </Text>
            </Button>
          </HStack>
          <Grid templateColumns="repeat(4, 1fr)" gap={{base:2, sm:6}}>
            <GridItem colSpan={{base:4, sm:2}} mt={{sm:4}}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  focusBorderColor="black"
                  placeholder="Product Name"
                  size="lg"
                  onChange={handleInputChange}
                  value = {formFields.name}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{base:4, sm:2}} mt={{sm:4}}>
              <FormControl isRequired>
                <FormLabel>Price</FormLabel>
                <Input
                  name="price"
                  focusBorderColor="black"
                  placeholder="Product Price"
                  size="lg"
                  onChange={handleInputChange}
                  value = {formFields.price}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{base:4, sm:2}} mt={{sm:4}}>
              <FormControl isRequired>
                <FormLabel>Total Stock</FormLabel>
                <Input
                  name="total_stock"
                  type="tel"
                  focusBorderColor="black"
                  placeholder="Total Product bought"
                  size="lg"
                  onChange={handleInputChange}
                  value = {formFields.total_stock}
                />
              </FormControl>
            </GridItem>
            <GridItem colSpan={{base:4, sm:2}} mt={{sm:4}}>
              <FormControl isRequired>
                <FormLabel>Available Stock</FormLabel>
                <Input name="available_stock" focusBorderColor="black" placeholder="City" size="lg" 
                  onChange={handleInputChange}
                  value = {formFields.available_stock}/>
              </FormControl>
            </GridItem>
          </Grid>
        </Stack>
      </Box>
    </>
  );
}

export default add;
