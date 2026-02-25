import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "leaflet/dist/leaflet.css";
import "./utils/fixLeafletIcon";
import { Toaster } from "react-hot-toast";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" />
  </BrowserRouter>
);
