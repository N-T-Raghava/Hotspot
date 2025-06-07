from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import requests
from shapely.geometry import LineString
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/geocode")
def geocode(place: str):
    url = "https://nominatim.openstreetmap.org/search"
    headers = {"User-Agent": "HotspotApp/1.0 (tanmairaghav3836@gmail.com)"}
    params = {"q": place, "format": "json", "limit": 1}
    resp = requests.get(url, headers=headers, params=params)
    data = resp.json()
    if data:
        return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}
    return JSONResponse(status_code=404, content={"error": "Place not found"})

@app.get("/route")
def get_route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}"
    params = {"overview": "full", "geometries": "geojson"}
    resp = requests.get(url, params=params)
    data = resp.json()
    coords = data["routes"][0]["geometry"]["coordinates"]
    return {"route": [(lat, lon) for lon, lat in coords]}

@app.post("/buffer")
def create_buffer_polygon(coords: List[List[float]], buffer_meters: float = 100):
    line = LineString([(lon, lat) for lat, lon in coords])
    buffer_deg = buffer_meters / 111320
    buffered = line.buffer(buffer_deg)
    polygon_coords = list(buffered.exterior.coords)
    return {"polygon": [(lat, lon) for lon, lat in polygon_coords]}

@app.post("/places")
def fetch_places_in_polygon(polygon_coords: List[List[float]]):
    polygon_str = " ".join([f"{lat} {lon}" for lat, lon in polygon_coords])
    query = f"""
    [out:json][timeout:25];
    (
      node["tourism"~"^(attraction|museum|viewpoint|gallery|theme_park|zoo|aquarium|castle|monument|memorial|artwork)$"](poly:"{polygon_str}");
      node["amenity"~"^(theatre|cinema|casino|arts_centre|hotel)$"](poly:"{polygon_str}");
      node["historic"~"^(castle|monument|memorial|archaeological_site|ruins|fort|palace)$"](poly:"{polygon_str}");
      node["leisure"~"^(park|nature_reserve|water_park|beach_resort)$"](poly:"{polygon_str}");
    );
    out geom;
    """
    url = "https://overpass-api.de/api/interpreter"
    resp = requests.post(url, data={"data": query})
    return resp.json()
