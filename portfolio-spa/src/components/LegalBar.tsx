import React from "react";

const LegalBar: React.FC = () => {
  return (
    <div 
      style={{ 
        height: "100%",
        backgroundColor: "#1f2937", // gray-800
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <p style={{ 
        fontSize: "0.875rem", 
        color: "#d1d5db", // gray-300
        margin: 0 
      }}>
        © 2025 Jordan Watt | All Rights Reserved
      </p>
    </div>
  );
};

export default LegalBar; 