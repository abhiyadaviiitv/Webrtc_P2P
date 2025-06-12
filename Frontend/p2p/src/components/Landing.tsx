import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [Username , setUserName] = useState("");
  const navigate = useNavigate();
  return (
    <div>
        <input type='text' onChange={(e) =>
        {
          setUserName(e.target.value);
        }}>
        </input>

        <button onClick={() =>navigate(`/room?username=${encodeURIComponent(Username)}`)
        }>Join Now</button>

    </div>
  )
}

export default Landing;