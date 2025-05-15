import React from "react";
import { useNavigate } from "react-router-dom";
import AdBanner from "../components/Adbanner";
import Navbar from "../components/Navbar";

const WatchAds = () => {
  const navigate = useNavigate();

  const handleShowRewardAd = () => {
    // Send message to React Native to show rewarded ad
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage("showRewardAd");
    } else {
      alert("This feature only works in the mobile app.");
    }
  };

  return (
    <div className="watchads-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Watch Ads & Earn</h2>
      </div>

      <AdBanner slot="watch" />

      <div className="watchads-content">
        <button className="watchads-button" onClick={handleShowRewardAd}>
          Click Here To Watch
        </button>
      </div>

      <Navbar />
    </div>
  );
};

export default WatchAds;
