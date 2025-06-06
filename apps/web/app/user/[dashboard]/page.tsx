"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import DefaultPropertyImage from "../../../assets/bedroom.jpg";
import Delete from "../../../assets/delete.png";

type Tab = "wishlist" | "recentContacts";

interface WishlistItem {
  id: string;
  type: string;
  listing: {
    location?: string;
    townSector?: string;
    city?: string;
    bhk?: string;
    security?: string;
    minprice?: number;
    maxprice?: number;
    imageUrl: string | null;
    [key: string]: any;
  };
}

interface RecentContact {
  id: string;
  ownerName: string;
  ownerPhone: string;
  location: string;
  landmark: string;
  accessDate: string;
  propertyType: string;
  propertyId: string;
  isOwner?: boolean;
  userDeleted?: boolean;
}

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("wishlist");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteContact = async (id: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/recentContacts/delete`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
          data: { id },
        }
      );
      setRecentContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete contact. Please try again.");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/dashboard`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      if (response.data.success) {
        setWishlist(response.data.data.wishlist);
        const enhancedContacts = response.data.data.recentContacts.map(
          (contact: any) => ({
            ...contact,
            isOwner: contact.customerName !== "You",
          })
        );
        setRecentContacts(enhancedContacts);
      } else {
        setWishlist([]);
        setRecentContacts([]);
      }
    } catch (err) {
      setWishlist([]);
      setRecentContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleViewProperty = (id: string, type: string) => {
    router.push(`/${type.toLowerCase()}/${id}`);
  };

  const handleRemoveFromWishlist = async (id: string, type: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/wishlist/delete`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
          data: { type, id },
        }
      );
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to remove from wishlist. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-1 py-4">
      <h1 className="text-lg text-center font-medium">My Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`px-4 py-2 font-medium ${
            activeTab === "wishlist"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Wishlist ({wishlist.length})
        </button>
        <button
          onClick={() => setActiveTab("recentContacts")}
          className={`px-4 py-2 font-medium ${
            activeTab === "recentContacts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Recent Contacts ({recentContacts.filter((contact) => !contact.userDeleted).length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "wishlist" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">Your wishlist is empty</p>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white flex flex-col w-72 rounded-md shadow-md overflow-hidden mb-4 p-2"
              >
                <div
                  className="relative mod:w-72 mod:h-36 ssm:h-36 ssm:w-72 md:h-40 md:w-72 w-full sm:w-44 h-40"
                  onClick={() => handleViewProperty(item.id, item.type)}
                >
                  <Image
                    src={item.listing.imageUrl || DefaultPropertyImage.src}
                    alt="Property"
                    fill
                    className="object-cover"
                    priority
                  />
                  <button
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(item.id, item.type);
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <Image
                      src={Delete}
                      alt="Delete"
                      width={80}
                      height={80}
                      className="h-6 w-6 text-red-500"
                    />
                  </button>
                </div>
                <div className="px-3 py-1">
                  <p className="ssm:text-base md:text-base ">
                    {item.listing.location} {item.listing.townSector} {item.listing.city}
                  </p>
                  <div className="text-xl font-medium ssm:text-xs mod:text-base">
                    <h2 className="text-xl font-medium ssm:text-xs mod:text-base">
                      {item.listing.BHK} BHK {item.listing.type} | Security {item.listing.security}{" "}
                    </h2>
                    <p className="text-green-600 text-center font-medium text-base">
                      ₹ {item.listing.MinPrice} - {item.listing.MaxPrice}
                    </p>
                    <p className="text-sm text-gray-700 capitalize">
                      Type: {item.type}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewProperty(item.id, item.type)}
                    className="mt-1 w-full rounded text-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {recentContacts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-lg">No recent contacts</p>
            </div>
          ) : (
            recentContacts
              .filter((contact) => !contact.userDeleted)
              .map((contact) => (
                <div key={contact.id} className="bg-white rounded-md shadow-md p-2 mb-1">
                  <p className="p-2 text-base flex items-center justify-center ">
                    {contact.propertyType} | {contact.landmark} | {contact.location}
                  </p>
                  <div className="flex flex-col items-center gap-6 p-1 border-b border-gray-300">
                    <div className="flex items-center gap-20">
                      <div className="flex item-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">
                            Name: {contact.ownerName}
                          </span>
                          <span className="text-xs text-gray-600">
                            Mob No.: {contact.ownerPhone}
                          </span>
                          <span className="text-xs text-gray-600">
                            Date:{" "}
                            {new Date(contact.accessDate).toLocaleDateString("en-CA")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={`tel:${contact.ownerPhone}`}
                          className="bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                        >
                          Call
                        </a>
                        <Image
                          src={Delete}
                          alt="Delete"
                          width={80}
                          height={80}
                          className="h-7 w-7 text-red-500 cursor-pointer"
                          onClick={() => handleDeleteContact(contact.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}