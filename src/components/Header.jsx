import React from "react";
import Logo from "./images/logo.png";
import Profile from "./images/profile.png";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <div className="header">
      <img src={Logo} alt="Play2Cash Logo" className="logo" />
      <img
        src={Profile}
        alt="Play2Cash Logo"
        className="profile"
        onClick={() => navigate("/profile")}
      />
    </div>
  );
};

export default Header;
