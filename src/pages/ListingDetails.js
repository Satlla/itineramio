import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactWhatsapp from "react-whatsapp";
import { db } from "../firebase";
import Preloader from "../components/Preloader";
// eslint-disable-next-line
import { Link, animateScroll as scroll } from "react-scroll";
import "../css/components/ListingDetails.css";
import HeaderTransparent from "../components/HeaderTransparent";
import { FormattedMessage } from "react-intl";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import PhoneIcon from "@material-ui/icons/Phone";
import Comment from "../components/Comment";
import CommentBox from "../components/CommentBox";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { Helmet } from "react-helmet";
// eslint-disable-next-line
import Listings from "../components/Top";
import Map from '../components/Map';




function ListingDetails() {
  // eslint-disable-next-line
  const { listingId, listingName } = useParams();
  const [ListingDetails, setListingDetails] = useState(null);
  const [listingComments, setListingComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewport, setViewport] = useState({

    latitude: 38.3459894,
    longitude: -0.490678644126355,
    zoom: 16,
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    setLoading(true);
    if (listingId) {
      db.collection("listings")
        .doc(listingId)
        .onSnapshot((snapshot) => setListingDetails(snapshot.data()));
    }


    db.collection("listings")
      .doc(listingId)
      .collection("comments")
      // .orderBy("timestamp", "asc")
      .onSnapshot((snapshot) =>
        setListingComments(snapshot.docs.map((doc) => doc.data()))
      );

  }, [listingId]);


  return (

    <div>

<Helmet>
     <meta charSet="utf-8" />
     <title> Vista detalle del establecimiento </title>
</Helmet>


      <HeaderTransparent />
      <div className="container__listing">
        <div className="container__file">
          <div className="header"></div>
          {loading ? "" : <Preloader />}

          <div className="image__container">
            <div className="carousel-layout">

            <div className="carousel-container">


          <Carousel
          width="100%" >
            {ListingDetails?.images.map((image, i) => (
              <img src={image} alt={`${i}`} className="image-slider" />
            ))}
          </Carousel>
            </div>
            </div>


            <div className="container__title">
              <h4 className="title__listing"> {ListingDetails?.name}</h4>
              <p className="slogan__listing">{ListingDetails?.slogan}</p>
              <div>
                <span className="comments">
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
                      {listingComments.length}{" "}
                      <FormattedMessage
                        id="listing.comments"
                        defaultMessage="Personas han opinado"
                      />
                    </strong>
                  </Link>
                </span>
              </div>
              <span className="ratings">
                <div className="rating">
                  <div className="number__rating">
                    <span className="rating__icon">
                      <AllInclusiveIcon />
                    </span>
                    <span className="number">
                      {" "}
                      <strong>{ListingDetails?.itins}</strong>/100 itins
                    </span>
                  </div>

                  {/* Empieza el recuadro de peculiaridades del emplazamiento */}

                  <div className="peculiarities__listing">
                    <div className="peculiarities">
                      <span className="peculiarities__icons">
                        <AccountBalanceIcon />{" "}
                      </span>
                      <div className="pec__explaining">
                        <span className="peculiarities__title">
                          <FormattedMessage
                            id="listing.emblematic"
                            defaultMessage="Emblemático"
                          />{" "}
                        </span>
                        <span className="peculiarities__resume">
                          <FormattedMessage
                            id="listing.emblematicdesc"
                            defaultMessage="Este lugar es representativo de la zona"
                          />{" "}
                        </span>
                      </div>
                    </div>

                    <div className="peculiarities">
                      <span className="peculiarities__icons">
                        <FavoriteBorderIcon />{" "}
                      </span>
                      <div className="pec__explaining">
                        <span className="peculiarities__title">

                           {ListingDetails?.productstar}
                          {" "}
                        </span>
                        <span className="peculiarities__resume">
                          <FormattedMessage
                            id="listing.star"
                            defaultMessage=" Recomendado en el Lugar "
                          />{" "}
                        </span>
                      </div>
                    </div>

                    {/* <div className="peculiarities">
                    <span className="peculiarities__icons">
                      <AccountBalanceIcon />{" "}
                    </span>
                    <div className="pec__explaining">
                      <span className="peculiarities__title"> Terraza</span>
                      <span className="peculiarities__resume">
                        {" "}
                        Establecimiento con terraza habilitada para clientes
                      </span>
                    </div>
                  </div>  */}

                      {/* <div className="peculiarities">
                      <span className="peculiarities__icons">
                        <AccountBalanceIcon />{" "}
                      </span>
                      <div className="pec__explaining">
                        <span className="peculiarities__title"> Zona de fumadores</span>
                        <span className="peculiarities__resume"> Se puede fumar </span>
                      </div>
                    </div> */}

                    <div className="peculiarities">
                      <span className="peculiarities__icons">
                        <CreditCardIcon />{" "}
                      </span>
                      <div className="pec__explaining">
                        <span className="peculiarities__title">
                          {" "}
                          <FormattedMessage
                            id="listing.price"
                            defaultMessage="Precio Medio"
                          />{" "}
                          <span className="price">
                            {ListingDetails?.price} €
                          </span>{" "}
                        </span>
                        <span className="peculiarities__resume">
                          <FormattedMessage
                            id="listing.cost"
                            defaultMessage="Coste medio por persona"
                          />
                        </span>
                      </div>
                    </div>

                    <div className="peculiarities">
                      <span className="peculiarities__icons">
                        <PhoneIcon />{" "}
                      </span>
                      <div className="pec__explaining">
                        <span className="peculiarities__title">
                          +34{" "}
                          <span className="price">{ListingDetails?.phone}</span>{" "}
                        </span>
                        <span className="peculiarities__resume">
                          {" "}
                          <FormattedMessage
                            id="listing.reservation"
                            defaultMessage="o reserva con itineramio Gratis"
                          />
                        </span>
                      </div>
                    </div>
                    <div className="address mt-2">
                      <span className="location__icon">
                        <LocationOnIcon />
                      </span>
                      <span className="peculiarities__title__green">
                        {" "}
                        {ListingDetails?.location}{" "}
                      </span>
                    </div>
                  </div>

                  {/* Acaba el recuadro de peculiaridades  */}
                </div>
              </span>

              <div className="booking-container">
                <ReactWhatsapp
                  className="button-booking"
                  number="+34652656440"
                  message="Me gustaría reservar este restaurante para el dia ** a las ** para ** personas. "
                  title="Reservar"
                >
                  <FormattedMessage
                    id="listing.book"
                    defaultMessage="Reservar"
                  />
                </ReactWhatsapp>
              </div>
            </div>
          </div>

          <div className="main__description">
            <div className="container__description">
              <div className="description__listing">
                <h6 className="description__title">
                  <FormattedMessage
                    id="listing.description"
                    defaultMessage="Descripción"
                  />
                </h6>
                {ListingDetails?.description}
              </div>
              <div className="description__listing">
                <h6 className="description__title">
                  <FormattedMessage
                    id="listing.best"
                    defaultMessage="Lo mejor del lugar"
                  />
                </h6>
                {ListingDetails?.best}
              </div>
              <div className="description__listing">
                <h6 className="description__title">
                  <FormattedMessage
                    id="listing.location"
                    defaultMessage="¿Dónde está?"
                  />
                </h6>
                <section className="map-container">

                <Map />

              </section>
              </div>
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
              <CommentBox />
              <div className="title" id="commentsec">
                <AllInclusiveIcon className="ratin__icon" />
                <h4 className=" ml-2">
                  {listingComments.length}{" "}
                  <FormattedMessage
                    id="listing.comments2"
                    defaultMessage="Comentarios"
                  />

                </h4>
              </div>
              <div id="commentsec" className="comment-box">
                {listingComments.map(
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
        </div>
      </div>
      <div></div>
    </div>
  );
}

export default ListingDetails;
