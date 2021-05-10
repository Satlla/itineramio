import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../css/components/footer.css";
import logo from "../logo.png";
import InstagramIcon from '@material-ui/icons/Instagram';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import PinterestIcon from '@material-ui/icons/Pinterest';
import { FormattedMessage } from 'react-intl'
import { langContext } from "../context/langContext";
import LanguageIcon from "@material-ui/icons/Language";

function Footer() {

const language = useContext(langContext);

  window.scrollTo(0, 0);


  return (
    <div className="container-footer mt-4 pt-4">
      <div className="cont-left">
        <ul className="footer-list">
          <li className="itineramio-footer">
          <Link className="navbar-brand" to="/">
          <img className="logo" src={logo} alt="" />
          </Link>
          </li>
          <li>
            <p class="what-is">
              <FormattedMessage
              id="footer.slogan"
              defaultMessage="Itineramio es una comunidad de personas apasionadas por descubrir
              la infinidad de lugares gastronómicos de imprescindible visita en
              la ciudad de Alicante"

              />

            </p>
            <div className="Social-icons mb-4">
              <a className="link__rss" href ="https://www.instagram.com/itineramio/" > <InstagramIcon /> </a>
              <span className="ml-2"> <TwitterIcon /> </span>
              <span className="ml-2" > <FacebookIcon /> </span>
              <span className="ml-2"> <PinterestIcon /> </span>
            </div>
          </li>
        </ul>
      </div>
      <div className="cont-center">
        <ul className="footer-list">
          <p ClassName="footer-list-title">
          <FormattedMessage
              id="footer.about"
              defaultMessage=" ACERCA DE"

              />
          </p>
          <li>
            <Link to="/como-funciona">
            <a class="nav-link">
            <FormattedMessage
              id="menu.whatis"
              defaultMessage="¿Qué es itineramio?"

              />
            </a>

            </Link>
          </li>
          {/* <li>
            <Link to="/plans">
            <a class="nav-link"> ¿Qué es Plans? </a>

            </Link>
          </li> */}
          <li>
            <Link to="/estandares">
            <a class="nav-link">

            <FormattedMessage
              id="footer.standard"
              defaultMessage=" Estándares de Calidad"

              />
            </a>

            </Link>
          </li>
        </ul>
      </div>

      <div className="cont-right">
        <ul className="footer-list">
          <p ClassName="footer-list-title"> 
          <FormattedMessage
              id="footer.legal"
              defaultMessage=" LEGAL"

              />

          </p>
          <li>
            <a class="nav-link" href="#">
            <FormattedMessage
              id="footer.terms"
              defaultMessage=" Condiciones de uso"

              />
            </a>
          </li>
          <li>
            <Link to="/privacity">
            <a class="nav-link">
            <FormattedMessage
              id="footer.privacy"
              defaultMessage=" Privacidad y Cookies"

              /> </a>

            </Link>
          </li>
          <div className="dropdown">
                <button
                  className="btn btn-lang dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <LanguageIcon/>
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
        </ul>
      </div>
    </div>
  );
}

export default Footer;
