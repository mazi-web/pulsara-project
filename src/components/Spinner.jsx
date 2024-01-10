import React from "react";
import "../css/App.css";

export default function Spinner() {
  return (
    <div className="flex spinner-container justify-center items-center mt-52">
      <div className="flex loading-spinner">
      </div>
    </div>
  );
}