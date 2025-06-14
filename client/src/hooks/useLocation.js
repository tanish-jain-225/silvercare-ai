import { useState, useEffect } from 'react';

export const useLocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let watchId = null;
        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLoading(false);
                    setError(null); // Clear any previous error
                },
                (error) => {
                    console.error('Error watching location:', error);
                    setError(error);
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, // Timeout for each position request
                    maximumAge: 0, // Don't use a cached position
                }
            );
        } else {
            setError(new Error('Geolocation is not supported by this browser.'));
            setLoading(false);
        }

        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    return { location, loading, error };
};