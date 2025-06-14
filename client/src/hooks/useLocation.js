import { useState, useEffect } from 'react';

export const useLocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLoading(false);
                },
                (error) => {
                    console.error('Error fetching location:', error);
                    setError(error);
                    setLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        } else {
            setError(new Error('Geolocation is not supported by this browser.'));
            setLoading(false);
        }
    }, []);

    return { location, loading, error };
}; 