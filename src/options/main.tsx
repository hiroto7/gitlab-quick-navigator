import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./index.css";
import { ChromeLocalStorageProvider } from "../contexts/ChromeStorageContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class">
      <ChromeLocalStorageProvider>
        <App />
      </ChromeLocalStorageProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
