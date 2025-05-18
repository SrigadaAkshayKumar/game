import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { database } from "./firebase";
import { ref, get, update, onValue } from "firebase/database";

const WatchAds = () => {
  const navigate = useNavigate();
  const [totalPoints, setTotalPoints] = useState(0);
  const [username, setUsername] = useState("");
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [showUnavailablePopup, setShowUnavailablePopup] = useState(false);

  // Get username from localStorage
  useEffect(() => {
    const loggedInUser = localStorage.getItem("username");
    if (loggedInUser) {
      setUsername(loggedInUser);
    }
  }, []);

  // Fetch total points from Firebase in real time
  useEffect(() => {
    if (!username) return;
    const userRef = ref(database, `users/${username}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setTotalPoints(data?.points || 0);
    });

    return () => unsubscribe();
  }, [username]);

  // Add 100 points in Firebase
  const addRewardPoints = async () => {
    if (!username) return;
    const userRef = ref(database, `users/${username}`);
    const snapshot = await get(userRef);
    const currentPoints = snapshot.exists() ? snapshot.val().points || 0 : 0;
    await update(userRef, { points: currentPoints + 100 });
  };

  const handleShowRewardAd = async () => {
    // 1. Send message to native app
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "showRewardAd" })
      );
    } else {
      setShowUnavailablePopup(true);
    }

    // 2. Add reward immediately
    await addRewardPoints();

    // 3. Show reward popup
    setShowRewardPopup(true);
  };

  // Handle reward message from app (optional logic if you want to keep it)
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "rewardEarned") {
          setShowRewardPopup(true);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
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

      <h3>Total Points: {totalPoints}</h3>

      <div className="watchads-content">
        <button className="watchads-button" onClick={handleShowRewardAd}>
          Click Here To Watch
        </button>
      </div>

      {showRewardPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Reward Earned!</h3>
            <p>You’ve earned 100 points!</p>
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
