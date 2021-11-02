

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactWhatsapp from "react-whatsapp";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { FormattedMessage } from "react-intl";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import { db } from "../../firebase";


function PriceBoxExperience() {

  const { experienceId, experienceName } = useParams();
  const [ExperienceDetails, setExperienceDetails] = useState([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);


    setLoading(true);
    if (experienceId) {
      db.collection("experiences")
        .doc(experienceId)
        .onSnapshot((snapshot) => setExperienceDetails(snapshot.data()));
    }


  }, [experienceId]);


  return (

    <div className="container_pricebox"  >


    <div className="pricebox ">
      <div className="pec__explaining">
      <span className="peculiarities__title">
        {" "}

        <FormattedMessage
          id="experience.price.since"
          defaultMessage=" Desde"
           />{" "}

      <span className="experience-price">
        {ExperienceDetails?.price}

          <FormattedMessage
          id="experience.price"
          defaultMessage="€/persona"
           />

      </span>{" "}
    </span>

    </div>



      <span className="experience_ratings">
        <div className="rating">
        <div className="included">
          <span className="peculiarities__icons">
            <AccessTimeIcon />{" "}
          </span>
          <div className="pec__explaining">
            <span className="experience-duration">
              { ExperienceDetails?.duration } horas en total
            </span>
          </div>
        </div>
         <div className="number__rating mt-2">
            <span className="rating__icon">
              <AllInclusiveIcon />
            </span>
        <span className="number">
          {" "}
          <strong>{ExperienceDetails?.itins}</strong>/100 itins
        </span>

    </div>
<div className="experience-location ">

<div className="address mt-2">
  <span className="location__icon">
    <LocationOnIcon />
  </span>
  <span className="peculiarities__title__green">
    {" "}
    {ExperienceDetails?.location}{" "}
  </span>
</div>

</div>
</div>
</span>

<div className="booking-container">
  <ReactWhatsapp
    className="button-booking"
    number="+34652656440"
    message="Hola tengo una pregunta sobre la experiencia "
    title="Hacer pregunta"
  >
    <FormattedMessage
      id="listing.book"
      defaultMessage=" Preguntar"
    />
  </ReactWhatsapp>
</div>
</div>

</div>

  )
}

export default PriceBoxExperience


