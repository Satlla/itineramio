import React, {useState} from 'react'
import '../css/components/commentBox.css'
import { useParams } from "react-router-dom";
import userImage from "../assets/icons/user.svg";
import { db } from "../firebase";
import { toast } from "react-toastify";


function CommentBox () {
  const { listingId } = useParams();

  const [commentMessage, setCommentMessage]= useState('');
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  
  
  // const initialStateValues = {
  //   comment: "",
  //   username: "",
  //   title: "",
  // };

  // const [ default, setDefault] = useState(initialStateValues);


const sendComment = e => {
  e.preventDefault();
  // setDefault({ ...initialStateValues });

  // const comment = e.target.comment.value;
  // const title = e.target.comment.value;
  // const username = e.target.comment.value;


  // if (
  //   !comment ||
  //   !title ||
  //   !username ||
  // ) {
  //   return;
  // }

  db.collection("listings").doc(listingId).collection
  ('comments').add({
    comment: commentMessage,
    username: userName,
    title: title,
    userImage: '',
  });
  toast("Se ha añadido el tu comentario correctamente", {
    type: "success",
    autoClose: 1000,
  });






};


  return (
    <div className="commentBox">
      <h5>Escribe tu comentario</h5>
      <form action="">

        <div className="comment__input">

          <input
          onChange={ e => setUserName(e.target.value)}
          className="comment__name"
          value={userName} type="text"
          placeholder=" Tu nombre"/>

          <input
          onChange={ e => setTitle(e.target.value)}
          className="comment__name"
          value={title} type="text"
          placeholder=" Escribe un titulo"
          />

          <textarea
          onChange={ e => setCommentMessage(e.target.value)}
          className="input__comment"
          type="text"
          placeholder="Describe tu experiencia en el establecimiento"/>


        </div>
        <button onClick={sendComment} type="submit" className="btn-comment"> Enviar</button>
      </form>

    </div>
  )
}

export default CommentBox;
