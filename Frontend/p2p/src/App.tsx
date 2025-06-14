import { BrowserRouter, Route, Routes } from "react-router-dom";
import Room from "./components/Room";
import VideoChat from './components/VideoChat';

function App() {
  

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<VideoChat />} ></Route>
      <Route path="/room" element={<Room />}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
