import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="bottom-nav">
      <button className="nav-button" onClick={() => navigate("/profile")}>
        Profile
      </button>
      <button className="nav-button" onClick={() => navigate("/")}>
        Game
      </button>
      <button className="nav-button" onClick={() => navigate("/invite")}>
        Invite
      </button>
      <button className="nav-button" onClick={() => navigate("/exchange")}>
        Withdraw
      </button>
    </div>
  );
};

export default Navbar;
