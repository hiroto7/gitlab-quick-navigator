import React from "react";
import ReactDOM from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import CacheProvider from "./CacheProvider.tsx";
import { SWRConfig } from "swr";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <NextUIProvider>
      <ThemeProvider>
        <CacheProvider>
          <SWRConfig value={{ shouldRetryOnError: false }}>
            <App />
          </SWRConfig>
        </CacheProvider>
      </ThemeProvider>
    </NextUIProvider>
  </React.StrictMode>,
);
