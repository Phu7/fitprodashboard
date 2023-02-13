import React, { useState } from "react";
import Lottie from "lottie-react";
import Gym from "../../../public/gym.json";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Show,
  Spacer,
  Square,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  IoCalendarNumber,
  IoCheckbox,
  IoLockClosed,
  IoPerson,
} from "react-icons/io5";
import {
  browserLocalPersistence,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useRouter } from "next/router";

const style = {
  height: 600,
};

interface LoginFormFields {
  email: string;
  password: string;
}

function index() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<boolean>(false);
  const [formFields, setFormFields] = useState<LoginFormFields>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormFields((prevState) => ({ ...prevState, [name]: value }));
  };

  const Login = async () => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        signInWithEmailAndPassword(
          auth,
          formFields.email,
          formFields.password
        ).then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          if (user !== null) {
            setLoginError(false);
            router.replace("../programs");
          }
          //alert("Use signed in successfully")
          // ...
        });
      })
      .catch((error) => {
        setLoginError(true);
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  return (
    <>
      {loginError && (
        <Alert status="error">
          <AlertIcon />
          Incorrect Email and Password.
        </Alert>
      )}
      <Flex direction={{ base: "column", sm: "column", md: "row", lg: "row" }}>
        <Show above="sm">
          <Box flex="1" pt="10">
            <Lottie animationData={Gym} style={style} />
          </Box>
        </Show>
        <Box flex="1">
          <Stack
            spacing={8}
            pl="30"
            pr={{ base: "10", sm: "10", lg: "60" }}
            pt="40"
          >
            <Text as="b" fontSize="3xl" color="black">
              Log In
            </Text>
            <Spacer />
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                children={<IoPerson color="black" />}
              />
              <Input
                name="email"
                placeholder="Email"
                variant="flushed"
                size="lg"
                color="black"
                onChange={handleInputChange}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                children={<IoLockClosed color="black" />}
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                variant="flushed"
                size="lg"
                color="black"
                onChange={handleInputChange}
              />
            </InputGroup>
            <Spacer />
            <HStack>
              <Button
                px="20"
                py="7"
                color="white"
                bg="black"
                size="lg"
                onClick={() => Login()}
              >
                <Text fontSize="lg">Login</Text>
              </Button>
            </HStack>
          </Stack>
        </Box>
      </Flex>
    </>
  );
}

export default index;
