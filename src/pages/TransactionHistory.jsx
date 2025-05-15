import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/Navbar";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [username, setUsername] = useState("");

  // Get username from localStorage (or Firebase Auth in real app)
  useEffect(() => {
    const loggedInUser = localStorage.getItem("username");
    if (loggedInUser) {
      setUsername(loggedInUser);
    }
  }, []);

  // Fetch user's transaction history from /payments
  useEffect(() => {
    if (!username) return;
    const paymentsRef = ref(database, "payments");
    onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userPayments = Object.entries(data)
          .filter(([_, payment]) => payment.username === username)
          .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
        setTransactions(userPayments);
      } else {
        setTransactions([]);
      }
    });
  }, [username]);

  return (
    <div className="transaction-history-container">
      <div className="invite-header">
        <button className="back-button" onClick={() => navigate("/profile")}>
          ←
        </button>
        <h2>Transaction History</h2>
      </div>

      {transactions.length === 0 ? (
        <p>No Transactions Found</p>
      ) : (
        <div className="transaction-list">
          {transactions.map(([id, txn]) => (
            <div key={id} className="transaction-card">
              <div>
                <strong>₹{txn.amount}</strong> to {txn.upi}
              </div>
              <div>
                Status:{" "}
                <span className={txn.status === "Done" ? "done" : "progress"}>
                  {txn.status || "In Progress"}
                </span>
              </div>
              <div>{new Date(txn.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default TransactionHistory;
