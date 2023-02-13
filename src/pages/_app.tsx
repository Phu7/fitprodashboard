import type { AppProps } from "next/app";
import * as React from "react";
import { extendTheme } from "@chakra-ui/react";

// 1. import `ChakraProvider` component
import { ChakraProvider } from "@chakra-ui/react";
import { useState } from "react";
import { Provider } from "react-redux";
import { createContext } from "vm";
import { AuthContextProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useRouter } from "next/router";

const noAuthRequired = ["/login"];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ChakraProvider>
      <AuthContextProvider>
        {noAuthRequired.includes(router.pathname) ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </AuthContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
