import type { NextPage } from "next";
import Head from "next/head";
import Dashboard from "./dashboard";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Ironberg Dashboard</title>
        <meta name="description" content="Ironberg Dashboard" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>

      <Dashboard />
    </>
  );
};

export default Home;
