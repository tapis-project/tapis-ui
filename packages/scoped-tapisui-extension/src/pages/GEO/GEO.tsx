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
  const [rectangleLayer, setRectangleLayer] = useState<L.Rectangle | null>(
    null
  );
  const [fitBoundsEnabled, setFitBoundsEnabled] = useState(false);

  const featureGroupRef = useRef<L.FeatureGroup>(null);

  const fetchCoordinates = async (
    lonRange: [number, number],
    latRange: [number, number]
  ) => {
    setLoading(true);
    setError(null);

    try {
      let lonRanges: [number, number][] = [];

      // Normalize longitudes greater than 180
      const [lonMin, lonMax] = lonRange;

      if (lonMax > 180) {
        // Split into two ranges: from lonMin to 180, and -180 to (lonMax - 360)
        lonRanges = [
          [lonMin, 180],
          [-180, lonMax - 360],
        ];
      } else {
        lonRanges = [[lonMin, lonMax]];
      }

      const allCoordinates: [number, number][] = [];

      for (const [min, max] of lonRanges) {
        // http://localhost:5050/api/coordinates/
        const response = await fetch(
          'https://mspassgeopod.pods.tacc.tapis.io/api/coordinates/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lon_range: [min, max],
              lat_range: latRange,
            }),
          }
        );

        const data = await response.json();
        if (data.coordinates) {
          allCoordinates.push(...data.coordinates);
        } else {
          setError(data.error || 'Unknown error from backend');
          break;
        }
      }

      setCoordinates(allCoordinates);
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

  const clearRectangle = () => {
    if (rectangleLayer) {
      featureGroupRef.current?.removeLayer(rectangleLayer);
      setRectangleLayer(null);
    }
  };

  const handleSearch = () => {
    setFitBoundsEnabled(true);
    clearRectangle();

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

    let lonMinVal = Number(lonMin);
    let lonMaxVal = Number(lonMax);
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
    /*const outOfRange = (val: number) => val < -180 || val > 180;
    if ([lonMinVal, lonMaxVal, latMinVal, latMaxVal].some(outOfRange)) {
      setError('All values must be between -180 and 180.');
      return;
    }*/

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
      if (fitBoundsEnabled && coordinates.length > 0) {
        const bounds = L.latLngBounds(
          coordinates.map(([lon, lat]) => [lat, lon])
        );
        map.fitBounds(bounds, { padding: [100, 100] });
      }
    }, [coordinates, map, fitBoundsEnabled]);

    return null;
  };

  const handleResetToDefault = () => {
    setFitBoundsEnabled(true);
    clearRectangle();
    setLonMin('-180');
    setLonMax('180');
    setLatMin('-180');
    setLatMax('180');
    setError(null);
    fetchCoordinates([-180, 180], [-180, 180]);
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

      setLonMin(southWest.lng.toFixed(6));
      setLatMin(southWest.lat.toFixed(6));
      setLonMax(northEast.lng.toFixed(6));
      setLatMax(northEast.lat.toFixed(6));

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
      <div style={{ width: '20%', paddingRight: '1rem' }}>
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
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
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

        {loading && (
          <p style={{ marginTop: '0.5rem' }}>Loading coordinates...</p>
        )}
        {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
        {!loading && !error && (
          <p style={{ marginTop: '0.5rem' }}>
            Coordinates shown on map: {coordinates.length}
          </p>
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
          {coordinates.length > 0 && <FitBounds />}
          {coordinates.flatMap(([lon, lat], idx) => {
            const duplicates: [number, number][] = [
              [lon, lat],
              [lon - 360, lat],
              [lon + 360, lat],
            ];

            return duplicates.map(([dlon, dlat], i) => (
              <Marker key={`${idx}-${i}`} position={[dlat, dlon]}>
                <Popup>
                  Longitude: {lon.toFixed(6)}, Latitude: {lat.toFixed(6)}
                </Popup>
              </Marker>
            ));
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default GEO;
