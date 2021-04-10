import React from "react";
import { Link } from "react-router-dom";
import "../css/components/navdash.css";

function NavDashboard() {
  return (
    <div className="nav__dashboard">
      <ul className="nav-menu mb-2">
        <li className="dashboard__links ">
          <Link to="/dashboard">
            <a className="dashboard__link mr-4 "> Nuevo Listing</a>
          </Link>
        </li>
        <li className=" ">
          <Link to="/dashboard/userlistings">
            <a className="dashboard__link ml-4"> Publicados</a>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default NavDashboard;
