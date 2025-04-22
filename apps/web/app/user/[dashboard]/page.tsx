"use client";
import Bedroom from "../../../assets/bedroom.jpg";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";
import Customer from "../../../assets/customer.png";
import Delete from "../../../assets/delete.png";
type Tab = "wishlist" | "Recent_Searches"
import Image from "next/image";
import { LeadLog } from "../../../types/lead";

interface WishlistItem {
  id: string;
  location: string;
  townSector: string;
  city: string;
  Bhk: string;
  security: string;
  type: string;
  minprice: number;
  maxprice: number;
  imageUrl: string;
}

export default function User() {

  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("wishlist");
  const [recentSearch, setRecentSearch] = useState({ logs: [] });

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data: wishListData } = await axios.get(
          `${process.env.BACKEND_URL}/v1/user/wishlist}`
        );
        setWishlist(wishListData);
      } catch (err) {
        console.log("Error fetching wishlist", err);
      }
    };
    fetchWishlist();
  }, []);

  const handleViewDetails = (listingId: string, type: string) => {
    router.push(`/${type}/${listingId}`);
  };

  return (
    <>
      <div className="mb-[40rem] flex justify-center">
        <div className="w-full sm:w-2/3">
          <div className="flex flex-row items-center justify-around bg-white p-3">
        <div className="flex flex-col gap-0.5 items-center mt-0.5">
          <p className="text-lg">Welcome Danish Khan</p>
        </div>
          </div>
          <div className="w-full flex justify-between border-b border-gray-300 bg-blue-400">
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex-1 text-center py-2 font-semibold ${activeTab === "wishlist"
            ? "text-blue-500 border-b-3 border-blue-500"
            : "text-white"
            }`}
          style={{ flex: "0 0 50%" }}
        >
          Wishlist
        </button>
        <button
          onClick={() => setActiveTab("Recent_Searches")}
          className={`flex-1 text-center py-2 font-semibold ${activeTab === "Recent_Searches"
            ? "text-blue-500 border-b-3 border-blue-500"
            : "text-white"
            }`}
          style={{ flex: "0 0 50%" }}
        >
          Recent Searches
        </button>
          </div>
          {activeTab === "wishlist" && wishlist.length === 0 ? (
        <p className="text-center text-gray-600 mt-1">No items in your Wishlist</p>
          ) : (
        wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white flex flex-row md:flex-row items-center rounded-md shadow-md overflow-hidden cursor-pointer p-4 gap-4"
            onClick={() => handleViewDetails(item.id, item.type)}
          >
            {/* Image Section */}
            <div className="relative w-40 h-40 sm:w-44 sm:h-40 md:w-72 md:h-40">
          <Image
            src={item.imageUrl || Bedroom.src}
            alt="Room"
            fill
            className="object-cover rounded-xl"
          />
            </div>

            {/* Details Section */}
            <div className="flex flex-col">
          <p className="text-sm md:text-lg font-semibold text-gray-700">
            {item.location}, {item.townSector}, {item.city}
          </p>
          <h2 className="text-base md:text-xl font-medium text-gray-800">
            {item.Bhk} BHK | Security {item.security}
          </h2>
          <p className="text-lg md:text-2xl text-green-600 font-bold">
            Rent: ₹{item.minprice} - ₹{item.maxprice}
          </p>

          {/* Bottom Section */}
          <div className="flex items-center gap-6 mt-2">
            <div className="relative w-20 h-6 sm:w-32 sm:h-6">
              <Image
            src={Bedroom.src}
            alt="Banglore"
            fill
            className="object-cover"
              />
            </div>
            <button className="bg-orange-800 text-white rounded px-4 py-2 text-sm font-semibold sm:text-xs sm:px-2 sm:py-1">
              CONTACT
            </button>
          </div>
            </div>
          </div>
        ))
          )}

          {/* Recent Searches */}
          {
            activeTab === "Recent_Searches" && (
              <div className="mt-1 w-full sm:w-2/3 mx-auto">
  
              {/* Contact Log */}
              {recentSearch.logs.length === 0 ? (
                <p className="text-center text-gray-600">No Recent Search</p>
              ) : (
                recentSearch.logs.map((lead: LeadLog) => (
                  <div key={lead.id} className="bg-white rounded-md shadow-md p-4 mb-4">
                    <p className="p-2 text-base flex items-center justify-center ">
                      Address: {lead.adress}
                    </p>
                    <div className="flex items-center justify-center gap-8 p-2 border-b border-gray-300 ">
                      <div className="flex items-center space-x-2 w-10 h-10">
                        <Image
                          fill
                          src={Customer.src}
                          alt={lead.customerName}
                          className="object-contain rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{lead.customerName}</span>
                          <span className="text-xs">Mob No.: {lead.customerPhone}</span>
                          <span className="text-xs">Date: {new Date(lead.accessDate).toLocaleDateString('en-CA')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                          Call
                        </button>
  
                        <Image
                          src={Delete.src}
                          alt="Delete"
                          className="cursor-pointer"
                          height={30}
                          width={30}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            )
          }
        </div>
      </div>
    </>

  );
}