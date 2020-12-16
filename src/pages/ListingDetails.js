import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import Preloader from "../components/Preloader";
import "../css/components/ListingDetails.css";
import HeaderTransparent from "../components/HeaderTransparent";
import AllInclusiveIcon from "@material-ui/icons/AllInclusive";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import CreditCardIcon from "@material-ui/icons/CreditCard";
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";

function ListingDetails() {
  const { listingId } = useParams();
  const [ListingDetails, setListingDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (listingId) {
      db.collection("listings")
        .doc(listingId)
        .onSnapshot((snapshot) => setListingDetails(snapshot.data()));
    }
    setLoading(true);
  }, [listingId]);

  return (
    <div>
      <HeaderTransparent />
      <div className="header"></div>
      {loading ? "" : <Preloader />}

      <img className="image__listing" src={ListingDetails?.image} alt="listing-itineramio"></img>
      <h4 className="title__listing"> {ListingDetails?.name}</h4>
      <p className="slogan__listing">{ListingDetails?.slogan}</p>
      <span className="ratings">
        <div className="rating">
          <span className="rating__icon">
            <AllInclusiveIcon />
          </span>
          <span className="number">
            {" "}
            <strong>{ListingDetails?.itins}</strong>/100 itins
          </span>
        </div>

        <div className="address">
          <span className="location__icon">
            <LocationOnIcon />
          </span>
          <span className="location__address"> {ListingDetails?.location} </span>
        </div>
      </span>
      <hr className="divider"></hr>
      <div className="peculiarities__listing">
        <div className="peculiarities">
          <span className="peculiarities__icons">
            <AccountBalanceIcon />{" "}
          </span>
          <div className="pec__explaining">
            <span className="peculiarities__title"> Emblemático</span>
            <span className="peculiarities__resume">
              {" "}
              Este lugar es representativo de la zona
            </span>
          </div>
        </div>

        {/* <div className="peculiarities">
          <span className="peculiarities__icons">
            <FlareIcon />{" "}
          </span>
          <div className="pec__explaining">
            <span className="peculiarities__title"> Terraza</span>
            <span className="peculiarities__resume">
              {" "}
              Establecimiento con terraza habilitada para clientes
            </span>
          </div>
        </div> */}

        {/* <div className="peculiarities">
          <span className="peculiarities__icons">
            <SmokingRoomsIcon />{" "}
          </span>
          <div className="pec__explaining">
            <span className="peculiarities__title"> Zona de fumadores</span>
            <span className="peculiarities__resume"> Se puede fumar </span>
          </div>
        </div>
 */}
        <div className="peculiarities">
          <span className="peculiarities__icons">
            <CreditCardIcon />{" "}
          </span>
          <div className="pec__explaining">
            <span className="peculiarities__title"> Precio Medio <span className="price">{ListingDetails?.price} €</span> </span>
            <span className="peculiarities__resume">
              {" "}
              Coste por medio por pax{" "}
            </span>
          </div>
        </div>
      </div>

      <hr className="divider"></hr>

      <div className="description__listing">
        <h3 className="description__title"> Sobre el Lugar</h3>
        {ListingDetails?.description}
      </div>
      <div className="notification">
        <span className="notification__icon"> <ErrorOutlineIcon /></span>
        <span className="notification__text"> Todos los emplazamientos publicados en itineramio, tiene como fundamento, lograr la mejor experiencia del itinerer.</span>
    
      </div>
    </div>
  );
}

export default ListingDetails;
