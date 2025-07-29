/// <reference types="react/experimental" />

import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import CacheProvider from "./CacheProvider.tsx";
import { SWRConfig } from "swr";
import {
  ChromeLocalStorageProvider,
  ChromeSessionStorageProvider,
} from "./contexts/ChromeStorageContext.tsx";
import { CurrentUrlProvider } from "./contexts/CurrentUrlContext.tsx";

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
