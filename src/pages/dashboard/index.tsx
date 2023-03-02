import {
  Box,
  Center,
  Flex,
  Square,
  Stack,
  Table,
  TableCaption,
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
  SimpleGrid,
  VStack,
  useMediaQuery,
} from "@chakra-ui/react";
import {
  IoChevronDownOutline,
  IoBarChart,
  IoFilter,
  IoAdd,
} from "react-icons/io5";
import React, { useEffect, useState } from "react";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import SideNav from "../../components/SideNav";
import { collection, getDocs, query } from "firebase/firestore";
import { database } from "../../firebaseConfig";

interface Name {
  first_name: string;
  last_name: string;
}

interface Address {
  city: string;
  state: string;
  country: string;
}

interface MembershipPrograms {
  membershipProgramId: string;
  name: string;
}

interface Member {
  docId: string;
  name: Name;
  email: string;
  mobile_phone: number;
  joining_date: Date;
  address: Address;
  membership_program: MembershipPrograms;
}

function Dashboard() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [filterType, setFilterType] = useState<number>(1);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(1);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [generalTrainedMembers, setGeneralTrainedMembers] = useState<number>(0);
  const [personalTrainedMembers, setPersonalTrainedMembers] = useState<number>(0);

  async function getAllMembers() {
    const q = query(collection(database, "members"));
    const querySnapshot = await getDocs(q);
    let temp: Array<Member> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        docId: doc.id,
        name: {
          first_name: doc.data().name.first_name,
          last_name: doc.data().name.last_name,
        },
        email: doc.data().email,
        mobile_phone: doc.data().mobile_phone,
        joining_date: new Date(doc.data().joining_date),
        address: {
          city: doc.data().address.city,
          state: doc.data().address.state,
          country: doc.data().address.country,
        },
        membership_program: doc.data().membership_program
      });
    });

    let personalTrainedMembers = temp.filter(member => {
      return member.membership_program.name == "Personal Training"
    })
    let generalTrainedMembers = temp.filter(member => {
      return member.membership_program.name == "General Training"
    })    
    setPersonalTrainedMembers(personalTrainedMembers.length)
    setGeneralTrainedMembers(generalTrainedMembers.length)
    setTotalMembers(temp.length)
  }

  useEffect(() => {
    getAllMembers()
  },[])

  return (
    <>
      {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav navIndex={1} />
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={1} />
        </Box>
      )}
      <Box pl="18%" w="98vw">
        <Stack direction="column" spacing={6} p="10">
          <Text as="b" fontSize="2xl" color="black">
            Dashboard
          </Text>
          {/* <HStack spacing={4}>
            <Menu>
              <MenuButton
                isActive="true"
                as={Button}
                rightIcon={<IoChevronDownOutline />}
                bgColor="blackAlpha.100"
                color="blackAlpha.600"
              >
                {filterType === 1 ? "Monthly" : "Yearly"}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setFilterType(1)}>Monthly</MenuItem>
                <MenuItem onClick={() => setFilterType(2)}>Yearly</MenuItem>
              </MenuList>
            </Menu>
            {filterType === 1 && (
              <Menu>
                <MenuButton
                  isActive="true"
                  as={Button}
                  rightIcon={<IoChevronDownOutline />}
                  variant="outline"
                >
                  {month === 1 ? "January" : "February"}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setMonth(1)}>January</MenuItem>
                  <MenuItem onClick={() => setMonth(2)}>February</MenuItem>
                </MenuList>
              </Menu>
            )}
            <Menu>
              <MenuButton
                isActive="true"
                as={Button}
                rightIcon={<IoChevronDownOutline />}
                variant="outline"
              >
                {year === 1 ? "2022" : "2021"}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setYear(1)}>2022</MenuItem>
                <MenuItem onClick={() => setYear(2)}>2021</MenuItem>
              </MenuList>
            </Menu>
          </HStack> */}
          <SimpleGrid
            minChildWidth="120px"
            spacing="10"
            height={{ base: "600", sm: "450" }}
            py={{ base: "10", sm: "120" }}
            px={{ base: "2", sm: "10" }}
          >
            <Box
              bgColor="purple.200"
              height="100%"
              borderRadius="3xl"
              boxShadow="2xl"
            >
              <VStack height="100%" justifyContent="center">
                <Text fontSize="xl" color="blackAlpha.600">
                  Total Members
                </Text>
                <Text as="b" fontSize="5xl">
                  {totalMembers}
                </Text>
              </VStack>
            </Box>
            <Box
              bgColor="teal"
              height="100%"
              borderRadius="3xl"
              boxShadow="2xl"
            >
              <VStack height="100%" justifyContent="center">
                <Text fontSize="xl" color="blackAlpha.600">
                  Personal Training
                </Text>
                <Text as="b" fontSize="5xl">
                  {personalTrainedMembers}
                </Text>
              </VStack>
            </Box>
            <Box
              bgColor="red.200"
              height="100%"
              borderRadius="3xl"
              boxShadow="2xl"
            >
              <VStack height="100%" justifyContent="center">
                <Text fontSize="xl" color="blackAlpha.600">
                  General Training
                </Text>
                <Text as="b" fontSize="5xl">
                  {generalTrainedMembers}
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </Stack>
      </Box>
    </>
  );
}

export default Dashboard;
