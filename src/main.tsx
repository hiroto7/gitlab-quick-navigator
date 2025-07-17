/// <reference types="react/experimental" />

import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import CacheProvider from "./CacheProvider.tsx";
import { SWRConfig } from "swr";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ThemeProvider attribute="class">
        <CacheProvider>
          <SWRConfig value={{ shouldRetryOnError: false }}>
            <App />
          </SWRConfig>
        </CacheProvider>
      </ThemeProvider>
    </HeroUIProvider>
  </React.StrictMode>,
);
