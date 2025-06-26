"use client";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "../../components/navbar";
import { useSearchParams, useRouter } from "next/navigation";
import ListingData from "../../types/listing";
import Image from "next/image";
import Link from "next/link";
import Verified from "../../assets/verified.png";
import Unverified from "../../assets/not-verified.png";

interface ListingResponse {
  listings: ListingData[];
}

function Listing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lookingFor = searchParams.get("look") || "";
  const city = searchParams.get("city") || "";
  const townSector = searchParams.get("townSector") || "";
  const [searchText, setSearchText] = useState("");

  const [listingData, setListingData] = useState<ListingResponse | null>(null);
  const [noListings, setNoListings] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing/search/?looking_for=${lookingFor}&city=${city}&townSector=${townSector}`
        );
        if (response.status === 402) {
          setNoListings(true);
        } else {
          const data = await response.json();
          setListingData(data);
          setNoListings(false);
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setNoListings(true);
      }
    }
    fetchData();
  }, [lookingFor, city, townSector]);

  const handleListingClick = (listing: ListingData) => {
    router.push(`/flat/${listing.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-1">
        {/* <SortFilter /> */}

        {noListings ? (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded-md shadow-md w-9/12 sm:w-2/3 md:w-1/3 lg:w-1/4">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Listing Available Soon
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
        ) : (
          <>
            <div className=" flex justify-between items-center gap-1 sticky top-0 bg-white z-30 ">
              <div>
                <p className="text-black font-normal text-xs ">
                  - Flat - {city.toString()} - {townSector.toString()}
                </p>
                <p className="text-black font-normal text-xs mb-3 ">
                  - Total Flat Search - {listingData?.listings.length}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
              {listingData?.listings
                .filter((listing) => {
                  const text = searchText.toLowerCase();
                  return (
                    listing.location.toLowerCase().includes(text) ||
                    listing.landmark.toLowerCase().includes(text) ||
                    listing.city.toLowerCase().includes(text) ||
                    listing.townSector.toLowerCase().includes(text) ||
                    listing.BHK.toString().includes(text)
                  );
                })
                .map((listing) => {
                  return (
                    <div
                      onClick={() => handleListingClick(listing)}
                      key={listing.id}
                      className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {/* Image container must be relative */}
                      <div className="relative w-full h-40">
                        {/* Image */}
                        <Image
                          src={
                            listing.images && listing.images[0]
                              ? listing.images[0]
                              : "/images/placeholder.png"
                          }
                          alt="Flat"
                          fill
                          className="object-cover"
                        />
                        {/* Verified/Not Verified Badge */}
                        <div className="absolute top-2 left-2 z-20">
                          <Image
                            src={listing.isVerified ? Verified : Unverified}
                            alt={
                              listing.isVerified ? "Verified" : "Not Verified"
                            }
                            width={80}
                            height={80}
                            className="rounded-full "
                          />
                        </div>
                      </div>

                      {/* Text Part */}
                      <div className="px-4 py-1">
                        <h3 className="text-base text-center font-normal text-gray-800 line-clamp-2">
                          {listing.location}
                        </h3>
                        <div className="mt-0.5 flex justify-start gap-8 md:gap-16 items-center">
                          <p className="text-xs md:text-sm text-gray-600">
                            {listing.BHK} BHK
                          </p>
                          <p className="text-lg font-semibold text-green-600 text-center">
                            ₹{listing.MinPrice.toLocaleString()} - ₹
                            {listing.MaxPrice.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 text-center">
                          All Flat Prices can be Different
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ListingComponent() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <Listing />
    </Suspense>
  );
}
