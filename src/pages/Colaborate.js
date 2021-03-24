import React from "react";
import "../css/pages/colaborate.css";
import brucira from "../assets/backgrounds/brucira.jpg";

import logo from "../logo.png";
import { Link } from "react-router-dom";

function Colaborate() {
  return (
    <div className="colaborate">

      <Link className="navbar-brand" to="/">
        <span className="brand-back">

          <img className="logo" src={logo} alt="" />
        </span>
      </Link>
      <div className="dash">
        <div className="left-side">
          <h3 class="title-colaborate">
            ¡Colabora con nosotros!. Cuéntanos al oido... ese lugar tan especial ¡que quieres que visitemos!
          </h3>

          <img src={brucira} className="colaborate-img" alt="colaborate" />
        </div>

        {/* Este es el lado derecho del formulario */}
        <div className="right-side">
          <div className="container-contacts">
            <div className="contact-me">
              <div className="container">
                <h3 className="title-form">¡Envíanos lugares increíbles!</h3>



                <div className="contacto">
                  <div className="contact">
                    <form action="#" id="formulario" onSubmit="return false">
                      <label className="register-form" for="">
                        Tu Nombre
                      </label>
                      <input type="text" id="name" name="nombre" />
                      <label className="register-form" for="">
                         Tu Email
                      </label>
                      <input type="email" id="mail" name="correo" />{" "}
                      <label className="register-form" for="">
                        Nombre del establecimiento
                      </label>
                      <input type="text" id="name" name="nombre" />
                      <label className="register-form" for="">
                        ¿Por qué este establecimiento debe aparecer en itineramio?
                      </label>
                      <textarea className="more-about"  name="description" />
                      <input
                        type="button"
                        id="submit"
                        className="btn-itineramio  mt-2"
                        value="Enviar"
                      />
                </form>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Colaborate;
