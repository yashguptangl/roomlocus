'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LocationPage() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(true);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const listingType = searchParams.get('listingType');
  const ownerId = searchParams.get('ownerId');
  const listingShowNo = searchParams.get('listingShowNo');
  const addressparam = searchParams.get('address');
  const locationparam = searchParams.get('location');
  const city = searchParams.get('city');
  const townSector = searchParams.get('townSector');

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script dynamically
  useEffect(() => {
    function checkGoogleMapsLoaded() {
      return window.google && window.google.maps;
    }
    if (checkGoogleMapsLoaded()) {
      setGoogleReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => {
      let tries = 0;
      const interval = setInterval(() => {
        if (checkGoogleMapsLoaded()) {
          setGoogleReady(true);
          clearInterval(interval);
        } else if (++tries > 20) {
          clearInterval(interval);
          alert('Failed to load Google Maps script');
        }
      }, 200);
    };
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
      }, {
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
        headers: {
          'Content-Type': 'application/json',
          token: localStorage.getItem('token') || ''
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
    <>
      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col items-center relative">
            <h2 className="text-xl font-semibold mb-2 text-center text-red-600">Note</h2>
            <p className="text-gray-700 text-sm mb-4 text-center">
              <b>Note:</b> Please enable "Get Current Location" <b>only when you are inside the property</b>.<br />
              Taking location from outside may lead to misunderstanding in the "Near Me" feature.
            </p>
            <button
              className="px-6 py-1 bg-blue-600 rounded-md text-white"
              onClick={() => setShowNoteModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <main className={`min-h-screen flex flex-col items-center justify-center pt-6 p-6 bg-gray-100 space-y-6 ${showNoteModal ? "blur-sm pointer-events-none select-none" : ""}`}>
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
    </>
  );
}

export default function LocationPageWrapper() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <LocationPage />
    </Suspense>
  );
}