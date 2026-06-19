import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { RouterProvider } from "./app/router.jsx";
import "./styles/site.css";

createRoot(document.getElementById("root")).render(
  <RouterProvider>
    <App />
  </RouterProvider>
);
