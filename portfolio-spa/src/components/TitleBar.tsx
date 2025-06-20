import React from "react";

const TitleBar: React.FC = () => {
  return (
    <div 
      style={{ 
        height: "100%",
        backgroundColor: "#1f2937", // gray-800
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 1rem"
      }}
    >
      <h1 style={{ 
        fontSize: "1.125rem", 
        fontWeight: "600", 
        color: "#f3f4f6", // gray-100
        margin: 0 
      }}>
        Jordan Watt | Game Designer & Developer
      </h1>
    </div>
  );
};

export default TitleBar; 