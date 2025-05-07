import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { SectionHeader } from '@tapis/tapisui-common';
import { MapContainer, TileLayer, useMap, FeatureGroup } from 'react-leaflet';
import { EditControl as _EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-canvas-markers';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useTapisConfig } from '@tapis/tapisui-hooks';

const EditControl = (props: any) => {
  return React.createElement(_EditControl, props);
};

const getEarthquakeIcon = (magnitude: number) => {
  // Assumption (a rough range)
  const minMag = 4.5;
  const maxMag = 9.0;

  const minSize = 15;
  const maxSize = 40;

  // Clamp and scale
  const clampedMag = Math.max(minMag, Math.min(maxMag, magnitude));
  const scale = (clampedMag - minMag) / (maxMag - minMag);
  const size = minSize + scale * (maxSize - minSize);

  return new L.Icon({
    iconUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a0/Circle_-_black_simple.svg',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const StationIcon = new L.Icon({
  iconUrl:
    'https://upload.wikimedia.org/wikipedia/commons/1/19/Triangle_blue.svg',
  iconSize: [15, 15],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7],
});

// const baseURL = 'https://mspassgeopod.pods.tacc.tapis.io';
const baseURL = 'https://mspassgeopod.pods.scoped.tapis.io';
// const baseURL = 'https://mspassgeopodnoauth.pods.scoped.tapis.io';
// const baseURL = 'http://localhost:5050';

type Coordinate = {
  lon: number;
  lat: number;
  magnitude?: number;
  id?: string;
};

const GEO: React.FC = () => {
  const [earthquakes, setEarthquakes] = useState<Coordinate[]>([]); // as input
  const [normalizedEarthquakes, setNormalizedEarthquakes] = useState<
    Coordinate[]
  >([]); // -180 ~ 180

  const [stations, setStations] = useState<Coordinate[]>([]);
  const [normalizedStations, setNormalizedStations] = useState<Coordinate[]>(
    []
  );

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rectangleLayer, setRectangleLayer] = useState<L.Rectangle | null>(
    null
  );
  const [fitBoundsEnabled, setFitBoundsEnabled] = useState(false);

  const [earthquakeFetchDone, setEarthquakeFetchDone] = useState(false);
  const [stationFetchDone, setStationFetchDone] = useState(false);

  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const mapRef = useRef<L.Map>(null);

  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  const earthquakeIconCache = useRef<Map<number, L.Icon>>(new Map());

  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const getCachedEarthquakeIcon = (magnitude: number) => {
    const mag = Math.round((magnitude ?? 0) * 10) / 10; // round to 1 decimal
    if (earthquakeIconCache.current.has(mag))
      return earthquakeIconCache.current.get(mag)!;

    const icon = getEarthquakeIcon(mag);
    earthquakeIconCache.current.set(mag, icon);
    return icon;
  };

  const fetchEarthquakes = async (
    lonRange: [number, number],
    latRange: [number, number]
  ) => {
    setEarthquakeFetchDone(false);
    setError(null);

    try {
      const response = await fetch(baseURL + '/api/earthquakes/', {
        method: 'POST',
        headers: {
          'X-Tapis-Token': jwt,
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
      } else {
        setError(data.error || 'Unknown error from backend');
      }
    } catch (err) {
      setError('Error fetching earthquake coordinates: ' + err);
    } finally {
      setEarthquakeFetchDone(true);
    }
  };

  const fetchStations = async (
    lonRange: [number, number],
    latRange: [number, number]
  ) => {
    setStationFetchDone(false);
    setError(null);

    try {
      const response = await fetch(baseURL + '/api/stations/', {
        method: 'POST',
        headers: {
          'X-Tapis-Token': jwt,
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
      } else {
        setError(data.error || 'Unknown error from backend');
      }
    } catch (err) {
      setError('Error fetching station coordinates: ' + err);
    } finally {
      setStationFetchDone(true);
    }
  };

  // Fetch all coordinates on page load
  useEffect(() => {
    setLoading(true);
    setEarthquakeFetchDone(false);
    setStationFetchDone(false);
    setShowEarthquakes(true);
    setShowStations(true);
    setTempShowEarthquakes(true);
    setTempShowStations(true);
    fetchEarthquakes([-180, 180], [-180, 180]);
    fetchStations([-180, 180], [-180, 180]);
  }, []);

  useEffect(() => {
    if (
      ((showEarthquakes && earthquakeFetchDone) || !showEarthquakes) &&
      ((showStations && stationFetchDone) || !showStations)
    ) {
      setLoading(false); // ✅ only when both are truly done
    }
  }, [earthquakeFetchDone, stationFetchDone, showEarthquakes, showStations]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear previous marker layer if it exists
    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();
      map.removeLayer(markerLayerRef.current);
    }

    const markers: L.Marker[] = [];

    if (showEarthquakes) {
      earthquakes.forEach((coord, idx) => {
        const icon = getCachedEarthquakeIcon(coord.magnitude ?? 0);
        const marker = L.marker([coord.lat, coord.lon], { icon });

        const normCoord = normalizedEarthquakes[idx];
        const normLon = normCoord?.lon;
        const normLat = normCoord?.lat;

        // Define popup content generator
        const generatePopupContent = () => `
          <strong>Earthquake</strong><br/>
          <strong>Original Coordinate (as your input)</strong><br/>
          Lon: ${coord.lon}<br/>
          Lat: ${coord.lat}<br/>
          <strong>Normalized Coordinate (in database)</strong><br/>
          Lon: ${normLon}<br/>
          Lat: ${normLat}<br/>
          ${
            coord.magnitude
              ? `<strong>Magnitude:</strong> ${coord.magnitude}`
              : ''
          }
        `;

        marker.bindPopup(generatePopupContent());
        markers.push(marker);
      });
    }

    if (showStations) {
      stations.forEach((coord, idx) => {
        const marker = L.marker([coord.lat, coord.lon], { icon: StationIcon });

        const normCoord = normalizedStations[idx];
        const normLon = normCoord?.lon;
        const normLat = normCoord?.lat;

        // Define popup content generator
        const generatePopupContent = () => `
          <strong>Station</strong><br/>
          <strong>Original Coordinate (as your input)</strong><br/>
          Lon: ${coord.lon}<br/>
          Lat: ${coord.lat}<br/>
          <strong>Normalized Coordinate (in database)</strong><br/>
          Lon: ${normLon}<br/>
          Lat: ${normLat}<br/>
          ${coord.id ? `<strong>ID:</strong> ${coord.id}` : ''} <br/>
          <button>Analyzing in Jupyter</button>
        `;

        marker.bindPopup(generatePopupContent());

        marker.on('popupopen', () => {
          const popupContent = marker.getPopup().getElement();
          const button = popupContent.querySelector('button');
          if (button) {
            button.addEventListener('click', async () => {
              try {
                const response = await fetch(
                  baseURL + '/api/generate-station-notebook/',
                  {
                    method: 'POST',
                    headers: {
                      'X-Tapis-Token': jwt,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      station_id: coord.id,
                    }),
                  }
                );

                const data = await response.json();
                if (response.ok && data.url) {
                  window.open(data.url, '_blank');
                } else {
                  alert(
                    'Failed to generate notebook: ' +
                      (data.error || 'Unknown error')
                  );
                }
              } catch (err) {
                alert('Error calling backend: ' + err);
              }
            });
          }
        });

        markers.push(marker);
      });
    }

    // Create a new marker layer group and add it all at once
    const layerGroup = L.markerClusterGroup({
      chunkedLoading: true,
      chunkDelay: 50,
      maxClusterRadius: 40, // ✅ Enables visual grouping of nearby markers
    });
    layerGroup.addLayers(markers);

    layerGroup.addTo(map);
    markerLayerRef.current = layerGroup;
  }, [
    showEarthquakes,
    showStations,
    normalizedEarthquakes,
    normalizedStations,
  ]);

  const clearRectangle = () => {
    if (rectangleLayer) {
      featureGroupRef.current?.removeLayer(rectangleLayer);
      setRectangleLayer(null);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    setEarthquakeFetchDone(false);
    setStationFetchDone(false);

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
      let coordinates: Coordinate[] = [];

      if (showEarthquakes) coordinates = coordinates.concat(earthquakes);
      if (showStations) coordinates = coordinates.concat(stations);

      if (coordinates.length === 0) return;

      const bounds = L.latLngBounds(
        coordinates.map((coord) => [coord.lat, coord.lon])
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
    // Set UI values (simulate user inputs)
    setTempLonMin('-180');
    setTempLonMax('180');
    setTempLatMin('-180');
    setTempLatMax('180');

    setTempShowEarthquakes(true);
    setTempShowStations(true);

    // Apply visual reset
    setFitBoundsEnabled(true);
    clearRectangle();
    setError(null);

    // 👇 simulate clicking search button
    setTimeout(() => {
      handleSearch();
    }, 0);
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
          ref={mapRef}
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
        </MapContainer>
      </div>
    </div>
  );
};

export default GEO;
