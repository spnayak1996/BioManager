import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BioManagerApp from './BiosPage.jsx';

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <BioManagerApp />
  </StrictMode>
);