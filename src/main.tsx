/// <reference types="react/experimental" />

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import React from "react";
import ReactDOM from "react-dom/client";
import { SWRConfig } from "swr";
import App from "./App.tsx";
import CacheProvider from "./CacheProvider.tsx";
import {
  ChromeLocalStorageProvider,
  ChromeSessionStorageProvider,
} from "./contexts/ChromeStorageContext.tsx";
import CurrentUrlProvider from "./CurrentUrlProvider.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ThemeProvider attribute="class">
        <CurrentUrlProvider>
          <ChromeLocalStorageProvider>
            <ChromeSessionStorageProvider>
              <CacheProvider>
                <SWRConfig value={{ shouldRetryOnError: false }}>
                  <App />
                </SWRConfig>
              </CacheProvider>
            </ChromeSessionStorageProvider>
          </ChromeLocalStorageProvider>
        </CurrentUrlProvider>
      </ThemeProvider>
    </HeroUIProvider>
  </React.StrictMode>,
);
