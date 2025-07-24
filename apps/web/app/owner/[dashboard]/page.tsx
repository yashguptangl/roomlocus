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
import { Menu, Transition } from "@headlessui/react";
import { FaShareAlt } from "react-icons/fa";
import OwnerGuide from "../../../components/ownerGuide";
import Script from "next/script";
import { z } from "zod";

type Tab = "guide" | "myRental" | "usedLead";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UsedLeadsResponse {
  logs: LeadLog[];
}

const leadCountSchema = z.number().min(10, { message: "Minimum 10 leads required" });

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("myRental");
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState("");
  const [price, setPrice] = useState(0);
  const [isRentalListOpen, setIsRentalListOpen] = useState(false);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [points, setPoints] = useState("");
  const [usedLeads, setUsedLeads] = useState<UsedLeadsResponse>({ logs: [] });
  const [isKycVerified, setIsKycVerified] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [ownerDetails, setOwnerDetails] = useState<any>(null);
  const [offerModal, setOfferModal] = useState<{ open: boolean; listing?: ListingItem }>({
    open: false,
    listing: undefined,
  });

  const handleScriptLoad = () => setRazorpayReady(true);

  // Razorpay checkout open function
  const openRazorpay = (order: any, paymentFor: string) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Payment system not ready. Please refresh the page.");
      return;
    }
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.orderId, // Razorpay order id
      prefill: order.prefill,
      notes: order.notes,
      handler: async function (response: any) {
        setPayLoading(true);
        try {
          const verifyRes = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/payment/razorpay/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              backendOrderId: order.backendOrderId, // DB orderId
              paymentFor,
              ownerId: order.notes.ownerId,
              leadCount: order.notes.leadCount,
            }
          );
          if (verifyRes.data.success && verifyRes.data.redirect) {
            window.location.href = verifyRes.data.redirect;
          } else {
            alert("Payment verification failed!");
          }
        } catch (err) {
          alert("Payment verification failed!");
        }
        setPayLoading(false);
      },
      theme: {
        color: "#3399cc",
        hide_topbar: false,
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Listing Verification Payment
  const handleListingVerification = async (listing: any) => {
    setPayLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/payment/razorpay`,
        {
          paymentFor: "listing",
          listingId: String(listing.id),
          listingType: listing.type,
          address: listing.address || listing.Adress || listing.adress,
          location: listing.location,
          city: listing.city,
          townSector: listing.townSector,
          listingShowNo: listing.listingShowNo,
          firstname: ownerDetails?.username || "Owner",
          email: ownerDetails?.email || "",
          phone: ownerDetails?.mobile || "",
        }
      );
      openRazorpay(res.data, "listing");
    } catch (err: any) {
      if (err?.response?.data?.error === "Payment already completed for this listing") {
        alert("Payment already completed for this listing.");
        router.push(
        `/owner/location?listingType=${listing.type}&listingId=${listing.id}&listingShowNo=${listing.listingShowNo}&address=${encodeURIComponent(listing.address || listing.Adress || listing.adress || "")}&location=${encodeURIComponent(listing.location)}&city=${encodeURIComponent(listing.city)}&townSector=${encodeURIComponent(listing.townSector)}`
      );
      } else {
        alert("Payment start failed!");
      }
    }
    setPayLoading(false);
  };

  // Lead Buy Payment
  const handleLeadBuy = async () => {
    setPayLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/payment/razorpay`,
        {
          paymentFor: "lead",
          ownerId: ownerDetails?.id,
          leadCount: leads,
          leadPrice: 5,
          firstname: ownerDetails?.username || "Owner",
          email: ownerDetails?.email || "",
          phone: ownerDetails?.mobile || "",
        }
      );
      openRazorpay(res.data, "lead");
      setShowModal(false);
    } catch (err) {
      alert("Payment start failed!");
    }
    setPayLoading(false);
  };

  // Delete used lead
  const handleDeleteLead = async (leadId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated");
        return;
      }
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/recentContacts/delete`,
        {
          headers: { token },
          data: { id: leadId },
        }
      );
      if (response.data.success) {
        setUsedLeads((prev) => ({
          ...prev,
          logs: prev.logs.filter((lead) => String(lead.id) !== String(leadId)),
        }));
        alert("Lead deleted successfully");
      } else {
        alert("Failed to delete lead");
      }
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("An error occurred while deleting the lead");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const payloadBase64 = token.split(".")[1];
      const payload = payloadBase64 ? JSON.parse(atob(payloadBase64)) : null;
      const ownerId = payload?.id;

      async function ownerDetails() {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/details-owner`,
            { headers: { token } }
          );
          setOwnerDetails(response.data.ownerDetails);
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
          return res.data;
        } catch (err) {
          return [];
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
              adress: item.adress || item.Adress || item.adress || "",
            })) || [];

          const pgListings =
            data.listings.PgInfo?.map((item: ListingItem) => ({
              ...item,
              type: "pg",
              listingId: item.id,
              adress: item.adress || item.Adress || item.adress || "",
            })) || [];

          const roomListings =
            data.listings.RoomInfo?.map((item: ListingItem) => ({
              ...item,
              type: "room",
              listingId: item.id,
              adress: item.adress || item.Adress || item.adress || "",
            })) || [];

          const hourlyroomListings =
            data.listings.HourlyInfo?.map((item: ListingItem) => ({
              ...item,
              type: "hourlyroom",
              listingId: item.id,
              adress: item.adress || item.Adress || item.adress || "",
            })) || [];

          const allListings = [
            ...flatListings,
            ...pgListings,
            ...roomListings,
            ...hourlyroomListings,
          ];

          const listingsWithImages = await Promise.all(
            allListings.map(async (listing) => {
              if (listing.isDraft) {
                return { ...listing, images: { images: Bedroom.src } };
              }
              const images = await fetchImagesForListing(
                listing.type,
                listing.listingId
              );
              return { ...listing, images };
            })
          );

          setListings(listingsWithImages);
        } catch (e) {
          console.error("Error fetching listings:", e);
        }
      };

      usedLeadData(token, ownerId);
      fetchListings(token, ownerId);
      ownerDetails();
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
          prevListings.filter(
            (listing) => !(listing.id === listingId && listing.type === type)
          )
        );
      } else {
        alert("Failed to delete listing");
      }
    } catch (error) {
      alert("An error occurred while deleting the listing");
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
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
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 backdrop-blur-sm ">
            <div className="bg-white p-4 rounded-md shadow-md w-9/12 sm:w-2/3 md:w-1/3 lg:w-1/4 ">
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
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = Number(value);
                    setLeads(value);
                    if (value === "" || num === 0) {
                      setPrice(0);
                    } else {
                      setPrice(num * 5); // ₹5 per lead
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md placeholder:text-gray-500"
                  placeholder="Enter number of leads"
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
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    if (Number(leads) < 10) {
                      alert("Minimum 10 leads required.");
                      return;
                    }
                    handleLeadBuy();
                  }}
                  disabled={payLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  {payLoading ? "PROCESSING..." : "PAY"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex justify-between border-b border-gray-300 bg-blue-300">
          <button
            onClick={() => setActiveTab("myRental")}
            className={`flex-1 text-center py-2 font-semibold ${activeTab === "myRental"
              ? "text-blue-400 border-b-3 border-blue-500"
              : "text-white"
              }`}
          >
            My Rentals
          </button>
          <button
            onClick={() => setActiveTab("usedLead")}
            className={`flex-1 text-center py-2 font-semibold ${activeTab === "usedLead"
              ? "text-blue-400 border-b-3 border-blue-500"
              : "text-white"
              }`}
          >
            Used Lead
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex-1 text-center py-2 font-semibold ${activeTab === "guide"
              ? "text-blue-400 border-b-2 border-blue-500"
              : "text-white"
              }`}
          >
            Guide
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
                    key={`${listing.type}-${listing.id}`}
                    className="bg-white flex flex-col w-72 rounded-md shadow-md overflow-hidden mb-4"
                  >
                    <div className="relative mod:w-72 mod:h-36 ssm:h-36 ssm:w-72 md:h-40 md:w-72 w-full sm:w-44 h-40">
                      <button
                        className="absolute top-3 right-3 z-10 bg-white/50 p-1.5 rounded-full shadow hover:bg-white"
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
                          e.currentTarget.src = Bedroom.src;
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
                        onClick={() => {
                          if (Number(points) <= 0) {
                            setShowModal(true);
                            alert("You need to buy leads to publish your property.");
                            return;
                          }
                          toggleButton(
                            listing.id,
                            listing.type,
                            listing.isVisible
                          );
                        }}
                        id={`publish-${listing.id}`}
                        className={`px-1 py-0.5 rounded-lg text-white text-xs w-8 ${listing.isVisible ? "bg-green-500" : "bg-red-500"
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
                                        className={`${active
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
                                        className={`${active
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
                                      className={`${active
                                        ? "bg-blue-500 text-white"
                                        : "text-gray-900"
                                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                      onClick={() => {
                                        if (!listing.isVerified) {
                                          alert("You can edit the listing only after verification is complete.");
                                          return;
                                        }
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
                        {listing.type === "hourlyroom"
                          ? <>Hourly Room | {listing.palaceName}</>
                          : <>
                            {listing.BHK === "1 RK" || listing.BHK === "2 RK"
                              ? `${listing.BHK} | ${listing.type} | Security ${listing.security}`
                              : `${listing.BHK} BHK | ${listing.type} | Security ${listing.security}`}
                          </>
                        }
                      </h2>
                      <p className="text-green-600 font-medium text-sm">
                        Rent : {listing.MinPrice} - {listing.MaxPrice}
                      </p>
                      <p className="text-sm ">
                        {listing.isVisible
                          ? "Property is visible to customers"
                          : "Property is not visible to customers"}
                      </p>

                      <button
                        className={`mt-1.5 rounded-md text-white text-sm ssm:text-sm ssm:p-2 w-full ${listing.isDraft
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
                          } else if (isKycVerified && listing.paymentDone === false) {
                            setOfferModal({
                              open: true,
                              listing,
                            });
                          } else if (isKycVerified === false) {
                            alert("Please complete your KYC first.");
                            router.push(`/owner/owner-kyc`);
                          } else if (listing.isLiveLocation === false) {
                            router.push(`/owner/location?listingType=${listing.type}&listingId=${listing.id}&listingShowNo=${listing.listingShowNo}&address=${listing.adress || listing.Adress || listing.adress || ""}&location=${listing.location}&city=${listing.city}&townSector=${listing.townSector}`);
                          } else {
                            router.push(`/owner/verification/?listingType=${listing.type}&listingId=${listing.id}&listingShowNo=${listing.listingShowNo}&address=${listing.adress || listing.Adress || listing.adress || ""}&location=${listing.location}&city=${listing.city}&townSector=${listing.townSector}`);
                          }
                        }}
                      >
                        {listing.isDraft
                          ? "Complete Listing"
                          : listing.isVerified
                            ? "Verified"
                            : "Pending Verification"}
                      </button>

                      {/* Offer Modal */}
                      {offerModal?.open && offerModal.listing?.id === listing.id && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4"
                          onClick={() => setOfferModal({ open: false })}
                        >
                          <div
                            className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col items-center relative"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              className="absolute top-1 right-4 text-gray-800 text-4xl"
                              onClick={() => setOfferModal({ open: false })}
                            >
                              ×
                            </button>
                            <div className="mb-3 text-center">
                              <span className="block text-lg font-bold text-gray-700 mb-1">Annual Fee</span>
                              <span className="block text-lg font-normal text-red-500 line-through">₹ 3999 /-</span>
                              <span className="block text-xl font-semibold text-green-600 mt-1">₹ 365 <span className="text-base font-medium">only</span></span>
                              <span className="block text-xs text-gray-700 mt-2">Limited time offer for property verification</span>
                            </div>
                            <button
                              className="px-6 py-1 bg-green-600 rounded-md text-white "
                              onClick={() => {
                                setOfferModal({ open: false });
                                handleListingVerification(listing);
                              }}
                            >
                              PAY
                            </button>
                          </div>
                        </div>
                      )}
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
              {usedLeads.logs.length === 0 ? (
                <p className="text-center">No leads available</p>
              ) : (
                usedLeads.logs
                  .filter((lead: LeadLog) => !lead.ownerDeleted)
                  .map((lead: LeadLog) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-md shadow-md p-4 mb-4"
                    >
                      <p className="p-1 text- flex items-center justify-center">
                        {lead.propertyType} | {lead.landmark} | {lead.location}
                      </p>
                      <div className="flex flex-col items-center gap-10 p-2 border-b border-gray-300">
                        <div className="flex items-center gap-16">
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
                            <button
                              onClick={() => (window.location.href = `tel:${lead.customerPhone}`)}
                              className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                              Call
                            </button>
                            <Image
                              src={Delete.src}
                              alt="Delete"
                              className="cursor-pointer"
                              height={30}
                              width={30}
                              onClick={() => handleDeleteLead(lead.id)}
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
            <div
              className="fixed inset-0 flex items-center justify-center z-50"
              onClick={() => {
                setIsRentalListOpen(false);
                setOwnerDetails((prev: any) => ({ ...prev, agreedToTerms: false }));
              }}
            >
              <div className="absolute inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-sm"></div>
              <div
                className="relative bg-white p-4 rounded-md shadow-md w-9/12 sm:w-2/3 md:w-1/3 lg:w-1/4"
                onClick={e => e.stopPropagation()}
              >
                {!ownerDetails?.agreedToTerms ? (
                  <>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Note
                    </h2>
                    <p className="text-sm text-gray-700 mb-6 text-justify">
                      If the owner posts property details or photos illegally or incorrectly on the website, the Roomlocus team can block your ID and may also take legal action against you.
                      The owner will be fully responsible for any illegal or incorrect posting of property details or photos on the website.
                    </p>
                    <div className="flex justify-end">
                      <button
                        className="bg-blue-300 text-white px-2 py-1 rounded-md font-normal"
                        onClick={() => {
                          setOwnerDetails((prev: any) => ({ ...prev, agreedToTerms: true }));
                        }}
                      >
                        Agree
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      Add Rental
                    </h2>
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
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => {
                          setIsRentalListOpen(false);
                          setOwnerDetails((prev: any) => ({ ...prev, agreedToTerms: false }));
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "guide" && <OwnerGuide />}
        </div>
      </div>
    </>
  );
}