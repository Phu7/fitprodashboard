import React, { useState } from "react";
import Lottie from "lottie-react";
import Gym from "../../../public/gym.json";
import { IoLockClosed, IoPerson } from "react-icons/io5";
import { auth } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { LoginFormFields } from "../../types";
import { lottieStyle } from "../../styles/loginStyles";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Show,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

function Login() {
  const router = useRouter();
  const [loginError, setLoginError] = useState<boolean>(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>();
  const [formFields, setFormFields] = useState<LoginFormFields>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormFields((prevState) => ({ ...prevState, [name]: value }));
  };

  const Login = async () => {
    setPersistence(auth, browserLocalPersistence).then(() => {
      signInWithEmailAndPassword(auth, formFields.email, formFields.password)
        .then((userCredential) => {
          const user = userCredential.user;
          if (user !== null) {
            setLoginError(false);
            router.replace("../programs");
          }
        })
        .catch((error) => {
          setLoginError(true);
          const errorCode = error.code;
          if (error.code === "auth/user-not-found")
            setLoginErrorMessage("User not found");
          if (error.code === "auth/invalid-email")
            setLoginErrorMessage("Invalid Email");
          if (error.code === "auth/wrong-password")
            setLoginErrorMessage("Password Incorrect");
        });
    });
  };

  return (
    <>
      {loginError && (
        <Alert status="error">
          <AlertIcon />
          {loginErrorMessage}
        </Alert>
      )}
      <Flex direction={{ base: "column", sm: "column", md: "row", lg: "row" }}>
        <Show above="sm">
          <Box flex="1" pt="10">
            <Lottie animationData={Gym} style={lottieStyle} />
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
              <InputLeftElement pointerEvents="none">
                <IoPerson color="black" />
              </InputLeftElement>
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
              <InputLeftElement pointerEvents="none">
                <IoLockClosed color="black" />
              </InputLeftElement>
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

export default Login;
