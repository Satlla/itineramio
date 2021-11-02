import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import Preloader from "../components/Preloader";
import { Link, animateScroll as scroll } from "react-scroll";
import "../css/pages/experienceDetail.css";
import HeaderTransparent from "../components/HeaderTransparent";
import { FormattedMessage } from "react-intl";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import Comment from "../components/Comment";
import CommentBox from "../components/CommentBox";
import PriceBoxExperience from '../components/Experiences/PriceBoxExperience'


function ExperienceDetails() {
  const { experienceId, experienceName } = useParams();
  const [ExperienceDetails, setExperienceDetails] = useState(null);
  const [experienceComments, setExperienceComments] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);


    setLoading(true);
    if (experienceId) {
      db.collection("experiences")
        .doc(experienceId)
        .onSnapshot((snapshot) => setExperienceDetails(snapshot.data()));
    }

    db.collection("experiences")
      .doc(experienceId)
      .collection("comments")
      // .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) =>
        setExperienceComments(snapshot.docs.map((doc) => doc.data()))
      );
  }, [experienceId]);

  return (

    <div>


      <meta charSet="utf-8" />
        <title> Ver experiencia </title>

        <HeaderTransparent />

        <div className="container-titles">

        <div className="title-experience">
        <h4 className=""> {ExperienceDetails?.name}</h4>
              <p className="">{ExperienceDetails?.slogan}</p>
              <div>
                <span className="comments-experience">
                  {" "}
                  <Link
                    activeClass="active"
                    to="commentsec"
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={1000}
                  >
                    <strong>
                      {experienceComments.length}{" "}
                      <FormattedMessage
                        id="experience.comments"
                        defaultMessage="Personas han opinado"
                      />
                    </strong>
                  </Link>
                </span>
              </div>

        </div>

        </div>


      <div className="container__listing">
        <div className="carousel-hero">

          <div className="carousel-grid">
            <div className="experience-carousel">
                  <div className="grid-portada">

                    <img
                       src={ExperienceDetails?.images[0]}
                       alt="imag"
                       className="img-carousel-portada"
                    />

                  </div>
                <div className="container-middle">
                  <div className="grid-middle">

                      <img
                      src={ExperienceDetails?.images[1]}
                      alt="imag"
                      className="img-carousel-2"
                      />

                      <img
                      src={ExperienceDetails?.images[2]}
                      alt="imag"
                      className="img-carousel-3"
                      />

                      <img
                      src={ExperienceDetails?.images[3]}
                      alt="imag"
                      className="img-carousel-4"
                      />

                  </div>
                </div>

                  <div className="grid-end">

                      <img
                      src={ExperienceDetails?.images[4]}
                      alt="imag"
                      className="img-carousel-5"
                      />

                  </div>
            </div>
          </div>


        </div>


        <div className="container__file">
          {loading ? "" : <Preloader />}

{/* Prueba Price*/}



{/* Fin prueba Price */}



        {/* Contenedor principal Descripciones y pricebox */}
    <div className="layout-description">
        <div className=" container-description ">

          {/* Inicio contenedor descripción lo mejor , notificación */}
            <div className="experience__container">

              {/* Descripcion del lugar */}

                <div className="description__listing">
                    <h6 className="description__title">
                      <FormattedMessage
                        id="experience.whatdo"
                        defaultMessage="Que harás"
                      />
                    </h6>
                    {ExperienceDetails?.description}
                  </div>


              {/* Lo mejor del lugar */}

              <div className="description__listing">
                <h6 className="description__title">
                  <FormattedMessage
                    id="experience.best"
                    defaultMessage="¿Que esperar?"
                  />
                </h6>
                {ExperienceDetails?.best}
              </div>

              {/* Lo mejor del lugar */}

              {/* Local verificado */}
                <div className="address mt-2 ml-3">
                    <span className="verified__icon">
                      <VerifiedUserIcon />
                    </span>

                    <span className="peculiarities__title">
                      <FormattedMessage
                        id="listing.verified"
                        defaultMessage=" Local Verificado"
                      />
                    </span>
              </div>

              <div className="notification">
                    <span className="notification__icon">
                      {" "}
                      <ErrorOutlineIcon />
                    </span>
                    <span className="notification__text">
                      <FormattedMessage
                        id="listing.notice"
                        defaultMessage="Todos los emplazamientos publicados en itineramio, tiene como finalidad, lograr la mejor experiencia del usuarix."
                      />
                    </span>
              </div>
          </div>

         <PriceBoxExperience/>

           {/* Fin contenedor descripción lo mejor , notificación */}
        </div>


        {/* Fin contenedor principal Descripciones y pricebox */}
        </div>

        {/* fin layout */}

          <div className="title" id="commentsec">
                <AllInclusiveIcon className="ratin__icon" />
                <h4 className=" ml-2">
                  {experienceComments.length}{" "}
                  <FormattedMessage
                    id="listing.comments2"
                    defaultMessage="Comentarios"
                  />
                </h4>
          </div>
              <CommentBox />

          <div id="commentsec">
                {experienceComments.map(
                  ({ comment, username, title, userImage }) => (
                    <Comment
                      comment={comment}
                      // timestamp={timestamp}
                      username={username}
                      title={title}
                      userImage={userImage}
                    />
                  )
                )}
              </div>


        </div>
      </div> 
      <div></div>
    </div>
  );
}

export default ExperienceDetails;
