import React from "react";

const AdBanner = ({ slot }) => {
  const adUnitId = process.env[`REACT_APP_AD_UNIT_${slot.toUpperCase()}`];

  if (!adUnitId) {
    return <div className="ad-banner">Ad Unit Not Configured</div>;
  }

  return (
    <div className="ad-banner">
      {/* Placeholder content - actual AdMob banner will show in WebView */}
      <div
        style={{
          width: "100%",
          height: 60,
          background: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          color: "#666",
        }}
      >
        Ad Banner Slot: {slot}
      </div>
    </div>
  );
};

export default AdBanner;
