import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { database } from "./firebase";
import { ref, get, update, onValue } from "firebase/database";

const WatchAds = () => {
  const navigate = useNavigate();
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [showUnavailablePopup, setShowUnavailablePopup] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) return;
    const userRef = ref(database, `users/${username}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setTotalPoints(data?.points || 0);
    });

    return () => unsubscribe();
  }, [username]);

  const updateUserPoints = async (earnedPoints) => {
    if (!username) return;
    const userRef = ref(database, `users/${username}`);
    try {
      const snapshot = await get(userRef);
      const currentPoints = snapshot.exists() ? snapshot.val().points || 0 : 0;
      await update(userRef, { points: currentPoints + earnedPoints });
    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  const handleShowRewardAd = () => {
    if (window.ReactNativeWebView) {
      const rewardId = Date.now().toString(); // Unique session ID
      localStorage.setItem("lastAdSessionId", rewardId);
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "showRewardAd", rewardId })
      );
    } else {
      setShowUnavailablePopup(true);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "rewardEarned") {
          const lastSessionId = localStorage.getItem("lastAdSessionId");

          if (data.rewardId && data.rewardId === lastSessionId) {
            setTimeout(async () => {
              await updateUserPoints(200);
              setShowRewardPopup(true);
              localStorage.removeItem("lastAdSessionId");
            }, 1000);
          } else {
            console.warn(
              "Ignored reward due to mismatched or missing rewardId."
            );
          }
        }
      } catch (error) {
        console.error("Error parsing reward message:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const closePopup = () => {
    setShowRewardPopup(false);
    setShowUnavailablePopup(false);
  };

  return (
    <div className="watchads-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Watch Ads & Earn</h2>
      </div>
      <h3>Your Points: {totalPoints}</h3>
      <div className="watchads-content">
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
