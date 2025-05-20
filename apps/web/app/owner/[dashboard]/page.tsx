"use client";
import { useState, useEffect } from "react";
import Bedroom from "../../../assets/bedroom.jpg";
import Delete from "../../../assets/delete.png";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { LeadLog } from "../../../types/lead";
import { ListingItem } from "../../../types/listing";
import { useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react"; // Add this for dropdown
import { FaShareAlt } from "react-icons/fa";

type Tab = "guide" | "myRental" | "usedLead";

interface UsedLeadsResponse {
  logs: LeadLog[];
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("myRental"); // Default active tab
  const [showModal, setShowModal] = useState(false); // Show/Hide modal
  const [leads, setLeads] = useState(10); // Default number of leads
  const [price, setPrice] = useState(leads * 5); // Calculate price based on leads
  const [isRentalListOpen, setIsRentalListOpen] = useState(false);
  const [listings, setListings] = useState<ListingItem[]>([]); // Ensure listings is always an array
  const [points, setPoints] = useState("");
  const [usedLeads, setUsedLeads] = useState<UsedLeadsResponse>({ logs: [] });
  const [isKycVerified, setIsKycVerified] = useState(true); // Default to true

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const payloadBase64 = token.split(".")[1];
      const payload = payloadBase64 ? JSON.parse(atob(payloadBase64)) : null;
      console.log("Payload:", payload);

      const ownerId = payload?.id;

      async function ownerDeatils() {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/details-owner`,
            { headers: { token } }
          );
          console.log("Owner Details:", response.data);
          setPoints(response.data.ownerDetails.points);
          setIsKycVerified(response.data.ownerDetails.isKYCVerified);
        } catch (err) {
          console.log("Error fetching owner details:", err);
        }
      }

      async function usedLeadData(token: string, ownerId: string) {
        try {
          const leadResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/contact-logs/${ownerId}`,
            { headers: { token } }
          );
          setUsedLeads(leadResponse.data);
          console.log("Used Leads:", leadResponse.data);
        } catch (err) {
          console.error("Error fetching used leads:", err);
        }
      }

      async function fetchImagesForListing(type: string, listingId: string) {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/images/${type}/${listingId}`,
            { headers: { token } }
          );
          return res.data; // assuming array of image URLs or objects
        } catch (err) {
          console.error(`Error fetching images for listing ${listingId}:`, err);
          return []; // fallback to empty array
        }
      }

      const fetchListings = async (token: string, ownerId: string) => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/${ownerId}/listings`,
            { headers: { token } }
          );

          const data = response.data;

          const flatListings =
            data.listings.FlatInfo?.map((item: ListingItem) => ({
              ...item,
              type: "flat",
              listingId: item.id,
            })) || [];

          const pgListings =
            data.listings.PgInfo?.map((item: ListingItem) => ({
              ...item,
              type: "pg",
              listingId: item.id,
            })) || [];

          const roomListings =
            data.listings.RoomInfo?.map((item: ListingItem) => ({
              ...item,
              type: "room",
              listingId: item.id,
            })) || [];

          const hourlyroomListings =
            data.listings.HourlyInfo?.map((item: ListingItem) => ({
              ...item,
              type: "hourlyroom",
              listingId: item.id,
            })) || [];
          console.log("Hourly Room Listings:", hourlyroomListings);

          const allListings = [
            ...flatListings,
            ...pgListings,
            ...roomListings,
            ...hourlyroomListings,
          ];

          console.log("All Listings:", allListings);

          // Skip fetching images for drafts and use fallback
          const listingsWithImages = await Promise.all(
            allListings.map(async (listing) => {
              if (listing.isDraft) {
                return { ...listing, images: { images: Bedroom.src } }; // Use fallback image
              }
              console.log(
                "Fetching images for:",
                listing.type,
                listing.listingId
              );
              const images = await fetchImagesForListing(
                listing.type,
                listing.listingId
              );
              return { ...listing, images };
            })
          );

          console.log("Listings with images:", listingsWithImages);
          setListings(listingsWithImages);
        } catch (e) {
          console.error("Error fetching listings:", e);
          alert("Failed to load listings. Please try again.");
        }
      };

      usedLeadData(token, ownerId);
      fetchListings(token, ownerId);
      ownerDeatils();
    }
  }, []);

  const toggleButton = async (
    listingId: string,
    type: string,
    isVisible: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/publish`,
        { listingId, type, isVisible },
        { headers: { token } }
      );

      if (response.status === 200) {
        alert(response.data.message);
        setListings((prevListings) =>
          prevListings.map((listing) =>
            listing.id === listingId
              ? { ...listing, isVisible: !isVisible }
              : listing
          )
        );
      } else {
        alert("Failed to update listing visibility");
      }
    } catch (error) {
      console.error("Error updating listing visibility:", error);
      alert("An error occurred while updating listing visibility");
    }
  };

  const handleDeleteListing = async (listingId: string, type: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated");
        return;
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/listing`,
        {
          headers: { token },
          data: { listingId, type },
        }
      );

      if (response.status === 200) {
        alert(response.data.message);
        setListings((prevListings) =>
          prevListings.filter((listing) => listing.id !== listingId)
        );
      } else {
        alert("Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("An error occurred while deleting the listing");
    }
  };

  const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(10, parseInt(e.target.value)); // Minimum value is 10
    setLeads(value);
    setPrice(value * 5); // Update price
  };

  const handlePay = () => {
    setShowModal(false);
    alert(`You have successfully purchased ${leads} leads for ₹${price}`);
    // Integrate payment gateway logic here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex flex-row items-center justify-around bg-white p-3">
        <div className="flex flex-col gap-0.5 items-center mt-0.5">
          <p className="text-lg">Lead Left: {points}</p>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-green-600 rounded-md ssm:p-1 ssm:text-xs md:p-2 md:text-sm"
          >
            Buy Lead
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-4 rounded-md shadow-md w-9/12 sm:w-2/3 md:w-1/3 lg:w-1/4">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Buy Leads
            </h2>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">
                Enter Number of Leads (Min 10):
              </label>
              <input
                type="number"
                value={leads}
                onChange={handleLeadChange}
                className="w-full border border-gray-300 rounded-md p-2"
                min={10}
              />
            </div>
            <div className="text-lg font-semibold text-center mb-4">
              Total Price: ₹{price}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Navigation Tabs */}
      <div className="flex justify-between border-b border-gray-300 bg-blue-400">
        <button
          onClick={() => setActiveTab("guide")}
          className={`flex-1 text-center py-2 font-semibold ${
            activeTab === "guide"
              ? "text-blue-500 border-b-3 border-blue-500"
              : "text-white"
          }`}
        >
          Guide
        </button>
        <button
          onClick={() => setActiveTab("myRental")}
          className={`flex-1 text-center py-2 font-semibold ${
            activeTab === "myRental"
              ? "text-blue-500 border-b-3 border-blue-500"
              : "text-white"
          }`}
        >
          My Rentals
        </button>
        <button
          onClick={() => setActiveTab("usedLead")}
          className={`flex-1 text-center py-2 font-semibold ${
            activeTab === "usedLead"
              ? "text-blue-500 border-b-2 border-blue-500"
              : "text-white"
          }`}
        >
          Used Lead
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex items-center justify-center ">
        {activeTab === "myRental" && (
          <div className="w-full flex items-center justify-between flex-col">
            <div className="flex justify-between p-4 ssm:p-1 w-72">
              <h2
                className="text-lg font-medium mb-4 cursor-pointer ssm:text-lg"
                onClick={() => setIsRentalListOpen(!isRentalListOpen)}
              >
                Add Rental +
              </h2>
            </div>

            {/* Rental Card */}
            {listings.length === 0 ? (
              <p>No Listings Available</p>
            ) : (
              listings.map((listing) => (
                <div
                  key={`${listing.type}-${listing.id}`} // Combine type and id to ensure unique keys
                  className="bg-white flex flex-col w-72 rounded-md shadow-md overflow-hidden mb-4"
                >
                  <div className="relative mod:w-72 mod:h-36 ssm:h-36 ssm:w-72 md:h-40 md:w-72 w-full sm:w-44 h-40">
                    <button
                      className="absolute top-3 right-3 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white"
                      onClick={async (e) => {
                      e.stopPropagation();
                      const shareUrl = `${window.location.origin}/${listing.type}/${listing.id}`;
                      if (navigator.share) {
                        try {
                        await navigator.share({
                          title: "Check out this rental listing",
                          url: shareUrl,
                        });
                        } catch (err) {
                           alert("Failed to share the link.");
                        }
                      } else {
                        await navigator.clipboard.writeText(shareUrl);
                        alert("Link copied to clipboard!");
                      }
                      }}
                    >
                      <FaShareAlt className="text-gray-700 text-lg" />
                    </button>
                    <Image
                      src={listing.images.images}
                      fill
                      alt="Room"
                      className={`object-cover p-2 rounded-xl ${listing.isVisible ? "" : "opacity-50"}`}
                      onError={(e) => {
                        e.currentTarget.src = Bedroom.src; // Fallback image
                      }}
                    />
                  </div>
                  <div className="flex justify-center items-center gap-2 p-2">
                    <label
                      htmlFor={`publish-${listing.id}`}
                      className="text-sm"
                    >
                      Publish
                    </label>
                    <button
                      onClick={() =>
                        toggleButton(
                          listing.id,
                          listing.type,
                          listing.isVisible
                        )
                      }
                      id={`publish-${listing.id}`}
                      className={`px-1 py-0.5 rounded-lg text-white text-xs w-8 ${
                        listing.isVisible ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {listing.isVisible ? "on" : "off"}
                    </button>
                  </div>
                  <div className="flex justify-between items-center px-3 py-1">
                    <p className="ssm:text-base md:text-base ">
                      {listing.location}, {listing.townSector}, {listing.city}
                    </p>
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="inline-flex justify-center w-full rounded-md bg-gray-200 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300">
                        ...
                      </Menu.Button>
                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="px-1">
                            {listing.isDraft ? (
                              <>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      className={`${
                                        active
                                          ? "bg-blue-500 text-white"
                                          : "text-gray-900"
                                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                      onClick={() => {
                                        router.push(
                                          `/owner/${listing.type}/images`
                                        );
                                        localStorage.setItem(
                                          `${listing.type}Id`,
                                          listing.id
                                        );
                                      }}
                                    >
                                      Complete Listing
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      className={`${
                                        active
                                          ? "bg-red-500 text-white"
                                          : "text-gray-900"
                                      } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                      onClick={() =>
                                        handleDeleteListing(
                                          listing.id,
                                          listing.type
                                        )
                                      }
                                    >
                                      Delete Listing
                                    </button>
                                  )}
                                </Menu.Item>
                              </>
                            ) : (
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    className={`${
                                      active
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-900"
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => {
                                      router.push(
                                        `/owner/edit?listingType=${listing.type}&listingId=${listing.id}`
                                      );
                                      localStorage.setItem(
                                        `${listing.type}Id`,
                                        listing.id
                                      );
                                    }}
                                  >
                                    Edit Listing
                                  </button>
                                )}
                              </Menu.Item>
                            )}
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="px-3 pb-3">
                    <h2 className="text-xl font-medium ssm:text-xs mod:text-base">
                      {listing.BHK} BHK {listing.type} | Security{" "}
                      {listing.security}{" "}
                    </h2>
                    <p className="text-green-600 font-medium text-sm">
                      Rent : {listing.MinPrice} - {listing.MaxPrice}
                    </p>
                    <p className="text-sm ">
                      {listing.isVisible
                        ? "Listing is shown on web"
                        : "Listing is off"}
                    </p>

                    <button
                      className={`mt-1.5 rounded-md text-white text-sm ssm:text-sm ssm:p-2 w-full ${
                        listing.isDraft
                          ? "bg-blue-600"
                          : listing.isVerified
                            ? "bg-blue-600"
                            : "bg-red-600"
                      }`}
                      onClick={() => {
                        if (listing.isDraft) {
                          alert("Please complete your listing first.");
                          router.push(`/owner/${listing.type}/images`);
                          localStorage.setItem(`${listing.type}Id`, listing.id);
                        } else if (isKycVerified) {
                          router.push(
                            `/owner/verification?listingId=${listing.id}&listingType=${listing.type}&listingShowNo=${listing.listingShowNo}`
                          ); // Redirect to Verification page
                        } else {
                          alert("Please complete your KYC first."); // Optional alert for better UX
                          router.push(`/owner/owner-kyc`); // Redirect to Owner KYC page
                        }
                      }}
                    >
                      {listing.isDraft
                        ? "Complete Listing"
                        : listing.isVerified
                          ? "Verified"
                          : "Pending Verification"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "usedLead" && (
          <div className="mt-4 w-full sm:w-2/3 mx-auto">
            <h2 className="text-base font-medium mb-4 text-center">
              Customer Visited Your Profile
            </h2>

            {/* Contact Log */}
            {usedLeads.logs.length === 0 ? (
              <p className="text-center">No leads available</p>
            ) : (
              usedLeads.logs.map((lead: LeadLog) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-md shadow-md p-4 mb-4"
                >
                  <p className="p-1 text-base flex items-center justify-center">
                    Address: {lead.adress}
                  </p>
                  <div className="flex flex-col items-center gap-10 p-2 border-b border-gray-300">
                    <div className="flex items-center gap-20">
                      <div className="flex item-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">
                            Name: {lead.customerName}
                          </span>
                          <span className="text-xs text-gray-600">
                            Mob No.: {lead.customerPhone}
                          </span>
                          <span className="text-xs text-gray-600">
                            Date:{" "}
                            {new Date(lead.accessDate).toLocaleDateString(
                              "en-CA"
                            )}
                          </span>
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
                </div>
              ))
            )}
          </div>
        )}

        {/* Rental List Modal */}
        {isRentalListOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded-md shadow-md w-9/12 sm:w-2/3 md:w-1/3 lg:w-1/4">
              <h2 className="text-xl font-semibold mb-4 text-center">
                Add Rental
              </h2>

              {/* Links to Rentals */}
              <div className="space-y-4 text-center flex flex-col">
                <Link
                  className="text-blue-500 hover:underline"
                  href="/owner/flat"
                >
                  FLAT
                </Link>
                <Link
                  className="text-blue-500 hover:underline"
                  href="/owner/room"
                >
                  ROOM
                </Link>
                <Link
                  className="text-blue-500 hover:underline"
                  href="/owner/pg"
                >
                  PG
                </Link>
                <Link
                  className="text-blue-500 hover:underline"
                  href="/owner/hourlyroom"
                >
                  HOURLY ROOM
                </Link>
              </div>

              {/* Close Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsRentalListOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guide" && (
          <div className="mt-4 w-full sm:w-2/3 mx-auto flex justify-center items-center flex-col bg-gray-200 ">
            <div className="pb-8">
              <ul>
                <li className="text-base list-disc text-red-600">
                  Profile automatically off when lead is off
                </li>
                <li className="text-base list-disc text-red-600">
                  Profile automatically off when lead is off
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
