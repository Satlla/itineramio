

import ReactWhatsapp from "react-whatsapp";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { FormattedMessage } from "react-intl";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";





function PriceBox( ) {

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
  return (

    <div className="container__title ">

              <span className="ratings">
                <div className="rating">
                  <div className="number__rating">
                    <span className="rating__icon">
                      <AllInclusiveIcon />
                    </span>
                    <span className="number">
                      {" "}
                      <strong>{ExperienceDetails?.itins}</strong>/100 itins
                    </span>
                  </div>
                  <div className="peculiarities__listing">

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
                            {ExperienceDetails?.price} €
                          </span>{" "}
                        </span>
                        <span className="peculiarities__resume">
                          <FormattedMessage
                            id="listing.cost"
                            defaultMessage="Coste por persona"
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
                  message="Me gustaría reservar este restaurante para el dia ** a las ** para ** personas. "
                  title="Hacer pregunta"
                >
                  <FormattedMessage
                    id="listing.book"
                    defaultMessage="Hacer Pregunta"
                  />
                </ReactWhatsapp>
              </div>
            </div>
  )
}

export default PriceBox
