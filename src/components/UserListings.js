import React from "react";
import HeaderTransparent from "./HeaderTransparent";
import ListingsTable from "./ListingsTable";
import NavDashboard from "./NavDashboard";
import "../css/components/dashboard.css";

function UserListings() {
  return (
    <div>
      <HeaderTransparent />
      <div className="orbital__panel_dashboard">
        <div className="main__panel">
          <NavDashboard />
          <ListingsTable />
        </div>
      </div>
    </div>
  );
}

export default UserListings;
