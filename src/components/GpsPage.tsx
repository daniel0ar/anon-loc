import { useState, useEffect } from 'react';
import { useLocation } from '../hooks/useLocation';

type GpsData = {
  latitude: number;
  longitude: number;
  accuracy: number; // This represents HDOP in meters
  timestamp: number;
  speed: number | null;
  altitude: number | null;
};

const GpsPage = () => {
  const [gpsData, setGpsData] = useState<GpsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { getCurrentLocation } = useLocation();

  useEffect(() => {
    const getGpsData = async () => {
      try {
        setLoading(true);
        const position = await getCurrentLocation();
        
        setGpsData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy, // Horizontal accuracy in meters (equivalent to HDOP)
          timestamp: position.timestamp,
          speed: position.coords.speed,
          altitude: position.coords.altitude,
        });
      } catch (err) {
        console.error('Error getting GPS data:', err);
        setError('Failed to get GPS data. Please make sure location services are enabled.');
      } finally {
        setLoading(false);
      }
    };

    getGpsData();
  }, []);

  // Check if we're running on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  if (!isMobileDevice()) {
    return (
      <div className="gps-page">
        <h1>GPS Data</h1>
        <p>This feature is only available on mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="gps-page">
      <h1>GPS Data</h1>
      
      {loading && <p>Loading GPS data...</p>}
      
      {error && <p className="error">{error}</p>}
      
      {!loading && !error && gpsData && (
        <div className="gps-data">
          <p><strong>Latitude:</strong> {gpsData.latitude.toFixed(6)}</p>
          <p><strong>Longitude:</strong> {gpsData.longitude.toFixed(6)}</p>
          <p><strong>HDOP (Accuracy):</strong> {gpsData.accuracy.toFixed(2)} meters</p>
          <p><strong>Timestamp:</strong> {new Date(gpsData.timestamp).toLocaleString()}</p>
          {gpsData.speed !== null && (
            <p><strong>Speed:</strong> {gpsData.speed.toFixed(2)} m/s</p>
          )}
          {gpsData.altitude !== null && (
            <p><strong>Altitude:</strong> {gpsData.altitude.toFixed(2)} meters</p>
          )}
        </div>
      )}

      <button 
        onClick={() => window.location.reload()}
        disabled={loading}
      >
        Refresh GPS Data
      </button>
    </div>
  );
};

export default GpsPage; 