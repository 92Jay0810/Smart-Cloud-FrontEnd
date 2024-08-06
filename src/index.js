import React from "react";
import ReactDOM from "react-dom/client";
import Sidebar from "./Sidebar";
import SurveyDisplay from "./SurveyDisplay";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Sidebar />
    <SurveyDisplay />
  </React.StrictMode>
);
