import React from "react";
import SuggestionTable  from './SuggestionsTable'
import "../../css/components/dashboard.css";

function Suggestions() {
  return (
    <div>

    <div className="orbital__panel_dashboard">
      <div className="main__panel">
        
        <SuggestionTable />
      </div>
    </div>
  </div>
);
}


export default Suggestions;
