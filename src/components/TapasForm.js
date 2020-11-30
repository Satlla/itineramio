import React, { useEffect } from "react";
import { fb } from "../firebase";
import "../css/components/newlisting.css";
import { toast } from 'react-toastify';


const db = fb.firestore();

function TapaForm() {
  const [fileUrl, setFileUrl] = React.useState(null);
  const [tapas, settapas] = React.useState([]);

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    const storageRef = fb.storage().ref();
    const fileRef = storageRef.child(file.name);
    await fileRef.put(file);
    setFileUrl(await fileRef.getDownloadURL());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const tapaname = e.target.tapasname.value;
    const tapaslogan = e.target.tapaslogan.value;
    if (!tapaname || !fileUrl || !tapaslogan) {
      return;
    }
    await db.collection("tapas").doc(tapaname).set({
      name: tapaname,
      image: fileUrl,
      slogan: tapaslogan,
    });
    toast('Se ha añadido el anuncio correctamente', {
      type : 'success',
      autoClose: 2000
    })

  };

  useEffect(() => {
    const fetchtapas = async () => {
      const tapasCollection = await db.collection("tapas").get();
      settapas(
        tapasCollection.docs.map((doc) => {
          return doc.data();
        })
      );
    };
    fetchtapas();
  }, []);

  return (
    <div className="col-lg-6">
      <h3> Añadir bar de tapas </h3>

      <form className=" card card-body" onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="text "
            className="form-control"
            placeholder="Some Url"
            name="tapaname"
            placeholder="Bar de Tapas"
          />
        </div>
        <div className="form-group">
          <input
            type="text "
            className="form-control"
            placeholder="Some Url"
            name="tapalogan"
            placeholder="Slogan del listing"
          />
        </div>
        <input type="file" id="subirfoto" onChange={onFileChange} />
        <button className="btn btn-primary btn-block mt-4">
          {" "}
          Enviar tapas{" "}
        </button>
      </form>

    </div>
  );
}

export default TapaForm;
