import axios from "axios";

const searchLocation = async (query) => {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query,
        format: "jsonv2",
        limit: 5,
        addressdetails: 1,
        countrycodes: "in"
      },
      headers: {
        "User-Agent":
          "TrekSafe/1.0 (treksafe development project)"
      }
    }
  );

  return response.data.map((place) => ({
    name: place.display_name,
    latitude: Number(place.lat),
    longitude: Number(place.lon)
  }));
};

export { searchLocation };