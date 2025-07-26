import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';

function Map() {

  return (
    <div className='wrapper-home'>
      <Sidebar/>
    </div>
  );
}

export default Map;