import {
  Box,
  Button,
  HStack,
  Spacer,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";
import { Template } from "../../types";
import { getMessageTemplate, updateMessageTemplate } from "../../services/firebaseService";

function Settings() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [smsMessage, setSmsMessage] = useState<Template>();
  const [inputMessage, setInputMessage] = useState<string>();

  const getSMSTemplate = async () => {
    let templateMessages: Array<Template> = await getMessageTemplate("sms");
    setSmsMessage(templateMessages[0]);
  };

  const updateSMSTemplate = async () => {
    await updateMessageTemplate(smsMessage?.docId as string, {
      channel: "sms",
      message: inputMessage!,
    });
  };

  const handleInputChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setInputMessage(value);
  };

  useEffect(() => {
    getSMSTemplate();
  }, []);

  return (
    <>
      {!isMobile ? (
        <Box width="18%" pos="fixed">
          <ExpandedSideNav navIndex={6} />
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={6} />
        </Box>
      )}
      <Box pl={{ base: "20%", sm: "18%" }} w="98vw">
        <Stack direction="column" spacing={6} px={[2, null, 10]} py={10}>
          <Text as="b" fontSize="2xl" color="black">
            Settings
          </Text>
          <Text>SMS Message</Text>
          <Textarea
            onChange={handleInputChange}
            placeholder={smsMessage?.message}
            size="lg"
          />
          <HStack>
            <Spacer />
            <Button colorScheme="blue" onClick={updateSMSTemplate}>
              <Text fontSize="lg">Update</Text>
            </Button>
          </HStack>
        </Stack>
      </Box>
    </>
  );
}

export default Settings;
