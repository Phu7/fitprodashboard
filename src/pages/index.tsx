import { Avatar, Wrap, WrapItem } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Programs from "./programs";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Fit Pro West Dashboard</title>
        <meta name="description" content="Fit Pro Dashboard" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="appli-touch-icon" href="/appli-touch-icon.png" />
      </Head>

      <Programs />
    </>
  );
};

export default Home;
