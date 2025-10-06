import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BiosPage from "./BiosPage";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BioManagerApp />
  </React.StrictMode>
);