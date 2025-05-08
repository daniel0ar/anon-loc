import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from '../hooks/useLocation';
import { generateWitness, generateProof } from '../scripts/generateProof';
import type { CircuitVariables } from '../scripts/generateProof';

type GpsData = {
  latitude: number;
  longitude: number;
  accuracy: number; // This represents HDOP in meters
  timestamp: number;
  speed: number | null;
  altitude: number | null;
};

// Define GeolocationPositionError interface if needed
interface GeolocationErrorWithCode {
  code: number;
  message: string;
}

const GpsPage = () => {
  const [gpsData, setGpsData] = useState<GpsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const [witness, setWitness] = useState<Uint8Array | null>(null);
  const [proof, setProof] = useState<unknown>(null);
  const [witnessLoading, setWitnessLoading] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);
  const [zkError, setZkError] = useState<string | null>(null);
  
  const { watchPosition, clearWatch } = useLocation();

  // Use refs to solve circular dependencies between functions
  const updateGpsData = useCallback((position: GeolocationPosition) => {
    setGpsData({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: 0.1, // Horizontal accuracy in meters (equivalent to HDOP)
      timestamp: position.timestamp,
      speed: position.coords.speed,
      altitude: position.coords.altitude,
    });
  }, []);
  
  const handleLocationError = useCallback((err: unknown) => {
    console.error('Error getting GPS data:', err);
    
    // Handle specific error codes from GeolocationPositionError
    if (err && typeof err === 'object' && 'code' in err) {
      const geoError = err as GeolocationErrorWithCode;
      
      if (geoError.code === 1) { // PERMISSION_DENIED
        setError('Location permission denied. Please enable location services for this website in your browser settings.');
      } else if (geoError.code === 2) { // POSITION_UNAVAILABLE
        setError('Unable to determine your location. Please make sure your device has GPS enabled and try again.');
      } else if (geoError.code === 3) { // TIMEOUT
        setError('Location request timed out. Please try again.');
      } else {
        setError('Failed to get GPS data. Please make sure location services are enabled.');
      }
    } else {
      setError('An unknown error occurred while trying to get your location.');
    }
  }, []);
  
  // Store these callbacks in refs to avoid dependency issues
  const updateGpsDataRef = useRef(updateGpsData);
  const handleLocationErrorRef = useRef(handleLocationError);
  
  // Keep the refs updated when the callbacks change
  useEffect(() => {
    updateGpsDataRef.current = updateGpsData;
    handleLocationErrorRef.current = handleLocationError;
  }, [updateGpsData, handleLocationError]);

  const getGpsData = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    // Check if we're in a secure context
    if (!window.isSecureContext) {
      setError("Geolocation requires a secure context (HTTPS). Please access this site using HTTPS.");
      setLoading(false);
      return;
    }
    
    // Force a permission prompt by directly trying to get location
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Requesting geolocation permission...");
      // Use direct navigator.geolocation call to ensure permission prompt appears
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          console.log("Position received:", position);
          updateGpsDataRef.current(position);
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          handleLocationErrorRef.current(error);
          
          // Help user with additional information for permission denied
          if (error.code === 1) {
            console.log("Showing special instructions for permission denied");
            // On mobile, provide specific instructions based on platform
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
              setError("Location access was denied. On iOS, go to Settings > Safari > Location to enable access.");
            } else if (/Android/i.test(navigator.userAgent)) {
              setError("Location access was denied. On Android, go to Settings > Site Settings > Location to enable access.");
            } else {
              setError("Location access was denied. Click the location icon in your browser's address bar and allow access.");
            }
          }
          
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      handleLocationErrorRef.current(err);
      setLoading(false);
    }
  }, []);

  // Check geolocation permission status
  useEffect(() => {
    // Check if we're in a secure context first
    if (!window.isSecureContext) {
      console.warn("Geolocation API requires a secure context (HTTPS)");
      setError("This app requires HTTPS to access your location. Please use a secure connection.");
      return;
    }
    
    const directGeolocationRequest = () => {
      if (navigator.geolocation) {
        try {
          console.log("Initial geolocation permission check...");
          navigator.geolocation.getCurrentPosition(
            () => {
              console.log("Geolocation permission granted on initial check");
              setPermissionState('granted');
            },
            (error) => {
              console.log("Initial geolocation check error:", error);
              if (error.code === 1) {
                setPermissionState('denied');
              } else if (error.code === 2) {
                setPermissionState('prompt');
              }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        } catch (err) {
          console.error("Error in initial geolocation check:", err);
        }
      }
    };
    
    // Only do the check, but don't automatically get GPS data
    directGeolocationRequest();
    
    // Then check with Permissions API if available
    const checkPermission = async () => {
      if (!navigator.permissions || !navigator.permissions.query) {
        return;
      }
      
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setPermissionState(result.state);
        
        result.addEventListener('change', () => {
          console.log("Permission state changed:", result.state);
          setPermissionState(result.state);
        });
      } catch (err) {
        console.error('Error checking geolocation permission:', err);
      }
    };
    
    checkPermission();
    
    // Clean up any watches when component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        clearWatch(watchIdRef.current);
      }
    };
  }, [clearWatch]);

  const toggleWatchPosition = useCallback(() => {
    if (isWatching && watchIdRef.current !== null) {
      // Stop watching
      clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatching(false);
    } else {
      // Start watching
      setError(null);
      setLoading(true);
      
      try {
        const watchId = watchPosition(
          (position) => {
            updateGpsDataRef.current(position);
            setLoading(false);
          },
          (err) => {
            handleLocationErrorRef.current(err);
            setLoading(false);
            setIsWatching(false);
          },
          { enableHighAccuracy: true }
        );
        
        watchIdRef.current = watchId;
        setIsWatching(true);
      } catch (err) {
        handleLocationErrorRef.current(err);
        setLoading(false);
      }
    }
  }, [isWatching, clearWatch, watchPosition]);

  // Check if we're running on a mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const renderPermissionStatus = () => {
    if (!permissionState) return null;
    
    switch (permissionState) {
      case 'denied':
        return (
          <div className="permission-status denied">
            <p>Location permission has been denied. Please update your browser settings to allow location access.</p>
          </div>
        );
      case 'prompt':
        return (
          <div className="permission-status prompt">
            <p>Please allow location access when prompted to view your GPS data.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Sankt Peterburg region polygon (fixed-point 1e6)
  const polygon_vertices_x = [60050000, 60090000, 59800000, 59830000];
  const polygon_vertices_y = [30050000, 30550000, 30650000, 30050000];

  const handleGenerateWitness = async () => {
    setZkError(null);
    setWitnessLoading(true);
    setWitness(null);
    setProof(null);
    try {
      if (!gpsData) {
        setZkError('No GPS data available.');
        setWitnessLoading(false);
        return;
      }
      const variables: CircuitVariables = {
        lat_point: Math.round(gpsData.latitude * 1_000_000),
        lng_point: Math.round(gpsData.longitude * 1_000_000),
        hdop: Math.round(gpsData.accuracy * 1_000_000),
        polygon_vertices_x,
        polygon_vertices_y,
        result: true, // For demo, assume inside
      };
      const wit = await generateWitness(variables);
      setWitness(wit);
    } catch (err: unknown) {
      setZkError((err as Error)?.message || 'Error generating witness');
    } finally {
      setWitnessLoading(false);
    }
  };

  const handleGenerateProof = async () => {
    setZkError(null);
    setProofLoading(true);
    setProof(null);
    try {
      if (!witness) {
        setZkError('No witness available.');
        setProofLoading(false);
        return;
      }
      const prf = await generateProof(witness);
      setProof(prf);
    } catch (err: unknown) {
      setZkError((err as Error)?.message || 'Error generating proof');
    } finally {
      setProofLoading(false);
    }
  };

  // Helper to render proof as string
  function renderProof(proof: unknown): string {
    if (typeof proof === 'object' && proof !== null) {
      try {
        return JSON.stringify(proof, null, 2);
      } catch {
        return '[Unserializable proof object]';
      }
    }
    if (typeof proof === 'string') return proof;
    if (typeof proof === 'number' || typeof proof === 'boolean') return String(proof);
    return '';
  }

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
      
      {!window.isSecureContext && (
        <div className="security-warning">
          <p className="error">
            <strong>Security Notice:</strong> Location services require a secure connection (HTTPS).
            {window.location.protocol === 'http:' && 
              ` Try accessing this site via HTTPS: ${window.location.href.replace('http:', 'https:')}`
            }
          </p>
        </div>
      )}
      
      {renderPermissionStatus()}
      
      {!gpsData && !loading && !error && (
        <div className="info-box">
          <p>To show your GPS location, tap the button below and allow location access when prompted.</p>
        </div>
      )}
      
      {loading && <p className="loading">Loading GPS data...</p>}
      
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

      <div className="button-group">
        <button 
          onClick={getGpsData}
          disabled={loading || isWatching}
          className="primary-button get-gps-button"
          aria-label="Get location data"
        >
          {gpsData ? 'Refresh GPS Data' : 'Get My Location'}
        </button>
        
        {gpsData && (
          <button
            onClick={toggleWatchPosition}
            disabled={loading}
            className={`primary-button ${isWatching ? 'active' : ''}`}
            style={{ marginTop: '10px' }}
            aria-label={isWatching ? 'Stop tracking location' : 'Start tracking location'}
          >
            {isWatching ? 'Stop Tracking Location' : 'Track Location (Live)'}
          </button>
        )}
      </div>
      
      {gpsData && !isWatching && (
        <p className="timestamp">Last updated: {new Date().toLocaleString()}</p>
      )}
      
      {isWatching && (
        <p className="live-indicator">LIVE: Automatically updating position</p>
      )}

      <h2>GPS Data</h2>
      {gpsData ? (
        <div>
          <div>Latitude: {gpsData.latitude}</div>
          <div>Longitude: {gpsData.longitude}</div>
          <div>Accuracy (HDOP): {gpsData.accuracy}</div>
          <button onClick={handleGenerateWitness} disabled={witnessLoading}>
            {witnessLoading ? 'Generating Witness...' : 'Generate ZK Witness'}
          </button>
          <button onClick={handleGenerateProof} disabled={!witness || proofLoading} style={{ marginLeft: 8 }}>
            {proofLoading ? 'Generating Proof...' : 'Generate ZK Proof'}
          </button>
        </div>
      ) : (
        <div>No GPS data available.</div>
      )}
      {zkError && <div style={{ color: 'red' }}>ZK Error: {zkError}</div>}
      {witness && (
        <div>
          <h3>Witness (hex, first 32 bytes):</h3>
          <code>{Array.from(witness.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(' ')}...</code>
        </div>
      )}
      {renderProof(proof) && (
        <div>
          <h3>Proof:</h3>
          <pre style={{ maxWidth: 400, overflowX: 'auto', background: '#eee', padding: 8 }}>
            {renderProof(proof)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GpsPage; 