import React from "react";
import "../css/components/preloader.css";

function Preloader() {
  return (
    <div className="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}

export default Preloader;
