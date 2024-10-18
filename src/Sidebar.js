import React from "react";
import "./Sidebar.css";
import logo from "./assets/cathay.png";
const Sidebar = ({ onReset, handleLogout, isLoggedIn }) => {
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
            <a href="https://d2s0u5536e7dee.cloudfront.net/FAQ/FAQ.html">FAQ</a>
          </li>
          <li>
            <a href="https://d2s0u5536e7dee.cloudfront.net/Contact/contact.html">
              Contact
            </a>
          </li>
        </ul>
        {isLoggedIn && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
