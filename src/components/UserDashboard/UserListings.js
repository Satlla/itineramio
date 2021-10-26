import React from "react";

import ListingsTable from "../ListingsTable";

import "../../css/components/dashboard.css";

function UserListings() {
  return (
    <div>
      <div className="orbital__panel_dashboard">
        <div className="main__panel">
          <ListingsTable />
        </div>
      </div>
    </div>
  );
}

export default UserListings;
