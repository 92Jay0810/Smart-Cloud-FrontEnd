import React from "react";
import "./Sidebar.css";
import logo from "./assets/cathay.png";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <a href="/">
          <img src={logo} alt="cathay" />
        </a>
      </div>
      <nav>
        <ul>
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#survey">Survey</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
