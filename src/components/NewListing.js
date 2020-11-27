import React, { useEffect } from "react";
import { fb } from "../firebase";
import "../css/components/newlisting.css";
import ListingsTable from "./ListingsTable";
import { toast } from 'react-toastify';


const db = fb.firestore();

function ListingForm() {
  const [fileUrl, setFileUrl] = React.useState(null);
  const [listings, setlistings] = React.useState([]);

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    const storageRef = fb.storage().ref();
    const fileRef = storageRef.child(file.name);
    await fileRef.put(file);
    setFileUrl(await fileRef.getDownloadURL());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const listingname = e.target.listingname.value;
    const listingslogan = e.target.listingslogan.value;
    if (!listingname || !fileUrl || !listingslogan) {
      return;
    }
    await db.collection("listings").doc(listingname).set({
      name: listingname,
      image: fileUrl,
      slogan: listingslogan,
    });
    toast('Se ha añadido el anuncio correctamente', {
      type : 'success',
      autoClose: 2000
    })

  };

  useEffect(() => {
    const fetchlistings = async () => {
      const listingsCollection = await db.collection("listings").get();
      setlistings(
        listingsCollection.docs.map((doc) => {
          return doc.data();
        })
      );
    };
    fetchlistings();
  }, []);

  return (
    <div className="col-lg-6">
      <h3> Añadir listing </h3>

      <form className=" card card-body" onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="text "
            className="form-control"
            placeholder="Some Url"
            name="listingname"
            placeholder="Nombre del listing"
          />
        </div>
        <div className="form-group">
          <input
            type="text "
            className="form-control"
            placeholder="Some Url"
            name="listingslogan"
            placeholder="Slogan del listing"
          />
        </div>
        <input type="file" id="subirfoto" onChange={onFileChange} />
        <button className="btn btn-primary btn-block mt-4">
          {" "}
          Enviar Listing{" "}
        </button>
      </form>
      <ListingsTable />
    </div>
  );
}

export default ListingForm;
