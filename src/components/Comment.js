import React from "react";
import "../css/components/comment.css";
import userImage from "../assets/icons/user.svg";


function Comment({ comment, title, username }) {
  return (


    <div className="comment__container">

      <div className="comment__card ">

      <div className="comment__profile">
        <img className="userimage mr-2 mb-4" src={userImage} alt="" />
        <h6 className="comment__username">{username}</h6>
        {/* <p> { new Date(timestamp?.toDate()).toUTCString()}</p> */}
      </div>
      <div className="comment">
        <h5>{title}</h5>
        <p>{comment}</p>
      </div>
      </div>
    </div>

  );
}

export default Comment;
