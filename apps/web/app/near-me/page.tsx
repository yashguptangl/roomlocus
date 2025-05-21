"use client";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "../../components/navbar";
import SortFilter from "../../components/filterSort";
import { useSearchParams, useRouter } from "next/navigation";
import ListingData from "../../types/listing";
import Image from "next/image";
import Link from "next/link";

function ListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lookingFor = searchParams.get("look") || "";
  const latitude = searchParams.get("latitude") || "";
  const longitude = searchParams.get("longitude") || "";

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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing/near-me/?latitude=${latitude}&longitude=${longitude}&type=${lookingFor}`,
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
    sessionStorage.setItem("selectedListing", JSON.stringify(listing));
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
        <SortFilter />
        {listings.length > 0 ? (
          <>
            <p className="text-blue-400 p-1 mt-1 font-medium text-base">
              ~ {lookingFor} Within 15km.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => handleListingClick(listing)}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
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
                    <div className="absolute inset-0 bg-black bg-opacity-10 z-10"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {listing.location} {listing.city} {listing.townSector}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        {listing.BHK} BHK {listing.Type}
                      </p>
                      <p className="text-lg font-bold text-green-600 text-center">
                        ₹{Number(listing.MinPrice).toLocaleString()} - ₹
                        {Number(listing.MaxPrice).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 text-center">
                        All {listing.Type} Prices Vary
                      </p>
                    </div>
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

export default function Listing() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingContent />
    </Suspense>
  );
}
