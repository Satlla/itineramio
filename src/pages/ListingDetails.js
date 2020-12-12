import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import Preloader from '../components/Preloader';
import '../css/components/ListingDetails.css';
import HeaderTransparent from '../components/HeaderTransparent';
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import CreditCardIcon from '@material-ui/icons/CreditCard';
import SmokingRoomsIcon from '@material-ui/icons/SmokingRooms';
import FlareIcon from '@material-ui/icons/Flare';
import LocalParkingIcon from '@material-ui/icons/LocalParking';
import RestaurantIcon from '@material-ui/icons/Restaurant';


function ListingDetails() {
  const { listingId } = useParams();
  const [ListingDetails, setListingDetails] = useState(null);
  const [loading, setLoading ] = useState(false);

  useEffect(() => {
    if (listingId) {
      db.collection("listings")
        .doc(listingId)
        .onSnapshot(snapshot => setListingDetails(snapshot.data())

      )
    }
    setLoading(true)

  }, [listingId]);

  return (
    <div>
       <HeaderTransparent />
       <div className="header" ></div>
       { loading ? "" : <Preloader />}

      <img className="image__listing" src={ListingDetails?.image}></img>
      <h4 className="title__listing"> {ListingDetails?.name}</h4>
      <p className="slogan__listing">{ListingDetails?.slogan}</p>
      <span className="ratings">
        <div className="rating">
          <span className="rating__icon"><AllInclusiveIcon /></span>
          <span className="number"> <strong>98 itins </strong>/ 100</span>
        </div>

        <div className="address">
          <span className="location__icon">< LocationOnIcon /></span>
          <span className="location__address"> Calle de la huerta 133 </span>
        </div>

        </span>
        <hr className="divider"></hr>
        <div className="peculiarities__listing">

          <div className="peculiarities">

          <span className="peculiarities__icons">< RestaurantIcon/> </span>
          <div className="pec__explaining">

          <span className="peculiarities__title"> Tradicional</span>
          <span className="peculiarities__resume">  Este restaurante es representativo de la zona</span>
          </div>

        </div>

        <div className="peculiarities">

        <span className="peculiarities__icons">< LocalParkingIcon/> </span>
        <div className="pec__explaining">

        <span className="peculiarities__title"> Parking</span>
        <span className="peculiarities__resume">  Tiene parking cerca o en las instalaciones</span>
        </div>

        </div>
        <div className="peculiarities">

        <span className="peculiarities__icons">< FlareIcon/> </span>
        <div className="pec__explaining">

        <span className="peculiarities__title"> Terraza</span>
        <span className="peculiarities__resume">  Establecimiento con terraza habilitada para clientes</span>
        </div>

        </div>

        <div className="peculiarities">

        <span className="peculiarities__icons">< SmokingRoomsIcon/> </span>
        <div className="pec__explaining">

        <span className="peculiarities__title"> Zona de fumadores</span>
        <span className="peculiarities__resume"> Se puede fumar </span>
        </div>

        </div>

        <div className="peculiarities">

        <span className="peculiarities__icons">< CreditCardIcon/> </span>
        <div className="pec__explaining">

        <span className="peculiarities__title"> Precio Medio </span>
        <span className="peculiarities__resume"> Coste por medio por comensal  </span>
        </div>

        </div>


        </div>
      <hr className="divider"></hr>

      <div className="description__listing">
        <h3 className="description__title"> Sobre el Lugar</h3>
      It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here',
      </div>
    </div>
  );
}

export default ListingDetails;
