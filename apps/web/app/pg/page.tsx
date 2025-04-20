"use client";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "../../components/navbar";
import SortFilter from "../../components/filterSort";
import { useSearchParams, useRouter } from "next/navigation";
import ListingData from "../../types/listing";
import axios from 'axios';
import Image from "next/image";
import Link from "next/link";

interface WishlistProps {
  userId: string;
  listingId: string;
  type: "flat" | "pg" | "room";
}

interface ListingResponse {
  listings: ListingData[];
}

function Listing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lookingFor = searchParams.get("look") || "";
  const city = searchParams.get("city") || "";
  const townSector = searchParams.get("townSector") || "";
  const [listingData, setListingData] = useState<ListingResponse | null>(null);
  console.log("listingData", listingData);
  const [saved, setSaved] = useState(false);
  const [noListings, setNoListings] = useState(false);

  useEffect(() => {
      async function fetchData() {
        try {
          const response = await fetch(`http://localhost:3001/api/v1/listing/search/?looking_for=${lookingFor}&city=${city}&townSector=${townSector}`);
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
    sessionStorage.setItem("selectedListing", JSON.stringify(listing));
    router.push(`/pg/${listing.id}`);
  };

  const token = localStorage.getItem("token");
  let userId = "";

  let tokenPayload = null;
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1]; // Extract payload part
      tokenPayload = JSON.parse(atob(payloadBase64 || "")); // Decode Base64
      userId = tokenPayload.id;
    } catch (error) {
      console.error("Error parsing token:", error);
    }
  }

  const handleWishlist = async ({ userId, listingId }: WishlistProps) => {
    try {
      if (!saved) {
        await axios.post("http://localhost:3001/api/v1/user/wishlist", {
          userId: userId,
          listingId: listingId,
          type: "flat"
        }, {
          headers: {
            'token': token,
            "Content-Type": "application/json",
          }
        });
        setSaved(true);
      } else {
        await axios.delete(`http://localhost:3001/api/v1/user/wishlist/${listingId}`, {
          headers: {
            'token': token,
            "Content-Type": "application/json",
          }
        });
        setSaved(false);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <>
      <Navbar />
      <SortFilter />
      {noListings ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-4 rounded-md shadow-md w-9/12 sm:w-2/3 md:w-1/3 lg:w-1/4">
          <h2 className="text-xl font-semibold mb-4 text-center">Listing Available Soon</h2>
    
          {/* Back to Home Page Button */}
          <div className="flex justify-center">
            <Link
              href="/"
              className=" text-black px-4 py-2 rounded-md hover:text-blue-600"
            >
              Back to Home Page
            </Link>
          </div>
         </div>
       </div>
) :(
      listingData?.listings.map((listing: ListingData) => (
        <div
          key={listing.id}
          onClick={() => handleListingClick(listing)}
          className="w-full p-4 border rounded border-gray-300 flex gap-8 ssm:flex-col ssm:gap-0.5 mb-1.5 bg-gray-100 mt-1 ml:flex-row ml:gap-6 mod:flex-col ">
          {/* Image Gallery */}
          <div className="relative flex ssm:flex-row ssm:gap-3 ml:flex-col">
            <div className="relative h-64 ssm:h-44">
              <Image
                src={listing.images && listing.images[0] ? listing.images[0] : "/default-image.jpg"}
                alt="Main View"
                height={256}
                width={384}
                className="h-full w-full object-cover rounded"
              />
            </div>
          </div>

          {/* Property Details */}
          <div className="ssm:mt-0.5">
            <p className="text-3xl  text-black font-medium ssm:text-base md:text-3xl">
              {listing.location} {listing.city} {listing.townSector}
            </p>
            <p className="text-xl  text-gray-600 font-medium ssm:text-base">{listing.BHK} BHK PG
              <span className="text-lg font-medium text-blue-300 ssm:text-sm ml-2">Security {listing.security}{" "}</span>
              <span className="text-pink-600 ml-2 text-lg font-medium ssm:text-xs">
                Maintenance {listing.maintenance}
              </span>
            </p>
            <div >
              <p className="text-2xl text-green-600 font-bold ssm:text-lg text-center">
                Rent: &nbsp; {listing.MinPrice} - {listing.MaxPrice}
              </p>
              <p className="text-lg font-medium text-gray-600 ml-24 ssm:text-sm ssm:ml-32 mod:ml-40">
                MIN &nbsp; &nbsp; &nbsp; &nbsp; MAX
              </p>
              <span className="text-lg ssm:text-xs text-gray-700 ml:text-xs ml:ml-16 lg:text-sm lg:ml-28 ssm:text-center">All PG Price Different</span>
            </div>

            {/* Tags */}
            <div className="flex gap-8 flex-wrap ssm:gap-3">
              <span className="font-semibold text-base text-blue-600 ssm:text-xs">
                {Array.isArray(listing.preferTenants) ? (
                  listing.preferTenants.map((tenant: string, index: number) => (
                    <span key={index} className="font-semibold text-base text-blue-600 ssm:text-xs">
                      {tenant}
                    </span>
                  ))
                ) : (
                  <span className="font-semibold text-base text-blue-600 ssm:text-xs">
                    {listing.preferTenants}
                  </span>
                )}
              </span>
              <span className="font-semibold text-base text-gray-600 ssm:text-xs ">
                {listing.flatType}
              </span>
              <span className="font-semibold text-base text-pink-400 ssm:text-xs ">
                {listing.furnishingType}
              </span>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-20 mt-2 ssm:gap-6">
              <button className="bg-orange-800 text-white rounded px-4 py-2 text-sm font-semibold ssm:text-xs ssm:px-2 ssm:py-1">
                CONTACT OWNER
              </button>
              <button
                className={`px-3 py-1 rounded ${saved ? "bg-red-500 text-white" : "bg-gray-200 text-black"}`}
                onClick={() => handleWishlist({ userId, listingId: listing.id.toString(), type: "flat" })}
              >
                {saved ? "Remove from Wishlist" : "Save to Wishlist"}
              </button>
            </div>
          </div>
        </div>
      )))}
    </>
  );

}

export default function ListingComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Listing />
    </Suspense>
  );
}