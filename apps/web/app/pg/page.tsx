"use client";
import React, { useEffect, useState, Suspense } from "react";
import Navbar from "../../components/navbar";
import SortFilter from "../../components/filterSort";
import { useSearchParams, useRouter } from "next/navigation";
import ListingData from "../../types/listing";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaShareAlt } from "react-icons/fa";

interface ListingResponse {
  listings: ListingData[];
}

interface WishlistItem {
  listingId: number;
  type: string;
}

function Listing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lookingFor = searchParams.get("look") || "";
  const city = searchParams.get("city") || "";
  const townSector = searchParams.get("townSector") || "";

  const [listingData, setListingData] = useState<ListingResponse | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [noListings, setNoListings] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

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

    async function fetchWishlist() {
      if (storedToken) {
        try {
          const payloadBase64 = storedToken.split(".")[1];
          const tokenPayload = JSON.parse(atob(payloadBase64 || ""));
          const userId = tokenPayload.id;

          const wishlistResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist/${userId}`,
            {
              headers: { token: storedToken },
            }
          );

          if (wishlistResponse.data.success) {
            setWishlistItems(wishlistResponse.data.wishlist);
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }
    }

    fetchData();
    fetchWishlist();
  }, [lookingFor, city, townSector]);

  const handleListingClick = (listing: ListingData) => {
    sessionStorage.setItem("selectedListing", JSON.stringify(listing));
    router.push(`/pg/${listing.id}`);
  };

  const handleWishlistToggle = async (listingId: number) => {
    try {
      if (!token) return;

      const payloadBase64 = token.split(".")[1];
      const tokenPayload = JSON.parse(atob(payloadBase64 || ""));
      const userId = tokenPayload.id;

      const isAlreadySaved = wishlistItems.some(
        (item) => item.listingId === listingId
      );

      if (isAlreadySaved) {
        
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist/delete`,
          {
            headers: { token: token, "Content-Type": "application/json" },
            data: { id: listingId, type: "Pg" },
          }
        );

        setWishlistItems((prev) =>
          prev.filter((item) => item.listingId !== listingId)
        );
      } else {
        // Add to wishlist
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist`,
          {
            userId: userId,
            listingId: listingId,
            type: "Pg",
          },
          {
            headers: { token: token, "Content-Type": "application/json" },
          }
        );

        setWishlistItems((prev) => [...prev, { listingId, type: "Pg" }]);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleShare = (listing: ListingData) => {
    if (navigator.share) {
      navigator.share({
        title: "Check this listing",
        text: `${listing.location}, ${listing.city}`,
        url: `${window.location.origin}/pg/${listing.id}`,
      });
    } else {
      alert("Sharing is not supported on your device.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <SortFilter />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {listingData?.listings.map((listing) => {
              const isSaved = wishlistItems.some(
                (item) => item.listingId === listing.id
              );

              return (
                <div
                  onClick={() => handleListingClick(listing)}
                  key={listing.id}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Image container must be relative */}
                  <div className="relative w-full h-40">
                    {/* Heart + Share buttons */}
                    <div className="absolute top-2 right-2 flex flex-col items-center space-y-2 z-20">
                      <button onClick={() => handleWishlistToggle(listing.id)}>
                        {isSaved ? (
                          <FaHeart className="text-red-500 text-2xl" />
                        ) : (
                          <FaRegHeart className="text-white text-2xl" />
                        )}
                      </button>

                      <button onClick={() => handleShare(listing)}>
                        <FaShareAlt className="text-white text-xl" />
                      </button>
                    </div>

                    {/* Image */}
                    <Image
                      src={
                        listing.images && listing.images[0]
                          ? listing.images[0]
                          : "/images/placeholder.png"
                      }
                      alt="Pg"
                      fill
                      className="object-cover"
                    />

                    {/* Optional: Add dark overlay to make icons more visible */}
                    <div className="absolute inset-0 bg-black bg-opacity-10 z-10"></div>
                  </div>

                  {/* Text Part */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {listing.location} {listing.city} {listing.townSector}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        {listing.BHK} BHK {listing.Type}
                      </p>
                      <p className="text-lg font-bold text-green-600 text-center">
                        ₹{listing.MinPrice.toLocaleString()} - ₹
                        {listing.MaxPrice.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 text-center">
                        All PG Prices Vary
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
