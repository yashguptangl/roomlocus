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
import Verified from "../../../assets/verified.png";
import Unverified from "../../../assets/not-verified.png";

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
  const { handleSubmit, formState: { isSubmitting } } = useForm();

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
          location: listing.location,
          landmark: listing.landmark,
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
                    <Image
                      src={listing.isVerified ? Verified : Unverified}
                      alt={listing.isVerified ? "Verified" : "Not Verified"}
                      width={80}
                      height={80}
                      className="inline-block mr-2"
                    />
                  </div>

                  {/* Wishlist and Share buttons */}
                  <div className="absolute md:top-3 ssm:top-1 right-2 flex flex-col items-center md:space-y-4 ssm:space-y-1 z-20">
                    <button
                      onClick={handleWishlistToggle}
                      className="p-1 bg-white/50 rounded-full shadow-md hover:bg-white transition-all"
                    >
                      {isSaved ? (
                        <FaHeart className="text-red-500 text-base" />
                      ) : (
                        <FaRegHeart className="text-gray-700 text-base" />
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-1 bg-white/50 rounded-full shadow-md hover:bg-white transition-all"
                    >
                      <FaShareAlt className="text-gray-700 text-base" />
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
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full shadow-md hover:bg-white transition-all"
                        aria-label="Previous image"
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 p-2 rounded-full shadow-md hover:bg-white transition-all"
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
                {listing.adress}
              </h1>

              <h2 className="text-2xl font-semibold text-center text-green-600 my-2">
                ₹{listing.MinPrice} - ₹{listing.MaxPrice}
              </h2>

            </div>
            <div className="border-t border-b border-gray-200 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-300 font-semibold">Security</p>
                  <p className="font-normal">{listing.security}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Maintenance</p>
                  <p className="font-normal">{listing.maintenance}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Type</p>
                  <p className="font-normal">{listing.BHK} BHK {listing.Type}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Furnishing</p>
                  <p className="font-normal">{listing.furnishingType}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Accommodation</p>
                  <p className="font-normal">{listing.accomoType}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Gender</p>
                  <p className="font-normal">{listing.genderPrefer}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">PG Type</p>
                  <p className="font-normal">{listing.PGType}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Total PG</p>
                  <p className="font-normal">{listing.totalPG}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Water Supply</p>
                  <p className="font-normal">{listing.waterSupply} hr</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Power Backup</p>
                  <p className="font-normal">{listing.powerBackup} hr</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Notice Period</p>
                  <p className="font-normal">{listing.noticePeriod} M</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Bed Count</p>
                  <p className="font-normal">{listing.bedCount}</p>
                </div>
                <div>
                  <p className="text-blue-300 font-semibold">Food Available</p>
                  <p className="font-normal">{listing.foodAvailable ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-300">Address</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="font-normal">{listing.adress}</p>
                <p className="font-normal mt-1">Landmark: {listing.landmark}</p>
                <p className="font-normal mt-1">Location: {listing.location}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-300">Offer : </h3>
              <p className="text-gray-700">{listing.Offer}</p>
            </div>

            <div className="space-y-4">

              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-300">Prefer Tenants </h3>
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
                <h3 className="text-lg font-semibold mb-2 text-blue-300">Parking</h3>
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
                <h3 className="text-lg font-semibold mb-2 text-blue-300">PG Inside Facilities : </h3>
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
                <h3 className="text-lg font-semibold mb-2 text-blue-300">PG Outside Facilities : </h3>
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

            <div className="pt-4 ">
              {!ownerContact ? (
                <form onSubmit={handleSubmit(contactOwner)}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={handleSubmit(contactOwner)}
                    className="bg-blue-300 text-white font-medium py-2 px-3 rounded-lg transition-colors ssm:ml-10 mod:ml-14 md:ml-20"
                  >
                    {isSubmitting ? "Contacting..." : "Contact Owner"}
                  </button>
                </form>
              ) : (
                <div className="flex justify-evenly border border-green-200 bg-green-50 p-4 rounded-lg">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Owner Contact Details</h4>
                    <p className="text-gray-700">Name: {ownerContact.ownerName}</p>
                    <p className="text-gray-700">Phone: {listing.listingShowNo}</p>
                  </div>
                  <div>
                    <a
                      href={`tel:${listing.listingShowNo}`}
                      className="mt-8 inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded-xl text-center transition-colors"
                    >
                      Call
                    </a>
                  </div>

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