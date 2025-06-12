import { useLocation } from "react-router-dom";

const Room = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const username = params.get("username") || "Guest";
  console.log('ROOM CREATED SUCCESSFULLY');
  return <h1>Hi, {username}!</h1>;
};

export default Room;