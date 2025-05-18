import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const WatchAds = () => {
  const navigate = useNavigate();

  const handleShowRewardAd = () => {
    // Send JSON message to React Native app to show the rewarded ad
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "showRewardAd" })
      );
    } else {
      alert("This feature only works in the mobile app.");
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "rewardEarned") {
          alert("You’ve earned a reward!");
          // Add reward logic here if needed (update points, etc.)
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="watchads-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Watch Ads & Earn</h2>
      </div>
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
