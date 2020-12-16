import React from "react";
import { Link } from "react-router-dom";
import "../css/components/header.css";
import logo from "../logo.png";
import FaceIcon from "@material-ui/icons/Face";
import WorkOutlineIcon from "@material-ui/icons/WorkOutline";
function Header() {
  return (
    <div>
      <nav
        className="navbar navbar-expand-lg navbar-light bg-light mb-4"
        id="navbar"
      >
        <Link className="navbar-brand" to="/">
          <img className="logo" src={logo} alt="" />
        </Link>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            <li className="nav-item active ml-2 ">

              <button  class="btn-itinevip my-2 my-sm-0">
                {" "}
                GO PRO
              </button>

            </li>
          </ul>
          <div className="form-inline my-2 my-lg-0">
            <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
              {/* <li className="searcher" id="searcher">
                <input

                  class="form-control mr-sm-2"
                  type="search"
                  placeholder="Buscar"
                  aria-label="Search"

                ></input>
              </li> */}
              {/* <button class="btn-itinevip my-2 my-sm-0" href="#">
                  {" "}
                   GO PRO
                </button> */}
              <li className="nav-item active ml-3 ">
                <a className="nav-link" href="#" id="hiw">
                  {" "}
                  <WorkOutlineIcon /> ¿Cómo funciona?
                </a>
              </li>
              <li className="nav-item active ml-3 ">
                <a className="nav-link faceicon" href="#">
                  {" "}
                  <FaceIcon /> Regístrate <span class="sr-only">(current)</span>
                </a>
              </li>

              <li className="nav-item active ml-3">
              <Link to="/new-listing">
                <button class="btn-itineramio my-2 my-sm-0" href="#">
                  {" "}
                  Colabora
                </button>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Header;
