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
  Link,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  IoChevronDownOutline,
  IoSearchOutline,
  IoFilter,
  IoAdd,
  IoPencil,
} from "react-icons/io5";
import React, { useEffect, useState } from "react";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { database } from "../../firebaseConfig";
import { useRouter } from "next/router";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";

interface Name {
  first_name: string;
  last_name: string;
}

interface Address {
  city: string;
  state: string;
  country: string;
}

interface Member {
  docId: string;
  name: Name;
  email: string;
  mobile_phone: number;
  joining_date: Date;
  address: Address;
}

interface MembershipPrograms {
  membershipProgramId: string;
  name: string;
}

function Members() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [membershipPrograms, setMembershipPrograms] =
    useState<Array<MembershipPrograms>>();
  const [selectedMembershipProgram, setSelectedMembershipProgram] =
    useState<MembershipPrograms>();
  const [members, setMembers] = useState<Array<Member>>();
  const router = useRouter();

  // async function getAllMembers() {
  //   const querySnapshot = await getDocs(collection(database, "members"))
  //   let temp: Array<Member> = []
  //   querySnapshot.forEach((doc) => {
  //     temp.push({
  //       id: doc.data().id,
  //       name: {
  //         first_name: doc.data().name.first_name,
  //         last_name: doc.data().name.last_name
  //       },
  //       email: doc.data().email,
  //       mobile_phone: doc.data().mobile_phone,
  //       joining_date: new Date(doc.data().joining_date.seconds*1000),
  //       address: {
  //         city: doc.data().address.city,
  //         state: doc.data().address.state,
  //         country: doc.data().address.country
  //       }
  //     })
  //   });
  //   setMembers(temp)
  // }

  async function getMembers() {
    let membershipProgramId: string =
      selectedMembershipProgram?.membershipProgramId ?? "";
    const q = query(
      collection(database, "members"),
      where("membership_program", "==", membershipProgramId)
    );
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
      });
    });
    setMembers(temp);
  }

  async function getMembershipPrograms() {
    const querySnapshot = await getDocs(
      query(collection(database, "membership_programs"), orderBy("name"))
    );
    let temp: Array<MembershipPrograms> = [];
    querySnapshot.forEach((doc) => {
      temp.push({
        membershipProgramId: doc.id,
        name: doc.data().name,
      });
    });
    setMembershipPrograms(temp);
    setSelectedMembershipProgram(temp[0]);
  }

  useEffect(() => {
    getMembershipPrograms();
    //getAllMembers();
  }, []);

  useEffect(() => {
    getMembers();
  }, [selectedMembershipProgram]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav navIndex={2} />
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={2} />
        </Box>
      )}
      <Box pl={{ base: "20%", sm: "18%" }} w="98vw">
        <Stack direction="column" spacing={8} px={[2, null, 10]} py={10}>
          <Text as="b" fontSize="2xl" color="black">
            Gym Members
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
                {selectedMembershipProgram?.name}
              </MenuButton>
              <MenuList>
                {membershipPrograms?.map((program) => (
                  <MenuItem
                    key={program.membershipProgramId}
                    onClick={() => setSelectedMembershipProgram(program)}
                  >
                    {program.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Spacer />
            {!isMobile ? (
              <Button
                rightIcon={<IoAdd size="26" />}
                colorScheme="blackAlpha"
                bgColor="black"
                variant="solid"
                onClick={() =>
                  router.push({
                    pathname: "../members/add",
                    query: { formType: "new", memberId: "" },
                  })
                }
              >
                Add
              </Button>
            ) : (
              <IconButton
                aria-label="Add Product Payment"
                icon={<IoAdd size={24} />}
                colorScheme="blackAlpha"
                bgColor="black"
                variant="solid"
                onClick={() =>
                  router.push({
                    pathname: "../members/add",
                    query: { formType: "new", memberId: "" },
                  })
                }
              />
            )}
          </HStack>
          {!isMobile ? (
            <Table>
              <Thead>
                <Tr>
                  <Th>NAME</Th>
                  <Th>ADDRESS</Th>
                  <Th>PHONE</Th>
                  <Th>EMAIL</Th>
                  <Th>JOINED ON</Th>
                  <Th width="20"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {members?.map((member) => (
                  <Tr color="black" key={member.docId}>
                    <Td>
                      {member.name.first_name + " " + member.name.last_name}
                    </Td>
                    <Td>
                      {member.address.city +
                        ", " +
                        member.address.state +
                        ", " +
                        member.address.country}
                    </Td>
                    <Td>{member.mobile_phone}</Td>
                    <Td>{member.email}</Td>
                    <Td>
                      {member.joining_date.getDate() +
                        "-" +
                        member.joining_date.getMonth() +
                        "-" +
                        member.joining_date.getFullYear()}
                    </Td>
                    <Td>
                      <Button
                        rightIcon={<IoPencil size="16" />}
                        colorScheme="blackAlpha"
                        variant="outline"
                        onClick={() =>
                          router.push({
                            pathname: "../members/add",
                            query: { formType: "edit", memberId: member.docId },
                          })
                        }
                      >
                        Edit
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <SimpleGrid columns={1} spacing={4}>
              {members?.map((member) => (
                <Box
                  key={member.docId}
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
                      pathname: "../members/add",
                      query: { formType: "edit", memberId: member.docId },
                    })
                  }
                >
                  <Stack direction="column" px={6} py={4}>
                    <Text fontSize="md" color="black" fontWeight="bold">
                      {member.name.first_name + " " + member.name.last_name}
                    </Text>
                    <Text fontSize="sm" color="black">
                      {member.address.city +
                        ", " +
                        member.address.state +
                        ", " +
                        member.address.country}
                    </Text>
                    <Text fontSize="sm" color="black">
                      {"Phone : " + member.mobile_phone}
                    </Text>
                    <Text fontSize="sm" color="black">
                      {"Joined On : " +
                        member.joining_date.getDate() +
                        "-" +
                        member.joining_date.getMonth() +
                        "-" +
                        member.joining_date.getFullYear()}
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

export default Members;
