import { Box, Button, Container, SimpleGrid, Spacer, Stack, Text } from "@chakra-ui/react";
import React from "react";
import {
  IoBarChartOutline,
  IoPeopleOutline,
  IoCardOutline,
  IoSettingsOutline,
  IoPowerOutline,
  IoBagHandleOutline,
  IoOptions,
} from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import Image from "next/image";
import BFITImage from "../../public/BFitLogo.svg";

function SideNav({navIndex}: {navIndex: number}) {
  const router = useRouter();

  const LogOut = () => {
    signOut(auth)
      .then(() => {
        router.replace("../login");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <SimpleGrid
      w="100%"
      h="100vh"
      pt="10"
      pb="10"
      px="4"
      borderColor="gray.200"
    >
      <Stack direction="column" spacing={4} display="flex" flex={1} >
        <Button
          leftIcon={<IoOptions size="26" />}
          colorScheme={navIndex === 1 ? "" : "blackAlpha"}
          bgColor={navIndex === 1 ? "black" : ""}
          variant={navIndex === 1 ? "solid" : "ghost"}
          height="6%"
          pl="25px"
          onClick={() => {
            router.replace("../programs");
          }}
          width="50px"
        />
        <Button
          leftIcon={<IoPeopleOutline size="26" />}
          colorScheme={navIndex === 2 ? "" : "blackAlpha"}
          bgColor={navIndex === 2 ? "black" : ""}
          variant={navIndex === 2 ? "solid" : "ghost"}
          height="6%"
          pl="25px"
          onClick={() => {
            router.replace("../members");
          }}
          width="50px"
        />
        <Button
          leftIcon={<IoBagHandleOutline size="26" />}
          colorScheme={navIndex === 3 ? "" : "blackAlpha"}
          bgColor={navIndex === 3 ? "black" : ""}
          variant={navIndex === 3 ? "solid" : "ghost"}
          height="6%"
          pl="25px"
          onClick={() => {
            router.replace("../products");
          }}
          width="50px"
        />
        <Button
          leftIcon={<IoCardOutline size="26" />}
          colorScheme={navIndex === 4 ? "" : "blackAlpha"}
          bgColor={navIndex === 4 ? "black" : ""}
          variant={navIndex === 4 ? "solid" : "ghost"}
          height="6%"
          pl="25px"
          onClick={() => {
            router.replace("../payments");
          }}
          width="50px"
        />
        <Button
          leftIcon={<IoSettingsOutline size="26" />}
          colorScheme={navIndex === 5 ? "" : "blackAlpha"}
          bgColor={navIndex === 5 ? "black" : ""}
          variant={navIndex === 5 ? "solid" : "ghost"}
          height="6%"
          pl="25px"
          onClick={() => {
            router.replace("../settings");
          }}
          width="50px"
        />
        <Spacer />
        <Button
          leftIcon={<IoPowerOutline size="26" />}
          colorScheme="blackAlpha"
          variant="ghost"
          height="6%"
          pl="25px"
          onClick={() => LogOut()}
          width="50px"
        />
      </Stack>
    </SimpleGrid>
  );
}

export default SideNav;
