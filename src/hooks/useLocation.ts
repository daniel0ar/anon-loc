type GeolocationOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
};

export const useLocation = () => {
  const getCurrentLocation = (options: GeolocationOptions = {}): Promise<GeolocationPosition> => {
    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true, // For getting most accurate position (uses more battery)
      timeout: 10000, // Time to wait before timing out (10 seconds)
      maximumAge: 0, // Don't use cached position
      ...options
    };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, defaultOptions);
    });
  };

  // Watch position continuously - useful for tracking
  const watchPosition = (
    onSuccess: (position: GeolocationPosition) => void,
    onError?: (error: GeolocationPositionError) => void,
    options?: GeolocationOptions
  ): number => {
    const defaultOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    };

    return navigator.geolocation.watchPosition(
      onSuccess,
      onError || ((error) => console.error('Error watching position:', error)),
      defaultOptions
    );
  };

  // Clear the watch
  const clearWatch = (watchId: number): void => {
    navigator.geolocation.clearWatch(watchId);
  };

  return { 
    getCurrentLocation,
    watchPosition,
    clearWatch
  };
};
