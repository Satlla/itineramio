import React from "react";
import '../../css/components/dashboard.css'
import profile from '../../assets/profiles/alex.jpg'

function DearHost() {
  return (
    <div className="profile__card" >

      <img src={profile} className="profile-img mb-2" alt="alex"></img>
        <h4 className="dear"> Buenas noches, Alejandro</h4>
    </div>
  
  )
}

export default DearHost
