import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdoptionStats from "./components/AdoptionStats";
import MapView from "./components/MapView";
import ListDog from "./components/ListDog";
import Profile from "./components/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdoptionStats />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/list-dog" element={<ListDog />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
