import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import Preloader from "../components/Preloader";
import "../css/components/editlisting.css";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';


function EditListing() {
  const { listingId } = useParams();
  const [ListingDetails, setListingDetails] = useState('');
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    if (listingId) {
      db.collection("listings")
        .doc(listingId)
        .onSnapshot((snapshot) => setListingDetails(snapshot.data()));
    }
  }, [listingId]);
  console.log(listingId);

  return (

    <div>
       { loading ? "" : <Preloader />}
       <div className="cabecera">
        <Link className="header__whyus" to="/dashboard/userlistings">
          <ChevronLeftIcon/> volver
        </Link>
      </div>
      <h4> Edit listing</h4>
      <textarea name="" id="" cols="30" rows="10">

      {ListingDetails?.description}
      </textarea>
     

    </div>
  );
}

export default EditListing;
