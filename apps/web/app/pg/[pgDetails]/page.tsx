"use client";
import { useEffect, useState } from "react";
import ListingData from "../../../types/listing";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaHeart, FaRegHeart, FaShareAlt } from "react-icons/fa";
import { useForm } from "react-hook-form";

interface WishlistItem {
  listingId: number;
  type: string;
}

interface Log {
  listingId: number;
  propertyType: string;
  ownerName: string;
  ownerPhone: string;
}

export default function ListingDetail() {
  const router = useRouter();
  const params = useParams();
  const pgId = params.pgDetails as string;
  const { handleSubmit , formState : { isSubmitting } } = useForm();

  const [listing, setListing] = useState<ListingData | null>(null);
  const [ownerContact, setOwnerContact] = useState<{ ownerName: string; ownerMobile: string } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Fetch PG details from backend
  useEffect(() => {
    async function fetchPG() {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing/pg/${pgId}`
        );
        setListing(res.data.pg);
        setImages(res.data.images || []);
      } catch (error) {
        console.error("Error fetching PG details:", error);
      }
    }
    fetchPG();

    const token = localStorage.getItem("token");
    setToken(token);
    if (token) {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64 || ""));
      if (payload?.id && payload?.role === "user") {
        fetchWishlist(token, payload.id);
      }
    }
  }, [pgId]);

  // Check contact log after listing is set
  useEffect(() => {
    if (!token || !listing) return;
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64 || ""));
    if (payload?.id && payload?.role === "user") {
      checkContactLog(token, payload.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing, token]);

  async function fetchWishlist(token: string, userId: string) {
    try {
      const wishlistResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist/${userId}`,
        {
          headers: { token },
        }
      );

      if (wishlistResponse.data.success) {
        setWishlistItems(wishlistResponse.data.wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !listing) {
      router.push(`/user/signin?redirect=/pg/${pgId}`);
      return;
    }
    try {
      const payloadBase64 = token.split(".")[1];
      const tokenPayload = JSON.parse(atob(payloadBase64 || ""));
      const userId = tokenPayload.id;

      const isAlreadySaved = wishlistItems.some(
        (item) => item.listingId === listing.id
      );

      if (isAlreadySaved) {
        // Remove from wishlist
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist/delete`,
          {
            headers: { token: token, "Content-Type": "application/json" },
            data: { id: listing.id, type: listing.Type },
          }
        );

        setWishlistItems((prev) =>
          prev.filter((item) => item.listingId !== listing.id)
        );
      } else {
        // Add to wishlist
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist`,
          {
            userId: userId,
            listingId: listing.id,
            type: listing.Type,
          },
          {
            headers: { token: token, "Content-Type": "application/json" },
          }
        );

        setWishlistItems((prev) => [...prev, { listingId: listing.id, type: listing.Type }]);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!listing) return;

    if (navigator.share) {
      navigator.share({
        title: "Check this PG listing",
        text: `${listing.location}, ${listing.city}`,
        url: `${window.location.origin}/room/${listing.id}`,
      });
    } else {
      alert("Sharing is not supported on your device.");
    }
  };

  // Check if user has already contacted for this property
  async function checkContactLog(token: string, userId: number) {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing/contact-logs/${userId}`,
        { headers: { token, "Content-Type": "application/json" } }
      );
      const logs = res.data?.logs || [];
      const matched = logs.find(
        (log: Log) => log.listingId === listing?.id && log.propertyType === listing?.Type
      );
      if (matched) {
        setOwnerContact({ ownerName: matched.ownerName, ownerMobile: matched.ownerPhone });
      }
    } catch (err) {
      console.error("Failed to fetch contact logs:", err);
    }
  }
  // Contact owner and get details
  async function contactOwner() {
    if (!token || !listing) {
      router.push(`/user/signin?redirect=/pg/${pgId}`);
      return;
    }
    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64 || ""));
      if (payload?.role !== "user") {
        alert("Please login by user id");
        router.push(`/user/signin?redirect=/pg/${pgId}`);
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/contact-owner`, {
        method: "POST",
        headers: {
          token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: listing.id,
          propertyType: listing.Type,
          ownerId: listing.ownerId,
          address: listing.adress,
          listingShowNo: listing.listingShowNo, 
        }),
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/user/signin");
        return;
      }
      const data = await response.json();
      if (data?.contactInfo) {
        setOwnerContact({
          ownerName: data.contactInfo.ownerName,
          ownerMobile: data.contactInfo.ownerMobile,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleThumbnailClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  if (!listing) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  const isSaved = wishlistItems.some((item) => item.listingId === listing.id);

  return (
    <><Navbar /><div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image Gallery Section */}
          <div className="flex-1 p-4">
            {images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image with Navigation */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${listing.isVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {listing.isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>

                  {/* Wishlist and Share buttons */}
                  <div className="absolute top-0 right-2 flex flex-col items-center space-y-2 z-20">
                    <button
                      onClick={handleWishlistToggle}
                      className="p-0.5 bg-white/80 rounded-full shadow-md hover:bg-white transition-all"
                    >
                      {isSaved ? (
                        <FaHeart className="text-red-500 text-xl" />
                      ) : (
                        <FaRegHeart className="text-gray-700 text-xl" />
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-0.5 bg-white/80 rounded-full shadow-md hover:bg-white transition-all"
                    >
                      <FaShareAlt className="text-gray-700 text-lg" />
                    </button>
                  </div>

                  <Image
                    src={images[currentImageIndex] || ""}
                    alt={`PG image ${currentImageIndex + 1}`}
                    className="object-cover"
                    fill
                    priority />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all"
                        aria-label="Previous image"
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-all"
                        aria-label="Next image"
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                <div className="grid grid-cols-5 gap-2">
                  {images.slice(0, 5).map((img, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleThumbnailClick(index, e)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="object-cover"
                        fill />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>

          {/* Property Details Section */}
          <div className="flex-1 p-4 space-y-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {listing.location}, {listing.city}, {listing.townSector}
              </h1>

              <h2 className="text-2xl font-semibold text-center text-green-600 my-2">
                ₹{listing.MinPrice} - ₹{listing.MaxPrice}
              </h2>

            </div>
            <div className="border-t border-b border-gray-200 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700">Security</p>
                  <p className="font-normal">{listing.security}</p>
                </div>
                <div>
                  <p className="text-gray-700">Maintenance</p>
                  <p className="font-normal">{listing.maintenance}</p>
                </div>
                <div>
                  <p className="text-gray-700">Type</p>
                  <p className="font-normal">{listing.BHK} BHK {listing.Type}</p>
                </div>
                <div>
                  <p className="text-gray-700">Furnishing</p>
                  <p className="font-normal">{listing.furnishingType}</p>
                </div>
                <div>
                  <p className="text-gray-700">Accommodation</p>
                  <p className="font-normal">{listing.accomoType}</p>
                </div>
                <div>
                  <p className="text-gray-700">Gender</p>
                  <p className="font-normal">{listing.genderPrefer}</p>
                </div>
                <div>
                  <p className="text-gray-700">PG Type</p>
                  <p className="font-normal">{listing.PGType}</p>
                </div>
                <div>
                  <p className="text-gray-700">Total PG</p>
                  <p className="font-normal">{listing.totalPG}</p>
                </div>
                <div>
                  <p className="text-gray-700">Water Supply</p>
                  <p className="font-normal">{listing.waterSupply} hr</p>
                </div>
                <div>
                  <p className="text-gray-700">Power Backup</p>
                  <p className="font-normal">{listing.powerBackup} hr</p>
                </div>
                <div>
                  <p className="text-gray-700">Notice Period</p>
                  <p className="font-normal">{listing.noticePeriod} M</p>
                </div>
                <div>
                  <p className="text-gray-700">Bed Count</p>
                  <p className="font-normal">{listing.bedCount}</p>
                </div>
                <div>
                  <p className="text-gray-700">Food Available</p>
                  <p className="font-normal">{listing.foodAvailable ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Address</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="font-normal">{listing.adress}</p>
                  <p className="font-normal mt-1">Landmark: {listing.landmark}</p>
            </div>
            </div>
            <div className="space-y-4">

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Prefer Tenants </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {listing.preferTenants?.map((tenants, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{tenants}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Parking</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.parking?.map((parking, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{parking}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">PG Inside Facilities : </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {listing.PGInside?.map((facility, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">PG Outside Facilities : </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {listing.PGOutside?.map((facility, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>


            </div>

            <div className="pt-4">
              {!ownerContact ? (
                <form onSubmit={handleSubmit(contactOwner)}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(contactOwner)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {isSubmitting ? "Contacting..." : "Contact Owner"}
                  </button>
                </form>
              ) : (
                <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Owner Contact Details</h4>
                  <p className="text-gray-700">Name: {ownerContact.ownerName}</p>
                  <p className="text-gray-700">Phone: {listing.listingShowNo}</p>
                  <a
                      href={`tel:${listing.listingShowNo}`}
                      className="mt-3 inline-block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
                    >
                      Call
                    </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}