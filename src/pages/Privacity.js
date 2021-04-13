import React from "react";
import "../css/pages/privacity.css";
import { Link } from "react-router-dom";
import logo from "../assets/logos/logo-rojo.png";
import cookies from "../assets/img/cookies.jpg";

function Privacity() {
  window.scrollTo(0, 0);
  return (
    <div>
      <div className="cabecera">
        <Link className="header__whyus" to="/">
          <img className="logo_banner" src={logo} alt="logo" />
        </Link>
      </div>

      <div className="container-title">
        <h4 className="banner-title"> Politicas de Privacidad y Cookies </h4>
      </div>
      <div className="image-container">
        <img src={cookies} alt="privacity" />
      </div>

      {/* Oferta gastronomica */}
      <div className="privacy ">
        <div className="container-privacity">
          <h6 className="title-card"> Última actualización</h6>
          <p>
            Última actualización: 30 de octubre de 2020 La misión de itineramio
            es ayudar a establecer vínculos entre personas y hacer de este mundo
            un lugar más abierto e inclusivo. En otras palabras: construir un
            mundo en el que la gente pueda sentirse como en casa donde vaya.
            Nuestra comunidad se basa en la confianza, y para ganárnosla es
            fundamental que todos los miembros tengan claro cómo utilizamos sus
            datos y protegemos su derecho a la privacidad. Esta Política de
            Privacidad describe cómo itineramio, Inc. y sus empresas afiliadas
            («nosotros», «nos» o «itineramio») tratan los datos personales que
            recopilamos a través de la Plataforma de itineramio. Las páginas de
            privacidad complementarias que se enumeran a continuación pueden
            serle de aplicación en función de su lugar de residencia y de su
            actividad en la Plataforma itineramio. Siga los enlaces y revise la
            información adicional que se proporciona en ellas sobre cómo
            tratamos los datos personales en esas regiones y servicios.
          </p>
          <h6 className="title-card"> Datos personales que recopilamos</h6>
          <p>
            Recopilamos sus datos personales cuando utiliza la Plataforma
            itineramio. De no hacerlo, quizás no pudiéramos prestarle todos los
            servicios solicitados. Estos son los datos que recopilamos: Datos de
            contacto, cuenta, información del perfil. Por ejemplo, su nombre,
            apellidos, número de teléfono, dirección postal, dirección de correo
            electrónico, fecha de nacimiento y foto de perfil, que dependerán de
            las funciones que utilice.
          </p>
          <h6 className="title-card">
            {" "}
            Información que usted proporciona voluntariamente.
          </h6>
          <p>
            Cuando lo desee podrá proporcionarnos datos personales adicionales,
            que podrán incluir: Información adicional del perfil. Como género,
            idiomas preferidos, ciudad y descripción personal. Como se señala en
            la configuración de su Cuenta, algunos de estos datos forman parte
            de su perfil público y cualquier persona podrá verlos. Información
            de contactos de la agenda. Contactos de su agenda que importe o
            introduzca manualmente. Otra información. Por ejemplo, al rellenar
            un formulario, añadir información a su cuenta, responder a
            encuestas, publicar en foros comunitarios, participar en
            promociones, comunicarse con nuestro equipo de Atención al Cliente u
            otros miembros de nuestro equipo o contarnos su experiencia. También
            podrá incluir información sobre su salud si lo estima oportuno.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Privacity;
