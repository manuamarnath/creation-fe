import React from "react";
import { createRoot } from "react-dom/client";
import ClientCreation from "./ClientCreation";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClientCreation />
  </React.StrictMode>
);
