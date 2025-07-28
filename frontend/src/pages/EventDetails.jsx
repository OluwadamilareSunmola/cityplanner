import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

function EventDetails() {
    const navigate = useNavigate()
  return (
    <div className="wrapper-home">
      <Sidebar />
      <div className="container-form">
        <div className="planner">
          <div className="planer-data">
            <h2>Event Details</h2>
            <h3>Title</h3>
            <ul>
              <p>time</p>
              <p>address</p>
              <p>type</p>
            </ul>
            <p className="description">description</p>
            <div className="activities">
              <h3>activities</h3>
            </div>
            <div className="buttons">
              <button onClick={() => navigate('/events')}>return</button>
              <button>edit</button>
            </div>
          </div>
          <div className="map">
            <img src="https://res.cloudinary.com/freshis/image/upload/v1649685993/mango_6f4f04bff3.jpg"></img>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
