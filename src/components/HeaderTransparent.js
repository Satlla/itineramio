import React from "react";
import { Link } from "react-router-dom";
import logo from "../logo.png";
import FaceIcon from "@material-ui/icons/Face";
import WorkOutlineIcon from "@material-ui/icons/WorkOutline";
import '../css/components/headertransparent.css';


function HeaderTransparent() {
  return (
    <div className="header__transparent">

    <nav class="navbar navbar-expand-lg navbar-light bg-transparent">
      <a class="navbar-brand" href="#">

      <Link className="navbar-brand" to="/">
          <img className="logo" src={logo} alt="" />
      </Link>

      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarTogglerDemo02">
        <ul class="navbar-nav mr-auto mt-0 mt-lg-0">
          <li class="nav-item active">
            <a class="nav-link" href="#"> <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"></a>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled" href="#"></a>
          </li>
        </ul>
        <form class="form-inline my-2 my-lg-0">
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
        </form>
      </div>
    </nav>
    </div>

  )
}

export default HeaderTransparent
