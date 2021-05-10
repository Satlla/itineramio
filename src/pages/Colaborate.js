import React, { useEffect, useState } from "react";
import { fb } from "../firebase";
import { toast } from "react-toastify";
import "../css/pages/colaborate.css";
import brucira from "../assets/backgrounds/brucira.jpg";
import VisibilityIcon from "@material-ui/icons/Visibility";
import logo from "../logo.png";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";

const db = fb.firestore();

function Addrecommendation() {
  const [recommendation, setrecommendation] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  //Designamos los valores por defecto para el formulario.
  const initialStateValues = {
    username: "",
    useremail: "",
    recommendationname: "",
    recommendationdescription: "",
  };

  const [values, setValues] = useState(initialStateValues);

  const onSubmit = async (e) => {
    e.preventDefault();
    setValues({ ...initialStateValues });
    const username = e.target.username.value;
    const useremail = e.target.useremail.value;
    const recommendationname = e.target.recommendationname.value;
    const recommendationdescription = e.target.recommendationdescription.value;

    if (
      !username ||
      !useremail ||
      !recommendationname ||
      !recommendationdescription
    ) {
      return;
    }
    await db.collection("recommendations").doc().set({
      name: username,
      email: useremail,
      recommendation: recommendationname,
      description: recommendationdescription,
    });

    toast("¡Gracias!. ¡Estamos revisando tu sugerencia!", {
      type: "success",
      autoClose: 2000,
    });
  };

  useEffect(() => {
    const fetchrecommendation = async () => {
      const recommendationsCollection = await db
        .collection("recommendations")
        .get();

      setrecommendation(
        recommendationsCollection.docs.map((doc) => {
          return doc.data();
        })
      );
    };
    fetchrecommendation();
  }, []);

  return (
    <div className="colaborate">
      <Link className="navbar-brand" to="/">
        <span className="brand-back">
          <img className="logo" src={logo} alt="" />
        </span>
      </Link>
      <div className="dash">
        <div className="left-side">
          <h3 className="title-colaborate">
            <FormattedMessage
              id="collaborate.slogan"
              defaultMessage="¡Colabora con nosotros!. Cuéntanos al oido... ese lugar tan especial ¡que quieres que visitemos!"
            />
          </h3>

          <img src={brucira} className="colaborate-img" alt="colaborate" />
        </div>

        {/* Este es el lado derecho del formulario */}
        <div className="right-side">
          <div className="container-contacts">
            <div className="contact-me">
              <div className="container">
                <h3 className="title-form">
                  <FormattedMessage
                    id="collaborate.title"
                    defaultMessage=" ¡Envíanos tus lugares Favoritos!"
                  />
                </h3>

                <div className="contacto">
                  <div className="contact">
                    <form onSubmit={onSubmit}>
                      <label className="register-form">
                        <FormattedMessage
                          id="collaborate.name"
                          defaultMessage=" Nombre"
                        />
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="username"
                        placeholder=""
                        onChange={handleInputChange}
                        value={values.username}
                      />
                      <label className="register-form">
                        <FormattedMessage
                          id="collaborate.name"
                          defaultMessage=" Email"
                        />
                      </label>
                      <input
                        type="email"
                        id="mail"
                        name="useremail"
                        placeholder=""
                        onChange={handleInputChange}
                        value={values.useremail}
                      />{" "}
                      <label className="register-form">
                        <FormattedMessage
                          id="collaborate.place"
                          defaultMessage=" Nombre del establecimiento"
                        />
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="recommendationname"
                        placeholder=""
                        onChange={handleInputChange}
                        value={values.recommendationname}
                      />
                      <label className="register-form">
                        <FormattedMessage
                          id="collaborate.why"
                          defaultMessage=" ¿Por qué este establecimiento debe aparecer en itineramio?"
                        />
                      </label>
                      <Link className="nav-link" to="/estandares">
                        <VisibilityIcon />{" "}
                        <small className="ml-2">
                          <FormattedMessage
                            id="collaborate.standard"
                            defaultMessage=" Ver los estándares de calidad"
                          />
                        </small>
                      </Link>
                      <textarea
                        className="more-about"
                        name="recommendationdescription"
                        placeholder=""
                        onChange={handleInputChange}
                        value={values.recommendationdescription}
                      />
                      <button className="btn btn-primary btn-block mt-4">
                        {" "}
                        {
                          <FormattedMessage
                            id="collaborate.cta"
                            defaultMessage=" Enviar"
                          />
                        }{" "}
                      </button>
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

export default Addrecommendation;
