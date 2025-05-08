import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { NoirPoint } from '../types';

// Fix Leaflet default icon issues in React
// Use inline SVG as fallback since imported images may not resolve correctly
const markerIconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=';
const shadowUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAApCAQAAAACach9AAACMUlEQVR4Ae3ShY7jQBAE0Aoz/f9/HTMzhg1zrdKUrJbdx+Kd2nD8VNudfsL/Th///dyQN2TH6f3y/BGpC379rV+S+qqetBOxImNQXL8JCAr2V4iMQXHGNJxeCfZXhSRBcQMfvkOWUdtfzlLgAENmZDcmo2TVmt8OSM2eXxBp3DjHSMFutqS7SbmemzBiR+xpKCNUIRkdkkYxhAkyGoBvyQFEJEefwSmmvBfJuJ6aKqKWnAkvGZOaZXTUgFqYULWNSHUckZuR1HIIimUExutRxwzOLROIG4vKmCKQt364mIlhSyzAf1m9lHZHJZrlAOMMztRRiKimp/rpdJDc9Awry5xTZCte7FHtuS8wJgeYGrex28xNTd086Dik7vUMscQOa8y4DoGtCCSkAKlNwpgNtphjrC6MIHUkR6YWxxs6Sc5xqn222mmCRFzIt8lEdKx+ikCtg91qS2WpwVfBelJCiQJwvzixfI9cxZQWgiSJelKnwBElKYtDOb2MFbhmUigbReQBV0Cg4+qMXSxXSyGUn4UbF8l+7qdSGnTC0XLCmahIgUHLhLOhpVCtw4CzYXvLQWQbJNmxoCsOKAxSgBJno75avolkRw8iIAFcsdc02e9iyCd8tHwmeSSoKTowIgvscSGZUOA7PuCN5b2BX9mQM7S0wYhMNU74zgsPBj3HU7wguAfnxxjFQGBE6pwN+GjME9zHY7zGp8wVxMShYX9NXvEWD3HbwJf4giO4CFIQxXScH1/TM+04kkBiAAAAAElFTkSuQmCC';

// Create icon for markers
const iconOptions = {
  iconUrl: markerIconUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
};

// Create the icon instance
const defaultIcon = L.icon(iconOptions);

interface MapSelectorProps {
  vertices: NoirPoint[];
  onChange: (vertices: NoirPoint[]) => void;
  maxVertices?: number;
}

// Helper to convert LatLng to NoirPoint (x, y)
const latLngToNoirPoint = (latLng: L.LatLng): NoirPoint => {
  // Using a simple mapping where:
  // x = longitude * 100 (scaled for better precision)
  // y = latitude * 100 (scaled for better precision)
  return {
    x: Math.round(latLng.lng * 100),
    y: Math.round(latLng.lat * 100),
  };
};

// Helper to convert NoirPoint to LatLng
const noirPointToLatLng = (point: NoirPoint): L.LatLng => {
  return L.latLng(point.y / 100, point.x / 100);
};

const ClickHandler: React.FC<{
  vertices: NoirPoint[];
  onChange: (vertices: NoirPoint[]) => void;
  maxVertices: number;
}> = ({ vertices, onChange, maxVertices }) => {
  useMapEvents({
    click: (e) => {
      // Only add a new vertex if we haven't reached the maximum
      if (vertices.filter(v => v.x !== 0 || v.y !== 0).length < maxVertices) {
        const point = latLngToNoirPoint(e.latlng);
        console.log('Map clicked at:', point);
        
        // Find first empty slot or append
        const newVertices = [...vertices];
        const emptyIndex = newVertices.findIndex(v => v.x === 0 && v.y === 0);
        
        if (emptyIndex !== -1) {
          newVertices[emptyIndex] = point;
        } else if (newVertices.length < maxVertices) {
          newVertices.push(point);
        }
        
        onChange(newVertices);
      }
    },
  });

  return null;
};

const MapSelector: React.FC<MapSelectorProps> = ({ 
  vertices, 
  onChange, 
  maxVertices = 4 
}) => {
  const [markers, setMarkers] = useState<L.LatLng[]>([]);

  // Fix Leaflet icon issues
  useEffect(() => {
    // Fix icon paths in React environment
    // A more React-friendly approach instead of deleting _getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: markerIconUrl,
      shadowUrl: shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  }, []);

  // Convert NoirPoints to LatLng for markers
  useEffect(() => {
    const newMarkers = vertices
      .filter(point => point.x !== 0 || point.y !== 0) // Filter out empty vertices
      .map(noirPointToLatLng);
    setMarkers(newMarkers);
  }, [vertices]);

  // Handle marker drag
  const handleMarkerDrag = (index: number, latLng: L.LatLng) => {
    const newVertices = [...vertices];
    newVertices[index] = latLngToNoirPoint(latLng);
    onChange(newVertices);
  };

  // Reset all markers
  const handleReset = () => {
    const emptyVertex: NoirPoint = { x: 0, y: 0 };
    const resetVertices = Array(maxVertices).fill(0).map(() => ({ ...emptyVertex }));
    onChange(resetVertices);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '10px',
      marginBottom: '20px'
    }}>
      <div style={{ 
        height: '400px', 
        width: '100%', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <MapContainer 
          center={[40.7128, -74.0060]} // NYC default center
          zoom={10} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          doubleClickZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {markers.map((position, idx) => (
            <Marker 
              key={`marker-${idx}-${position.lat}-${position.lng}`}
              position={position}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  handleMarkerDrag(idx, marker.getLatLng());
                },
              }}
            >
              <Popup>Vertex {idx + 1}</Popup>
            </Marker>
          ))}
          
          <ClickHandler 
            vertices={vertices} 
            onChange={onChange} 
            maxVertices={maxVertices} 
          />
        </MapContainer>
      </div>

      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div>
          <small>Click on map to place vertices ({markers.length}/{maxVertices})</small>
        </div>
        <button 
          type="button" 
          onClick={handleReset}
          className="primary-button"
          style={{ 
            width: 'auto', 
            padding: '0.5rem 1rem', 
            background: '#f44336' 
          }}
        >
          Reset Markers
        </button>
      </div>
    </div>
  );
};

export default MapSelector; 