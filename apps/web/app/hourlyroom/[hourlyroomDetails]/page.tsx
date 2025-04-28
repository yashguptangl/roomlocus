"use client";
import { useEffect, useState } from "react";
import ListingData from "../../../types/listing";
import contactInfo from "../../../types/contactData";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaHeart, FaRegHeart, FaShareAlt } from "react-icons/fa";

interface WishlistItem {
  listingId: number;
  type: string;
}

export default function ListingDetail() {
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [newownerData, setNewOwnerData] = useState<contactInfo | null>(null);
  const [alreadyContactData, setAlreadyContactData] = useState<contactInfo | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    const storedListing = sessionStorage.getItem("selectedListing");

    if (storedListing) {
      const parsedListing = JSON.parse(storedListing);
      setListing(parsedListing);
      if (parsedListing?.images?.length > 0) {
        setImages(parsedListing.images);
      }
    }

    if (storedToken) {
      const payloadBase64 = storedToken.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64 || ""));
      if (payload?.id) {
        contactAlreadyShow(storedToken, payload.id);
        fetchWishlist(storedToken, payload.id);
      }
    }
  }, []);

  async function fetchWishlist(token: string, userId: number) {
    try {
      const wishlistResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist/${userId}`,
        { headers: { token } }
      );

      if (wishlistResponse.data.success) {
        setWishlistItems(wishlistResponse.data.wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  }

  async function contact() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/user/signin");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/contact-owner`, {
        method: 'POST',
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          propertyId: listing?.id,
          propertyType: listing?.Type,
          ownerId: listing?.ownerId,
          address: listing?.adress,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/user/signin");
        return;
      }

      if (response.status === 403) {
        alert("You are owner of this listing, you can't contact yourself.");
        router.push("/")
        return;
      }

      const data = await response.json();
      setNewOwnerData(data);
      setShowContact(true);
    } catch (error) {
      console.error(error);
    }
  }

  async function contactAlreadyShow(token: string, userId: number) {
    try {
      const alreadyContact = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing/contact-logs/${userId}`,
        { headers: { 'token': token, 'Content-Type': 'application/json' } }
      );
      setAlreadyContactData(alreadyContact.data || null);
    } catch (err) {
      console.error("Failed:", err);
    }
  }

  const handleWishlistToggle = async () => {
    try {
      if (!token || !listing) return;

      const payloadBase64 = token.split(".")[1];
      const tokenPayload = JSON.parse(atob(payloadBase64 || ""));
      const userId = tokenPayload.id;

      const isAlreadySaved = wishlistItems.some(
        (item) => item.listingId === listing.id
      );

      if (isAlreadySaved) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist/delete`,
          {
            headers: { token, "Content-Type": "application/json" },
            data: { id: listing.id, type: listing.Type },
          }
        );

        setWishlistItems((prev) =>
          prev.filter((item) => item.listingId !== listing.id)
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist`,
          {
            userId,
            listingId: listing.id,
            type: listing.Type,
          },
          {
            headers: { token, "Content-Type": "application/json" },
          }
        );

        setWishlistItems((prev) => [...prev, { listingId: listing.id, type: listing.Type }]);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleShare = () => {
    if (!listing) return;

    if (navigator.share) {
      navigator.share({
        title: `Check this ${listing.Type} listing`,
        text: `${listing.location}, ${listing.city} - ${listing.palaceName}`,
        url: `${window.location.origin}/hourlyroom/${listing.id}`,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      const shareUrl = `${window.location.origin}/hourlyroom/${listing.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied to clipboard!");
      }).catch(() => {
        prompt("Copy this link:", shareUrl);
      });
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!listing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isSaved = wishlistItems.some(item => item.listingId === listing.id);
  const matchedLog = alreadyContactData?.logs?.find(
    (log: { listingId: number; propertyType: string; }) => log.listingId === listing.id && log.propertyType === listing.Type
  );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image Gallery Section */}
            <div className="flex-1 p-4">
              {images.length > 0 ? (
                <div className="space-y-2">
                  {/* Main Image with Navigation */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <div className="absolute top-2 left-2 z-10 flex ">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${listing.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {listing.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>

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
                      alt={`Property image ${currentImageIndex + 1}`}
                      className="object-cover"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

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
                        onClick={() => handleThumbnailClick(index)}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                          }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className="object-cover"
                          fill
                        />
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
                    <p className="text-gray-700">Palace Name</p>
                    <p className="font-normal">{listing.palaceName}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Type</p>
                    <p className="font-normal">{listing.Type}</p>
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
                    <p className="text-gray-700">Room Type</p>
                    <p className="font-normal">{listing.roomType}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Total Room</p>
                    <p className="font-normal">{listing.totalRoom}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Total Floor</p>
                    <p className="font-normal">{listing.totalFloor}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Bed Count</p>
                    <p className="font-normal">{listing.BedCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">Food Available</p>
                    <p className="font-normal">{listing.foodAvailable ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">AC Type</p>
                    <p className="font-normal">{listing.acType}</p>
                  </div>
                  <div>
                    <p className="text-gray-700">No of Guests</p>
                    <p className="font-normal">{listing.noofGuests}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-normal">Address: {listing.adress}</p>
                <p className="font-normal mt-1">Landmark: {listing.landmark}</p>
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
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Room Inside Facilities : </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {listing.roomInside?.map((facility, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">Room Outside Facilities : </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {listing.roomOutside?.map((facility, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                {!matchedLog ? (
                  <button
                    onClick={contact}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Contact Owner
                  </button>
                ) : (
                  <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Owner Contact Details</h4>
                    <p className="text-gray-700">Name: {matchedLog.ownerName}</p>
                    <p className="text-gray-700">Phone: {matchedLog.ownerPhone}</p>
                  </div>
                )}

                {showContact && newownerData && (
                  <div className="border border-green-200 bg-green-50 p-4 rounded-lg mt-4">
                    <h4 className="font-medium text-green-800 mb-2">Owner Contact Details</h4>
                    <p className="text-gray-700">Name: {newownerData?.logs?.ownerName}</p>
                    <p className="text-gray-700">Phone: {newownerData?.logs?.ownerMobile}</p>
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