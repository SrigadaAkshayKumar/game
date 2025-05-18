import React, { useState, useEffect } from "react";
import BottomNav from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { ref, get, update, onValue } from "firebase/database";
import { database } from "./firebase";

const PlayAndEarn = () => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) return;
    const userRef = ref(database, "users/" + username);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setTotalPoints(data?.points || 0);
    });

    return () => unsubscribe();
  }, [username]);

  const updatePoints = async (pointsToAdd) => {
    const userRef = ref(database, "users/" + username);
    const snapshot = await get(userRef);
    const currentPoints = snapshot.exists() ? snapshot.val().points || 0 : 0;
    await update(userRef, { points: currentPoints + pointsToAdd });
  };

  const handleTap = async () => {
    const newTapCount = tapCount + 1;
    await updatePoints(1);

    if (newTapCount === 50) {
      setShowPopup(true);
      setTapCount(0);
    } else {
      setTapCount(newTapCount);
    }
  };

  const handleCollect = async () => {
    await updatePoints(200);
    setShowPopup(false);
  };

  const handleWatchAd = async () => {
    await updatePoints(400);
    setShowPopup(false);
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

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Bonus! You earned ₹1</h3>
            <button className="collect-btn" onClick={handleCollect}>
              Collect
            </button>
            <button className="watch-ad-btn" onClick={handleWatchAd}>
              Watch Ad (Collect 2x)
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default PlayAndEarn;
