import React from "react";
import '../css/components/footer.css';

function Footer() {
  return (
    <div className="container-footer">

<div className="cont-left">
        <ul className="footer-list">
            <p ClassName="footer-list-title"> ACERCA DE</p>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
        </ul>
      </div>
      <div className="cont-center">
      <ul className="footer-list" >
      <p ClassName="footer-list-title"> COMUNIDAD</p>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
        </ul>
      </div>

      <div className="cont-right">
      <ul className="footer-list">
      <p ClassName="footer-list-title"> ASISTENCIA</p>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
          <li>
            <a class="nav-link" href="#">
              Iniciar Sesión
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Footer;
