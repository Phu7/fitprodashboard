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
import { Member, MembershipProgram } from "../../types";
import {
  getAllMembershipPrograms,
  getMembersForMembership,
} from "../../services/firebaseService";
import NavigationBar from "../../components/NavigationBar";

function Members() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [membershipPrograms, setMembershipPrograms] =
    useState<Array<MembershipProgram>>();
  const [selectedMembershipProgram, setSelectedMembershipProgram] =
    useState<MembershipProgram>();
  const [members, setMembers] = useState<Array<Member>>();
  const router = useRouter();

  async function getMembers() {
    let membershipProgramId: string =
      selectedMembershipProgram?.membershipProgramId ?? "";

    let members: Array<Member> = await getMembersForMembership(
      membershipProgramId
    );
    setMembers(members);
  }

  async function getMembershipPrograms() {
    let membershipPrograms: Array<MembershipProgram> =
      await getAllMembershipPrograms();
    membershipPrograms.push({
      membershipProgramId: "",
      name: "All Other Members",
      price: 0,
    });
    setMembershipPrograms(membershipPrograms);
    setSelectedMembershipProgram(membershipPrograms[membershipPrograms.length - 1]);
  }

  useEffect(() => {
    getMembershipPrograms();
  }, []);

  useEffect(() => {
    getMembers();
  }, [selectedMembershipProgram]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <NavigationBar navIndex={3} />
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
