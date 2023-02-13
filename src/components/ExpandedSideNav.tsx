import { Box, Button, Container, SimpleGrid, Spacer, Stack, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import {
  IoBarChartOutline,
  IoPeopleOutline,
  IoCardOutline,
  IoSettingsOutline,
  IoPowerOutline,
  IoBagHandleOutline,
  IoOptions,
} from "react-icons/io5";
import { useRouter } from "next/router";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

function ExpandedSideNav({navIndex}: {navIndex: number}) {
  //const navIndex = useSelector((state: RootState) => state.navIndex.value);
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
      borderRight="2px"
      borderColor="gray.200"
    >
      <Stack direction="column" spacing={4} display="flex" flex={1}>
        {/* <Container w="250px" mb="10">
          <Image src={BFITImage} height="70px" width="120px"/>
          Dashboard
        </Container> */}
        {/* <Button
          leftIcon={<IoBarChartOutline size='26'/>}
          colorScheme={navIndex===1?"":"blackAlpha"}
          bgColor={navIndex===1?"black":""}
          variant={navIndex===1?"solid":"ghost"}
          height="10%"
          iconSpacing='8'
          onClick={() => {dispatch(setNavIndex(1));router.replace('../dashboard')}}
          pr="14"
        >
          <Text fontSize='xl'>Dashboard</Text>
        </Button> */}
        <Button
          leftIcon={<IoOptions size="26" />}
          colorScheme={navIndex === 1 ? "" : "blackAlpha"}
          bgColor={navIndex === 1 ? "black" : ""}
          variant={navIndex === 1 ? "solid" : "ghost"}
          height="10%"
          iconSpacing="8"
          onClick={() => {
            router.replace("../programs");
          }}
          pr="14"
        >
          <Text fontSize="xl">Programs</Text>
        </Button>
        <Button
          leftIcon={<IoPeopleOutline size="26" />}
          colorScheme={navIndex === 2 ? "" : "blackAlpha"}
          bgColor={navIndex === 2 ? "black" : ""}
          variant={navIndex === 2 ? "solid" : "ghost"}
          height="10%"
          iconSpacing="8"
          onClick={() => {
            router.replace("../members");
          }}
          pr="14"
        >
          <Text fontSize="xl">Members</Text>
        </Button>
        <Button
          leftIcon={<IoBagHandleOutline size="26" />}
          colorScheme={navIndex === 3 ? "" : "blackAlpha"}
          bgColor={navIndex === 3 ? "black" : ""}
          variant={navIndex === 3 ? "solid" : "ghost"}
          height="10%"
          iconSpacing="8"
          onClick={() => {
            router.replace("../products");
          }}
          pr="14"
        >
          <Text fontSize="xl">Products</Text>
        </Button>
        <Button
          leftIcon={<IoCardOutline size="26" />}
          colorScheme={navIndex === 4 ? "" : "blackAlpha"}
          bgColor={navIndex === 4 ? "black" : ""}
          variant={navIndex === 4 ? "solid" : "ghost"}
          height="10%"
          iconSpacing="8"
          onClick={() => {
            router.replace("../payments");
          }}
          pr="14"
        >
          <Text fontSize="xl">Payments</Text>
        </Button>
        <Button
          leftIcon={<IoSettingsOutline size="26" />}
          colorScheme={navIndex === 5 ? "" : "blackAlpha"}
          bgColor={navIndex === 5 ? "black" : ""}
          variant={navIndex === 5 ? "solid" : "ghost"}
          height="10%"
          iconSpacing="8"
          onClick={() => {
            router.replace("../settings");
          }}
          pr="14"
        >
          <Text fontSize="xl">Settings</Text>
        </Button>
        <Spacer />
        <Button
          leftIcon={<IoPowerOutline size="26" />}
          colorScheme="blackAlpha"
          variant="ghost"
          height="10%"
          iconSpacing="8"
          pr="14"
          onClick={() => LogOut()}
        >
          <Text fontSize="xl">Logout</Text>
        </Button>
      </Stack>
    </SimpleGrid>
  );
}

export default ExpandedSideNav;
