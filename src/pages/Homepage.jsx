import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import watchads from "./images/watchandearn.png";
import playandearn from "./images/playandearn.png";
import spinandwin from "./images/spinandwin.png";
import invite from "./images/invite.png";
import AdBanner from "../components/Adbanner";

const Homepage = () => {
  const navigate = useNavigate();

  const cards = [
    { label: "Watch Ads", path: "/watchads", image: watchads },
    {
      label: "Play Game",
      path: "/playandearn",
      image: playandearn,
    },
    { label: "Spin & Win", path: "/spinandwin", image: spinandwin },
    { label: "Invite & Earn", path: "/invite", image: invite },
  ];

  return (
    <div className="homepage-container">
      <Header />
      <AdBanner slot="home1" />
      <div className="card-grid">
        {cards.map((card, index) => (
          <div key={index} className="card" onClick={() => navigate(card.path)}>
            <img src={card.image} alt={card.label} className="card-image" />
            <div className="card-label">{card.label}</div>
          </div>
        ))}
      </div>
      <AdBanner slot="home2" />
      <Navbar />
    </div>
  );
};

export default Homepage;
