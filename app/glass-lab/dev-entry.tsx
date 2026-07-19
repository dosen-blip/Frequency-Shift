import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../globals.css";
import { GlassDemo } from "./glass-demo";

const root = document.getElementById("glass-lab-root");

if (!root) throw new Error("The local glass lab root is missing.");

createRoot(root).render(
  <StrictMode>
    <GlassDemo />
  </StrictMode>,
);
