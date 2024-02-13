import { Box, useMediaQuery } from "@chakra-ui/react";
import React from "react";
import ExpandedSideNav from "./ExpandedSideNav";
import SideNav from "./SideNav";

function NavigationBar({ navIndex }: { navIndex: number }) {
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  return (
    <>
      {!isMobile ? (
        <Box width="20%" pos="fixed">
          <ExpandedSideNav navIndex={navIndex} />
        </Box>
      ) : (
        <Box width="18%" pos="fixed">
          <SideNav navIndex={navIndex} />
        </Box>
      )}
    </>
  );
}

export default NavigationBar;
