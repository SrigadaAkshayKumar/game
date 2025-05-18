import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Invite from "./images/spin.png";
import { database } from "./firebase";
import { ref, get, update, onValue } from "firebase/database";

const SpinAndWin = () => {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  const username = localStorage.getItem("username");

  // Real-time points sync
  useEffect(() => {
    if (!username) return;
    const userRef = ref(database, `users/${username}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setTotalPoints(data?.points || 0);

      // Check lastSpinDate from Firebase
      const today = new Date().toISOString().split("T")[0];
      if (data?.lastSpinDate === today) {
        setHasSpunToday(true);
      }
    });

    return () => unsubscribe();
  }, [username]);

  const handleSpin = () => {
    if (isSpinning || hasSpunToday) return;

    setIsSpinning(true);
    setTimeout(async () => {
      setIsSpinning(false);
      setShowPopup(true);
      setHasSpunToday(true);

      // Save spin date to Firebase
      const today = new Date().toISOString().split("T")[0];
      await update(ref(database, `users/${username}`), {
        lastSpinDate: today,
      });
    }, 4000);
  };

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

  const handleCollect = () => {
    updateUserPoints(50); // Fixed 50 points reward
    setShowPopup(false);
  };

  const handleShowRewardAd = () => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage("showRewardAd");
    } else {
      alert("This feature only works in the mobile app.");
    }
  };

  // Listen for reward confirmation from native
  useEffect(() => {
    const handleReward = () => {
      updateUserPoints(100); // Only reward after ad is completed
    };

    window.addEventListener("rewardEarned", handleReward);
    return () => {
      window.removeEventListener("rewardEarned", handleReward);
    };
  }, []);

  return (
    <div className="spin-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ←
        </button>
        <h2>Spin and Win</h2>
      </div>
      <div className="total-points">
        <h2>Total Points: {totalPoints}</h2>
      </div>
      <div className="spin-content">
        <p style={{ fontSize: "8rem", margin: "-50px 0", zIndex: "2" }}>↓</p>
        <img
          src={Invite}
          alt="Spin Wheel"
          className={`spin-image ${isSpinning ? "spinning" : ""}`}
        />
        <button
          className="spin-button"
          onClick={handleSpin}
          disabled={hasSpunToday}
        >
          {hasSpunToday ? "Come back tomorrow!" : "Click Here To Spin"}
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>You earned 50 points!</h3>
            <button className="collect-btn" onClick={handleCollect}>
              Collect
            </button>
            <button className="watch-ad-btn" onClick={handleShowRewardAd}>
              Watch Ad (Collect 2x)
            </button>
          </div>
        </div>
      )}

      <Navbar />
    </div>
  );
};

export default SpinAndWin;
