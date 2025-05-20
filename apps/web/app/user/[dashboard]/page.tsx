// UserDashboard.tsx
"use client";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import DefaultPropertyImage from "../../../assets/bedroom.jpg";


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
    [key: string]: any; // Adjust this type as per your listing structure

  };
}

interface RecentContact {
  id: string;
  ownerName: string;
  ownerPhone: string;
  adress: string;
  accessDate: string;
  propertyType: string;
  propertyId: string;
  isOwner?: boolean; // Added to distinguish owner/user contacts
}

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("wishlist");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [loading, setLoading] = useState(true);
 
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/dashboard`,
        {
          headers: {
            token: localStorage.getItem("token")  
          }
        }
      );

      if (response.data.success) {
        setWishlist(response.data.data.wishlist);
        // Enhance contacts with isOwner flag
        const enhancedContacts = response.data.data.recentContacts.map((contact: { customerName: string; }) => ({
          ...contact,
          isOwner: contact.customerName !== "You" // Simple way to distinguish
        }));
        setRecentContacts(enhancedContacts);
      } else {
        console.log("Failed to fetch dashboard data:", response.data.message);
        setWishlist([]);
        setRecentContacts([]);
      }
    } catch (err) {
      console.log("Dashboard error:", err);
     
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
            token   : localStorage.getItem("token")
          },
          data: { type , id }
        }
      );
      // Update UI immediately
      setWishlist(wishlist.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
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
          Recent Contacts ({recentContacts.length})
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
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(item.id, item.type);
                    }}
                    aria-label="Remove from wishlist"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className=" px-3 py-1">
                <p className="ssm:text-base md:text-base ">
                     {item.listing.location} {item.listing.townSector} {item.listing.city}
                    </p>
                  <div className="text-xl font-medium ssm:text-xs mod:text-base">
                  <h2 className="text-xl font-medium ssm:text-xs mod:text-base">
                      {item.listing.BHK} BHK  {item.listing.type} | Security {item.listing.security}{" "}
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
            recentContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-md shadow-md p-2 mb-1"
              >
                <p className="p-2 text-base flex items-center justify-center ">
                    Address: {contact.adress} 
                </p>
                <div className="flex flex-col items-center gap-6 p-1 border-b border-gray-300">
                    <div className="flex items-center gap-20">
                      <div className="flex item-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">Name: {contact.ownerName}</span>
                        <span className="text-xs text-gray-600">Mob No.: {contact.ownerPhone}</span>
                        <span className="text-xs text-gray-600">Date: {new Date(contact.accessDate).toLocaleDateString('en-CA')}</span>
                      </div>
                      </div>
                     
                      <div className="flex items-center space-x-2">
                        <button 
                        onClick={() => (window.location.href = `tel:${contact.ownerPhone}`)}
                        className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          Call
                        </button>
                      
                      </div>
                    </div>
              </div>        
        </div>
      )
          ))}
        </div>
      )}  
    </div>
  );
};