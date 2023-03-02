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
  import SideNav from "../../components/SideNav";
  
  interface Payment {
    memberName: string;
    productName: string;
    quantity: number;
    total: number;
    due: number;
    paid: number;
    status: string;
  }
  
  function EditProductPayment() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef(null);
    const [isMobile] = useMediaQuery("(max-width: 768px)");
    const router = useRouter();
    const [formFields, setFormFields] = useState<Payment>({
      memberName: "",
      productName: "",
      quantity: 0,
      total: 0,
      due: 0,
      paid: 0,
      status: "",
    });
  
    async function addPayment() {
      router.query.formType === "new"
        ? null
        : // ? await addDoc(collection(database, "products"), {
          //     name: formFields.name,
          //     price: Number.parseInt(formFields.price.toString()),
          //     total_stock: Number.parseInt(formFields.total_stock.toString()),
          //     available_stock: Number.parseInt(
          //       formFields.available_stock.toString()
          //     ),
          //   })
          await updateDoc(
            doc(
              database,
              "product_payments",
              router.query.paymentId as string
            ),
            {
              due : formFields.due != 0 ? formFields.due - formFields.paid : 0,
              status: formFields.due - formFields.paid == 0 ? "Paid" : "Due",
            }
          );
      router.back();
    }
  
    async function delePayment() {
      await deleteDoc(
        doc(database, "product_payments", router.query.paymentId as string)
      );
      router.back();
    }
  
    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setFormFields((prevState) => ({ ...prevState, [name]: value }));
      };    
  
    async function getEditablePayment() {
      let id: string = router.query.paymentId as string;
      const docRef = doc(database, "product_payments", id);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        setFormFields({
          memberName:
            docSnapshot.data().member.name.first_name +
            " " +
            docSnapshot.data().member.name.last_name,
          productName : docSnapshot.data().product.name,
          quantity: docSnapshot.data().quantity,
          total: docSnapshot.data().total,
          due: docSnapshot.data().due,
          paid: docSnapshot.data().paid,
          status: docSnapshot.data().status,
        });
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
  
    useEffect(() => {
      router.query.formType === "edit" && getEditablePayment();
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
              Edit Payment
            </Text>
            <HStack>
              <Button
                onClick={addPayment}
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
                              delePayment();
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
                  <FormLabel>Member</FormLabel>
                  <Button width="100%">
                    <Text color="gray.400">{formFields.memberName}</Text>
                  </Button>
                </FormControl>
              </GridItem>
              <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
                <FormControl>
                  <FormLabel>Product</FormLabel>
                  <Button width="100%">
                    <Text color="gray.400">{formFields.productName}</Text>
                  </Button>
                </FormControl>
              </GridItem>
              <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
                <FormControl>
                  <FormLabel>Total Amount</FormLabel>
                  <Button width="100%">
                    <Text color="gray.400">{formFields.total}</Text>
                  </Button>
                </FormControl>
              </GridItem>
              <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
                <FormControl>
                  <FormLabel>Due</FormLabel>
                  <Button width="100%">
                    <Text color="gray.400">{formFields.due.toString()}</Text>
                  </Button>
                </FormControl>
              </GridItem>
              <GridItem colSpan={{ base: 4, sm: 2 }} mt={{ sm: 4 }}>
                <FormControl isRequired>
                  <FormLabel>Paid</FormLabel>
                  <Input
                    name="paid"
                    focusBorderColor="black"
                    size="lg"
                    onChange={handleInputChange}
                    placeholder="Payment Value"
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </Stack>
        </Box>
      </>
    );
  }
  
  export default EditProductPayment;
  