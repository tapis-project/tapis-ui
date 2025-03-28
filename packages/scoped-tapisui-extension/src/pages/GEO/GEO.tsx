import * as React from 'react';
import { useState, useEffect } from 'react';
import { SectionHeader } from '@tapis/tapisui-common';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const GEO: React.FC = () => {
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [lonMin, setLonMin] = useState<string>('-180');
  const [lonMax, setLonMax] = useState<string>('180');
  const [latMin, setLatMin] = useState<string>('-180');
  const [latMax, setLatMax] = useState<string>('180');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoordinates = async (
    lonRange: [number, number],
    latRange: [number, number]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5050/api/coordinates/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lon_range: lonRange,
          lat_range: latRange,
        }),
      });

      const data = await response.json();
      if (data.coordinates) {
        setCoordinates(data.coordinates);
      } else {
        setError(data.error || 'Unknown error from backend');
      }
    } catch (err) {
      setError('Error fetching coordinates: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all coordinates on page load
  useEffect(() => {
    fetchCoordinates([-180, 180], [-180, 180]);
  }, []);

  const handleSearch = () => {
    // Empty check
    if (
      lonMin.trim() === '' ||
      lonMax.trim() === '' ||
      latMin.trim() === '' ||
      latMax.trim() === ''
    ) {
      setError('All fields are required.');
      return;
    }

    const lonMinVal = Number(lonMin);
    const lonMaxVal = Number(lonMax);
    const latMinVal = Number(latMin);
    const latMaxVal = Number(latMax);

    // NaN check
    if (
      isNaN(lonMinVal) ||
      isNaN(lonMaxVal) ||
      isNaN(latMinVal) ||
      isNaN(latMaxVal)
    ) {
      setError('All inputs must be valid numbers.');
      return;
    }

    // Range check
    const outOfRange = (val: number) => val < -180 || val > 180;
    if ([lonMinVal, lonMaxVal, latMinVal, latMaxVal].some(outOfRange)) {
      setError('All values must be between -180 and 180.');
      return;
    }

    // Order check
    if (lonMinVal > lonMaxVal) {
      setError('Longitude Min must be less than or equal to Longitude Max.');
      return;
    }
    if (latMinVal > latMaxVal) {
      setError('Latitude Min must be less than or equal to Latitude Max.');
      return;
    }

    setError(null);
    fetchCoordinates([lonMinVal, lonMaxVal], [latMinVal, latMaxVal]);
  };

  // Component to auto-fit map bounds
  const FitBounds = () => {
    const map = useMap();

    useEffect(() => {
      if (coordinates.length > 0) {
        const bounds = L.latLngBounds(
          coordinates.map(([lon, lat]) => [lat, lon])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }, [coordinates, map]);

    return null;
  };

  const handleResetToDefault = () => {
    setLonMin('-180');
    setLonMax('180');
    setLatMin('-180');
    setLatMax('180');
    setError(null);
    fetchCoordinates([-180, 180], [-180, 180]);
  };

  return (
    <div
      style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Left Panel: Inputs */}
      <div style={{ width: '15%', paddingRight: '1rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <label>
            Longitude Min:&nbsp;
            <input
              style={{ width: '100%' }}
              value={lonMin}
              onChange={(e) => setLonMin(e.target.value)}
            />
          </label>
          <label>
            Longitude Max:&nbsp;
            <input
              style={{ width: '100%' }}
              value={lonMax}
              onChange={(e) => setLonMax(e.target.value)}
            />
          </label>
          <label>
            Latitude Min:&nbsp;
            <input
              style={{ width: '100%' }}
              value={latMin}
              onChange={(e) => setLatMin(e.target.value)}
            />
          </label>
          <label>
            Latitude Max:&nbsp;
            <input
              style={{ width: '100%' }}
              value={latMax}
              onChange={(e) => setLatMax(e.target.value)}
            />
          </label>
          <div>
            <button type="submit" style={{ marginRight: '0.5rem' }}>
              Search
            </button>
            <button type="button" onClick={handleResetToDefault}>
              Default
            </button>
          </div>
        </form>

        {loading && <p>Loading coordinates...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {/* Right Panel: Map */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[0, 0]} // this will be overridden by FitBounds
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {coordinates.length > 0 && <FitBounds />}
          {coordinates.map(([lon, lat], idx) => (
            <Marker key={idx} position={[lat, lon]}>
              <Popup>
                Longitude: {lon}, Latitude: {lat}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default GEO;
