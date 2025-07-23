"use client";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "../../components/navbar";
import { useSearchParams, useRouter } from "next/navigation";
import ListingData from "../../types/listing";
import Image from "next/image";
import Link from "next/link";
import Verified from "../../assets/verified.png";
import Unverified from "../../assets/not-verified.png";

function Listing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lookingFor = searchParams.get("look") || "";
  const [searchText, setSearchText] = useState("");

  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) return;

    const lookingFor = searchParams.get("look") || "";
    const latitude = searchParams.get("latitude") || "";
    const longitude = searchParams.get("longitude") || "";

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/near-me/near-me/?latitude=${latitude}&longitude=${longitude}&type=${lookingFor}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        setListings(Array.isArray(data.nearbyProperties) ? data.nearbyProperties : []);
      } catch (error) {
        console.log("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  const handleListingClick = (listing: ListingData) => {
    router.push(`/${listing.Type.toLowerCase()}/${listing.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {listings.length > 0 ? (
          <>
          <div className=" flex justify-between items-center gap-1 sticky top-0 bg-white z-30 "></div>
            <div className=" flex justify-between items-center gap-1 sticky top-0 bg-white z-30 ">
              <div>
                <p className="text-black font-normal text-xs mb-3 ">
                  {lookingFor.charAt(0).toUpperCase() + lookingFor.slice(1)} within 15 km
                </p>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Search Area"
                  className="w-28 sm:w-80 p-0.3 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
              
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {listings
              .filter((listing) => {
                  const text = searchText.toLowerCase();
                  return (
                    listing.location.toLowerCase().includes(text) ||
                    listing.landmark.toLowerCase().includes(text) ||
                    listing.city.toLowerCase().includes(text) ||
                    listing.townSector.toLowerCase().includes(text)
                  );
                })
              .map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => handleListingClick(listing)}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer mt-2"
                >
                  <div className="relative w-full h-40">
                    <Image
                      src={
                        Array.isArray(listing.images)
                          ? listing.images[0] || "/images/placeholder.png"
                          : listing.image || "/images/placeholder.png"
                      }
                      alt="Property"
                      fill
                      className="object-cover"
                    />
                     <div className="absolute top-2 left-2 z-20">
                          <Image
                            src={listing.isVerified ? Verified : Unverified}
                            alt={
                              listing.isVerified ? "Verified" : "Not Verified"
                            }
                            width={120}
                            height={120}
                            className="rounded-full "
                          />
                    </div>
    
                  </div>
                  <div className="px-4 py-1">
                    <h3 className="text-base text-center font-normal text-gray-800 line-clamp-2">
                      {listing.location}, {listing.landmark}, {listing.townSector}
                    </h3>
                    
                    {listing.Type === "hourlyroom" ? (
                        <>
                        <div className="mt-0.5 flex justify-evenly gap-8 md:gap-16 items-center">
                            <p className="text-xs md:text-sm text-gray-600">
                                {listing.palaceName}
                            </p>
                            <p className="text-sm  text-yellow-500 font-medium">
                                {listing.luxury}
                            </p>
                        </div>
                        </>
                    ) : (
                        <p className="text-xs md:text-sm text-gray-600">
                            {listing.BHK} Bhk {listing.Type.charAt(0).toUpperCase() + listing.Type.slice(1)}
                        </p>
                        
                    )}
                    <p className="text-lg font-semibold text-green-600 text-center">
                      ₹{Number(listing.MinPrice).toLocaleString()} - ₹
                      {Number(listing.MaxPrice).toLocaleString()}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 text-center">
                      All {listing.Type.charAt(0).toUpperCase() + listing.Type.slice(1)} Prices can be Different
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded-md shadow-md w-9/12 sm:w-2/3 md:w-1/3 lg:w-1/4">
              <h2 className="text-xl font-semibold mb-4 text-center">
                No Listings Available
              </h2>
              <div className="flex justify-center">
                <Link
                  href="/"
                  className="text-blue-600 px-4 py-2 rounded-md hover:text-blue-800"
                >
                  Back to Home Page
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function NearMePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <Listing />
    </Suspense>
  );
}