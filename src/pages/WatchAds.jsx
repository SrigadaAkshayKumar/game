import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const WatchAds = () => {
  const navigate = useNavigate();
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [showUnavailablePopup, setShowUnavailablePopup] = useState(false);
  const [points, setPoints] = useState(0);

  const handleShowRewardAd = () => {
    if (window.ReactNativeWebView) {
      // ✅ Add points immediately
      setPoints((prev) => prev + 200);
      setShowRewardPopup(true);

      // ✅ Send message to native app to show the ad
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "showRewardAd" })
      );
    } else {
      setShowUnavailablePopup(true);
    }
  };

  const closePopup = () => {
    setShowRewardPopup(false);
    setShowUnavailablePopup(false);
  };

  // Optional: Listen for reward confirmation from React Native (still works)
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "rewardEarned") {
          setPoints((prev) => prev + 200);
          setShowRewardPopup(true);
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
        <p className="points-display">Your Points: {points}</p>
        <button className="watchads-button" onClick={handleShowRewardAd}>
          Click Here To Watch
        </button>
      </div>

      {showRewardPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Reward Earned!</h3>
            <p>You’ve earned 200 points!</p>
            <button className="collect-btn" onClick={closePopup}>
              OK
            </button>
          </div>
        </div>
      )}

      {showUnavailablePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Feature Unavailable</h3>
            <p>This feature only works in the mobile app.</p>
            <button className="collect-btn" onClick={closePopup}>
              OK
            </button>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default WatchAds;
