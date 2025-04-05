import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { SectionHeader } from '@tapis/tapisui-common';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  FeatureGroup,
  Rectangle,
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

const EarthquakeIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const StationIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const baseURL = 'https://mspassgeopod.pods.tacc.tapis.io';
// const baseURL = 'http://localhost:5050'

const GEO: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<[number, number][]>([]); // as input
  const [normalizedEarthquakes, setNormalizedEarthquakes] = useState<
    [number, number][]
  >([]); // -180 ~ 180
  const [allEarthquakes, setAllEarthquakes] = useState<[number, number][]>([]); // -540 ~ 540

  const [stations, setStations] = useState<[number, number][]>([]);
  const [normalizedStations, setNormalizedStations] = useState<
    [number, number][]
  >([]);
  const [allStations, setAllStations] = useState<[number, number][]>([]);

  const [showEarthquakes, setShowEarthquakes] = useState(true);
  const [showStations, setShowStations] = useState(true);

  const [tempShowEarthquakes, setTempShowEarthquakes] = useState(true);
  const [tempShowStations, setTempShowStations] = useState(true);

  const lonMinRef = useRef<HTMLInputElement>(null);
  const lonMaxRef = useRef<HTMLInputElement>(null);
  const latMinRef = useRef<HTMLInputElement>(null);
  const latMaxRef = useRef<HTMLInputElement>(null);

  const [tempLonMin, setTempLonMin] = useState<string>('-180');
  const [tempLonMax, setTempLonMax] = useState<string>('180');
  const [tempLatMin, setTempLatMin] = useState<string>('-180');
  const [tempLatMax, setTempLatMax] = useState<string>('180');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rectangleLayer, setRectangleLayer] = useState<L.Rectangle | null>(
    null
  );
  const [fitBoundsEnabled, setFitBoundsEnabled] = useState(false);

  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const fetchEarthquakes = async (
    lonRange: [number, number],
    latRange: [number, number]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(baseURL + '/api/earthquakes/', {
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
        setEarthquakes(data.coordinates);
        setNormalizedEarthquakes(data['normalized_coordinates']);
        setAllEarthquakes(data['all_coordinates']);
      } else {
        setError(data.error || 'Unknown error from backend');
      }
    } catch (err) {
      setError('Error fetching earthquake coordinates: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async (
    lonRange: [number, number],
    latRange: [number, number]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(baseURL + '/api/stations/', {
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
        setStations(data.coordinates);
        setNormalizedStations(data['normalized_coordinates']);
        setAllStations(data['all_coordinates']);
      } else {
        setError(data.error || 'Unknown error from backend');
      }
    } catch (err) {
      setError('Error fetching station coordinates: ' + err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all coordinates on page load
  useEffect(() => {
    setShowEarthquakes(true);
    setShowStations(true);
    setTempShowEarthquakes(true);
    setTempShowStations(true);
    fetchEarthquakes([-180, 180], [-180, 180]);
    fetchStations([-180, 180], [-180, 180]);
  }, []);

  const clearRectangle = () => {
    if (rectangleLayer) {
      featureGroupRef.current?.removeLayer(rectangleLayer);
      setRectangleLayer(null);
    }
  };

  const handleSearch = () => {
    setFitBoundsEnabled(true);
    clearRectangle();

    setShowEarthquakes(tempShowEarthquakes);
    setShowStations(tempShowStations);
    const lonMinStr = lonMinRef.current?.value ?? '';
    const lonMaxStr = lonMaxRef.current?.value ?? '';
    const latMinStr = latMinRef.current?.value ?? '';
    const latMaxStr = latMaxRef.current?.value ?? '';

    // Empty check
    if (
      lonMinStr.trim() === '' ||
      lonMaxStr.trim() === '' ||
      latMinStr.trim() === '' ||
      latMaxStr.trim() === ''
    ) {
      setError('All fields are required.');
      return;
    }

    const lonMinVal = Number(lonMinStr);
    const lonMaxVal = Number(lonMaxStr);
    const latMinVal = Number(latMinStr);
    const latMaxVal = Number(latMaxStr);

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
    const lonOutOfRange = (val: number) => val < -540 || val > 540;
    if ([lonMinVal, lonMaxVal].some(lonOutOfRange)) {
      setError('Longitude value must be between -540 and 540.');
      return;
    }

    const latOutOfRange = (val: number) => val < -180 || val > 180;
    if ([latMinVal, latMaxVal].some(latOutOfRange)) {
      setError('Latitude value must be between -180 and 180.');
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
    if (showEarthquakes)
      fetchEarthquakes([lonMinVal, lonMaxVal], [latMinVal, latMaxVal]);
    if (showStations)
      fetchStations([lonMinVal, lonMaxVal], [latMinVal, latMaxVal]);
  };

  // Component to auto-fit map bounds
  const FitBounds = () => {
    const map = useMap();

    useEffect(() => {
      if (!fitBoundsEnabled) return;

      // Combine coordinates based on what's enabled
      let coordinates: [number, number][] = [];

      if (showEarthquakes) coordinates = coordinates.concat(earthquakes);
      if (showStations) coordinates = coordinates.concat(stations);

      if (coordinates.length === 0) return;

      const bounds = L.latLngBounds(
        coordinates.map(([lon, lat]) => [lat, lon])
      );

      map.fitBounds(bounds, { padding: [100, 100] });
    }, [
      fitBoundsEnabled,
      showEarthquakes,
      showStations,
      earthquakes,
      stations,
      map,
    ]);

    return null;
  };

  const handleResetToDefault = () => {
    setFitBoundsEnabled(true);
    clearRectangle();
    setShowEarthquakes(true);
    setShowStations(true);
    setTempShowEarthquakes(true);
    setTempShowStations(true);
    setTempLonMin('-180');
    setTempLonMax('180');
    setTempLatMin('-180');
    setTempLatMax('180');
    setError(null);
    fetchEarthquakes([-180, 180], [-180, 180]);
    fetchStations([-180, 180], [-180, 180]);
  };

  const onDraw = (e) => {
    if (e.layerType === 'rectangle') {
      // Disable fit bounds
      setFitBoundsEnabled(false);

      // Remove previous rectangle
      if (rectangleLayer) {
        featureGroupRef.current?.removeLayer(rectangleLayer);
      }

      const layer = e.layer as L.Rectangle;
      const bounds = layer.getBounds();

      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      setTempLonMin(southWest.lng.toFixed(6));
      setTempLatMin(southWest.lat.toFixed(6));
      setTempLonMax(northEast.lng.toFixed(6));
      setTempLatMax(northEast.lat.toFixed(6));

      featureGroupRef.current?.addLayer(layer);
      setRectangleLayer(layer);
    }
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
      <div style={{ width: '20%', paddingRight: '1rem', overflow: 'auto' }}>
        <p>To search by drawing a location box:</p>
        <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
          <li>Click the top-right button;</li>
          <li>Draw a box to update longitude and latitude ranges;</li>
          <li>To redraw, click the top-right button again and draw a box;</li>
          <li>Click the Search button.</li>
        </ul>
        <p>
          When starting a new search outside of the current map view, it's
          recommended to click the Default button first to reset and display all
          the coordinates.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            width: '100%',
          }}
        >
          {/* Longitude Row */}
          <div
            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
          >
            <label>Longitude (Min / Max):</label>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input
                ref={lonMinRef}
                style={{ width: '50%' }}
                placeholder="Min"
                value={tempLonMin}
                onChange={(e) => setTempLonMin(e.target.value)}
              />
              <input
                ref={lonMaxRef}
                style={{ width: '50%' }}
                placeholder="Max"
                value={tempLonMax}
                onChange={(e) => setTempLonMax(e.target.value)}
              />
            </div>
          </div>

          {/* Latitude Row */}
          <div
            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
          >
            <label>Latitude (Min / Max):</label>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input
                ref={latMinRef}
                style={{ width: '50%' }}
                placeholder="Min"
                value={tempLatMin}
                onChange={(e) => setTempLatMin(e.target.value)}
              />
              <input
                ref={latMaxRef}
                style={{ width: '50%' }}
                placeholder="Max"
                value={tempLatMax}
                onChange={(e) => setTempLatMax(e.target.value)}
              />
            </div>
          </div>

          {/* Boolean Toggle Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={tempShowEarthquakes}
                onChange={(e) => setTempShowEarthquakes(e.target.checked)}
              />
              &nbsp;Show Earthquakes
            </label>
            <label style={{ marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={tempShowStations}
                onChange={(e) => setTempShowStations(e.target.checked)}
              />
              &nbsp;Show Stations
            </label>
          </div>

          {/* Buttons */}
          <div>
            <button type="submit" style={{ marginRight: '0.5rem' }}>
              Search
            </button>
            <button type="button" onClick={handleResetToDefault}>
              Default
            </button>
          </div>
        </form>

        {loading && (
          <p style={{ marginTop: '0.5rem' }}>Loading coordinates...</p>
        )}
        {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
        {!loading && !error && (
          <>
            {showEarthquakes && (
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                Selected Earthquakes: {earthquakes.length}
              </p>
            )}
            {showStations && (
              <p
                style={{
                  marginTop: showEarthquakes ? 0 : '0.5rem',
                  marginBottom: 0,
                }}
              >
                Selected Stations: {stations.length}
              </p>
            )}
          </>
        )}
      </div>

      {/* Right Panel: Map */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[0, 0]} // this will be overridden by FitBounds
          zoom={2}
          minZoom={2}
          scrollWheelZoom={true}
          maxBounds={[
            [-90, -540], // lat, lon (southwest corner)
            [90, 540], // lat, lon (northeast corner)
          ]}
          maxBoundsViscosity={1.0} // fully restrict dragging outside bounds
          style={{ height: '100%', width: '100%' }}
        >
          <FeatureGroup ref={featureGroupRef}>
            <EditControl
              position="topright"
              onCreated={onDraw}
              draw={{
                rectangle: { showArea: false },
                polyline: false,
                polygon: false,
                circle: false,
                marker: false,
                circlemarker: false,
              }}
              edit={{
                edit: false,
                remove: false,
              }}
            />
          </FeatureGroup>

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {((showEarthquakes && earthquakes.length > 0) ||
            (showStations && stations.length > 0)) && <FitBounds />}
          {showEarthquakes &&
            allEarthquakes.map(([lon, lat], idx) => {
              const normIdx = Math.floor(idx / 3); // group of 3 entries per normalized coordinate
              const [normLon, normLat] = normalizedEarthquakes[normIdx] || [];
              const markerIcon = EarthquakeIcon;
              return (
                <Marker key={idx} position={[lat, lon]} icon={markerIcon}>
                  <Popup>
                    <strong>Earthquake</strong>
                    <br />
                    <strong>Original Coordinate (as your input)</strong>
                    <br />
                    Longitude: {lon}
                    <br />
                    Latitude: {lat}
                    <br />
                    <strong>Normalized Coordinate (in database)</strong>
                    <br />
                    Longitude: {normLon}
                    <br />
                    Latitude: {normLat}
                  </Popup>
                </Marker>
              );
            })}
          {showStations &&
            allStations.map(([lon, lat], idx) => {
              const normIdx = Math.floor(idx / 3); // group of 3 entries per normalized coordinate
              const [normLon, normLat] = normalizedStations[normIdx] || [];
              const markerIcon = StationIcon;
              return (
                <Marker key={idx} position={[lat, lon]} icon={markerIcon}>
                  <Popup>
                    <strong>Station</strong>
                    <br />
                    <strong>Original Coordinate (as your input)</strong>
                    <br />
                    Longitude: {lon}
                    <br />
                    Latitude: {lat}
                    <br />
                    <strong>Normalized Coordinate (in database)</strong>
                    <br />
                    Longitude: {normLon}
                    <br />
                    Latitude: {normLat}
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
};

export default GEO;
