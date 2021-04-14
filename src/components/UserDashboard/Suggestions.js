import React from "react";
import HeaderTransparent from "../HeaderTransparent";
import SuggestionTable  from './SuggestionsTable'
import NavDashboard from "../NavDashboard";
import "../../css/components/dashboard.css";

function Suggestions() {
  return (
    <div>
    <HeaderTransparent />
    <div className="orbital__panel_dashboard">
      <div className="main__panel">
        <NavDashboard />
        <SuggestionTable />
      </div>
    </div>
  </div>
);
}


export default Suggestions;
