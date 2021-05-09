import React, { useContext } from "react";
import { Link } from "react-router-dom";
import logo from "../logo.png";
import FaceIcon from "@material-ui/icons/Face";
import WorkOutlineIcon from "@material-ui/icons/WorkOutline";
import "../css/components/headertransparent.css";
import { FormattedMessage } from "react-intl";
import LanguageIcon from "@material-ui/icons/Language";
import { langContext } from "../context/langContext";

function HeaderTransparent() {
  const language = useContext(langContext);
  return (
    <div className="header__transparent">
      <nav className="navbar navbar-expand-lg navbar-light bg-white">
        <a className="navbar-brand" href="#">
          <Link className="navbar-brand" to="/">
            <img className="logo" src={logo} alt="" />
          </Link>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarTogglerDemo02"
          aria-controls="navbarTogglerDemo02"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
          <ul className="navbar-nav mr-auto mt-0 mt-lg-0">
            {/* <li class="nav-item active">
            <a class="nav-link" href="#"> <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#"></a>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled" href="#"></a>
          </li> */}
            <li className="nav-item active ml-2 ">
              {/* <button  class="btn-itinevip my-2 my-sm-0 mt-2">
            {" "}
            PLUS
          </button> */}
            </li>
          </ul>
          <form className="form-inline my-1 my-lg-0">
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
                              <div className="dropdown">
                <button
                  className="btn btn-lang dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <LanguageIcon />
                </button>
                <div
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  <button
                    onClick={() => language.setLanguage('es-ES')}
                    className="dropdown-item"
                  >
                    Español
                  </button>
                  <button
                    onClick={() => language.setLanguage('en-US')}
                    className="dropdown-item"
                  >
                    {" "}
                    Inglés
                  </button>
                </div>
              </div>

              <li className="nav-item active ml-3 ">
                <Link to="/como-funciona">
                  <a className="nav-link" href="#" id="hiw">
                    {" "}
                    <WorkOutlineIcon />
                    <FormattedMessage
                      id="menu.whatis"
                      defaultMessage="¿Qué es Itineramio?"
                    />
                  </a>
                </Link>
              </li>

              <li className="nav-item active ml-3 ">
                <Link to="/colaborate">
                  <span className="nav-link faceicon" href="#">
                    {" "}
                    <FaceIcon />
                    <FormattedMessage
                      id="menu.collaborate"
                      defaultMessage="Colaborar"
                    />
                    <span className="sr-only">(current)</span>
                  </span>
                </Link>
              </li>


              {/* <li className="nav-item active ml-3">
              <Link to="/colaborate">
                <button class="btn-itineramio my-2 my-sm-0" href="#">
                  {" "}
                  Colabora
                </button>
                </Link>
              </li> */}
            </ul>
          </form>
        </div>
      </nav>
    </div>
  );
}

export default HeaderTransparent;
