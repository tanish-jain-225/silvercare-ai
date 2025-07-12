import { useState, useEffect } from 'react';

export const useLocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [locationDetails, setLocationDetails] = useState(null);

    useEffect(() => {
        let watchId = null;
        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const coords = position.coords;
                    setLocation({
                        lat: coords.latitude,
                        lng: coords.longitude,
                    });
                    setAccuracy(coords.accuracy);
                    setLocationDetails({
                        accuracy: coords.accuracy,
                        altitude: coords.altitude,
                        altitudeAccuracy: coords.altitudeAccuracy,
                        heading: coords.heading,
                        speed: coords.speed,
                        timestamp: position.timestamp
                    });
                    setLoading(false);
                    setError(null); // Clear any previous error
                },
                (error) => {
                    let friendlyError = error;
                    if (error.code === 1) {
                        friendlyError = new Error('Location permission denied. Please allow location access.');
                    } else if (error.code === 2) {
                        friendlyError = new Error('Location unavailable. Please check your device settings.');
                    } else if (error.code === 3) {
                        friendlyError = new Error('Location request timed out. Try again or check your connection.');
                    }
                    console.error('Error watching location:', error);
                    setError(friendlyError);
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 30000, // Increased timeout for each position request
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

    return { location, loading, error, accuracy, locationDetails };
};