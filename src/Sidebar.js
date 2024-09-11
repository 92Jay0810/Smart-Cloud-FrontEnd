import React from "react";
import "./Sidebar.css";
import logo from "./assets/cathay.png";
const Sidebar = ({ onReset }) => {
  const handleHomeClick = (e) => {
    e.preventDefault();
    onReset();
  };
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
            <a href="#home" onClick={handleHomeClick}>
              Home
            </a>
          </li>
          <li>
            <a href="#survey">Survey</a>
          </li>
          <li>
            <a href="https://d1fnvwdkrkz29m.cloudfront.net/F&Q/celeste.html">
              F&Q
            </a>
          </li>
          <li>
            <a href="#session">Session</a>
          </li>
          <li>
            <a href="https://d1fnvwdkrkz29m.cloudfront.net/Contact/contact.html">
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
