'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';



export default function LocationPage() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const listingId = useSearchParams().get('listingId');
  const listingType = useSearchParams().get('listingType');
  const ownerId = useSearchParams().get('ownerId');
  const listingShowNo = useSearchParams().get('listingShowNo');
  const addressparam = useSearchParams().get('address');
  const locationparam = useSearchParams().get('location');
  const city = useSearchParams().get('city');
  const townSector = useSearchParams().get('townSector');


  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script dynamically
  useEffect(() => {
    if (window.google) {
      setGoogleReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => setGoogleReady(true);
    script.onerror = () => alert('Failed to load Google Maps script');
    document.body.appendChild(script);
  }, []);

  // Initialize map once location is set and Google Maps is ready
  useEffect(() => {
    if (location && googleReady && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 16,
      });

      new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map,
        title: 'You are here',
      });
    }
  }, [location, googleReady]);

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        console.log('Live location:', latitude, longitude);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/location/reverse-geocode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await res.json();
          if (data.success) setAddress(data.data.address);
        } catch (err) {
          console.error('Address fetch error', err);
        }
      },
      (err) => {
        console.error(err);
        alert('Failed to access location');
      },{
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const saveLocation = async () => {
    if (!location) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/location/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' 
          ,
          token : localStorage.getItem('token') || ''
        },
        body: JSON.stringify({
          listingId: listingId,
          listingType: listingType,
          ownerId: ownerId,
          latitude: location.latitude,
          longitude: location.longitude,
          address: address,
          isLiveLocation: true,
        }),
      });

      const data = await res.json();
      if (data.success) router.push('/owner/verification?listingType=' + listingType + '&listingId=' + listingId + '&listingShowNo=' + listingShowNo + '&address=' + addressparam + '&location=' + locationparam + '&city=' + city + '&townSector=' + townSector);
      else alert(data.message || 'Failed to save location');
    } catch (err) {
      console.error('Save error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center pt-6 p-6 bg-gray-100 space-y-6">
      <h1 className="text-2xl font-bold text-center">📍 Live Location Map</h1>

      {!location ? (
        <button
          onClick={getLiveLocation}
          className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700"
        >
          Get Live Location
        </button>
      ) : (
        <>
          <div
            ref={mapRef}
            className="w-full max-w-2xl h-[300px] rounded-xl border shadow bg-white"
          />
          <p className="text-center text-gray-700">{address || 'Loading address...'}</p>

          <button
            onClick={saveLocation}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </>
      )}
    </main>
  );
}
