/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import "./styles/global.css";
import "./styles/elementos.css";
import "./styles/paginas.css";

import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { App } from "@web/App";
import { AppProviders } from "@web/providers/AppProviders";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
type HotData = { root?: Root };
((import.meta.hot.data as HotData).root ??= createRoot(elem)).render(app);
