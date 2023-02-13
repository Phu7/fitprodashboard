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
} from "@chakra-ui/react";
import {
  IoChevronDownOutline,
  IoSearchOutline,
  IoFilter,
  IoAdd,
} from "react-icons/io5";
import React, { useState } from "react";
import ExpandedSideNav from "../../components/ExpandedSideNav";

function Dashboard() {
  const [filterType, setFilterType] = useState<number>(1);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(1);

  return (
    <>
      <Box pl="18%" w="98vw">
        <Stack direction="column" spacing={6} p="10">
          <Text as="b" fontSize="2xl" color="black">
            Dashboard
          </Text>
          <HStack spacing={4}>
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
          </HStack>
          <SimpleGrid
            minChildWidth="120px"
            spacing="80px"
            height="450"
            py="120"
            px="10"
          >
            <Box bgColor="purple.200" height="100%" borderRadius="3xl" boxShadow="2xl">
              <VStack height="100%" justifyContent="center">
                <Text fontSize="xl" color="blackAlpha.600">
                  Total Members
                </Text>
                <Text as="b" fontSize="5xl">
                  32
                </Text>
              </VStack>
            </Box>
            <Box bgColor="teal"  height="100%" borderRadius="3xl" boxShadow="2xl">
              <VStack height="100%" justifyContent="center">
                <Text fontSize="xl" color="blackAlpha.600">
                  Total Payment
                </Text>
                <Text as="b" fontSize="5xl">
                  40K
                </Text>
              </VStack>
            </Box>
            <Box bgColor="red.200" height="100%" borderRadius="3xl" boxShadow="2xl">
              <VStack height="100%" justifyContent="center">
                <Text fontSize="xl" color="blackAlpha.600">
                  Pending Payment
                </Text>
                <Text as="b" fontSize="5xl">
                  30K
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
