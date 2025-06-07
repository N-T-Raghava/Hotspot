import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup } from "react-leaflet";

function App() {
  const [start, setStart] = useState("Eiffel Tower, Paris");
  const [end, setEnd] = useState("Louvre Museum, Paris");
  const [route, setRoute] = useState([]);
  const [buffer, setBuffer] = useState([]);
  const [places, setPlaces] = useState([]);

  const fetchData = async () => {
    const startGeo = await axios.get(`http://localhost:8000/geocode`, { params: { place: start } });
    const endGeo = await axios.get(`http://localhost:8000/geocode`, { params: { place: end } });

    const routeRes = await axios.get(`http://localhost:8000/route`, {
      params: {
        start_lat: startGeo.data.lat,
        start_lon: startGeo.data.lon,
        end_lat: endGeo.data.lat,
        end_lon: endGeo.data.lon,
      },
    });
    const routeCoords = routeRes.data.route;
    setRoute(routeCoords);

    const bufferRes = await axios.post(`http://localhost:8000/buffer`, {
      coords: routeCoords,
      buffer_meters: 200,
    });
    setBuffer(bufferRes.data.polygon);

    const placesRes = await axios.post(`http://localhost:8000/places`, {
      polygon_coords: bufferRes.data.polygon,
    });
    setPlaces(placesRes.data.elements || []);
  };

  return (
    <div>
      <h2>Tourist & Historic Spots Along a Route</h2>
      <input value={start} onChange={(e) => setStart(e.target.value)} />
      <input value={end} onChange={(e) => setEnd(e.target.value)} />
      <button onClick={fetchData}>Search</button>

      <MapContainer center={[48.8584, 2.2945]} zoom={13} style={{ height: "500px", marginTop: 20 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {route.length > 0 && <Polyline positions={route} color="blue" />}
        {buffer.length > 0 && <Polygon positions={buffer} color="red" />}
        {places.map((p, idx) => (
          <Marker key={idx} position={[p.lat, p.lon]}>
            <Popup>{p.tags.name || "Unnamed Place"}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
