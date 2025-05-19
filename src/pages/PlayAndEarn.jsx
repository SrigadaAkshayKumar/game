import React, { useState, useEffect } from "react";
import BottomNav from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { ref, get, update, onValue } from "firebase/database";
import { database } from "./firebase";

const PlayAndEarn = () => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) return;
    const userRef = ref(database, "users/" + username);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setTotalPoints(data?.points || 0);

      const today = new Date().toISOString().split("T")[0];
      if (data?.playAndEarnDate === today) {
        setDailyPoints(data?.playAndEarnPoints || 0);
      } else {
        // New day, reset daily points
        update(userRef, {
          playAndEarnDate: today,
          playAndEarnPoints: 0,
        });
        setDailyPoints(0);
      }
    });

    return () => unsubscribe();
  }, [username]);

  const updatePoints = async (pointsToAdd) => {
    if (!username) return;

    const userRef = ref(database, "users/" + username);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) return;

    const data = snapshot.val();
    const today = new Date().toISOString().split("T")[0];
    const lastDate = data.playAndEarnDate || "";
    const currentDaily = today === lastDate ? data.playAndEarnPoints || 0 : 0;

    if (currentDaily >= 200) {
      setShowLimitPopup(true);
      return;
    }

    const newDailyPoints = currentDaily + pointsToAdd;
    const newTotalPoints = (data.points || 0) + pointsToAdd;

    await update(userRef, {
      points: newTotalPoints,
      playAndEarnPoints: newDailyPoints,
      playAndEarnDate: today,
    });

    setDailyPoints(newDailyPoints);
    setTapCount((prev) => prev + 1);
  };

  const handleTap = () => {
    updatePoints(1);
  };

  const closePopup = () => {
    setShowLimitPopup(false);
  };

  return (
    <div className="play-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h2>Play And Earn</h2>
      </div>

      <div className="play-content">
        <div>
          <h1>Tap and Win</h1>
          <p className="score-label">Total Points: {totalPoints}</p>
        </div>
        <div className="tap-image" onClick={handleTap}></div>
      </div>

      {showLimitPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Limit Reached</h3>
            <p>You have exceeded today's 200 point limit.</p>
            <button className="collect-btn" onClick={closePopup}>
              OK
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default PlayAndEarn;
