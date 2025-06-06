import "./css/App.css";
import Home from "./pages/Home";
import Mapify from "./pages/Mapify";
import NavBar from "./components/NavBar";
import {Routes, Route} from "react-router-dom";

function App() {
  return (
    <>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/mapify" element={<Mapify />}/>
        </Routes>
      </main>
    </>
  );
}

export default App
