import { Box, Button, HStack, Spacer, Stack, Text, Textarea } from "@chakra-ui/react";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import router from "next/router";
import React, { useEffect, useState } from "react";
import ExpandedSideNav from "../../components/ExpandedSideNav";
import { database } from "../../firebaseConfig";
import { useMediaQuery } from "@chakra-ui/react";
import SideNav from "../../components/SideNav";

interface Template {
  docId: string;
  channel: string;
  message: string;
}

function Settings() {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [smsMessage, setSmsMessage] = useState<Template>();
  const [inputMessage, setInputMessage] = useState<string>();

  const getSMSTemplate = async () => {
    const q = query(
      collection(database, "templates"),
      where("channel", "==", "sms")
    );
    const templateMessages = await getDocs(q);
    let temp: Array<Template> = [];
    templateMessages.forEach((template) =>
      temp.push({
        docId: template.id,
        channel: template.data().channel,
        message: template.data().message,
      })
    );
    setSmsMessage(temp[0]);
  };

  const updateSMSTemplate = async () => {
    await updateDoc(doc(database, "templates", smsMessage?.docId as string), {
      channel: "sms",
      message: inputMessage,
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
          <ExpandedSideNav navIndex={5}/>
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={5}/>
        </Box>
      )}
      <Box pl={{ base: "20%", sm: "18%" }}  w="98vw">
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
              <Text fontSize="lg">
                Update
              </Text>
            </Button>
          </HStack>
        </Stack>
      </Box>
    </>
  );
}

export default Settings;
