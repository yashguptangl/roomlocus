"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaShareAlt } from "react-icons/fa";
import AgentGuide from "../../../components/agentGuide";

type Tab = "guide" | "incoming_request" | "Verified";
interface DecodedToken {
  agentId: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("incoming_request");
  const router = useRouter();
  const [token, setToken] = useState(""); // Initialize token as an empty string
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [ownerData, setOwnerData] = useState<{ username: string; mobile: string } | null>(null);
  const [agentData, setAgentData] = useState<{ walletRs: string } | null>(null);
  const [requests, setRequests] = useState<
    {
      id: number;
      listingType: string;
      adress: string;
      status: string;
      listingShowNo: string;
      listingId: number;
    }[]
  >([]);
  const [verifiedRequests, setVerifiedRequests] = useState<
    {
      id: number;
      listingType: string;
      adress: string;
      listingShowNo: string;
      status: string;
      listingId: number;
      createdAt: string;
    }[]
  >([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest"); // Sorting state

  // Pagination state for Verified tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(verifiedRequests.length / itemsPerPage);
  const paginatedVerifiedRequests = verifiedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on sort or data change
  }, [sortOrder, verifiedRequests.length]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || "";
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const payloadBase64 = token.split(".")[1];
        const payload = payloadBase64 ? JSON.parse(atob(payloadBase64)) : null;
        if (payload && payload.agentId) {
          setDecodedToken({ agentId: payload.agentId });
          localStorage.setItem("agentId", payload.agentId);

        } else {
          console.log("Invalid token payload");
          router.push("/agent/signin");
        }
      } catch (err) {
        console.log("Error decoding token:", err);
        router.push("/agent/signin");
      }
    }
  }, [token, router]);


  useEffect(() => {
    if (decodedToken) {
      const getProgress = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/progress/${decodedToken.agentId}`,
            {
              method: "GET",
              headers: {
                token: token,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 404) {
            router.push("/agent/personalDetail");
            return;
          }

          const result = await response.json();
          if (!result.progress) {
            router.push("/agent/personalDetail");
            return;
          }

          const step = result.progress.step;
          switch (step) {
            case "personalDetails":
              router.push("/agent/uploadAgentDoc");
              break;
            case "uploadDocuments":
              router.push("/agent/bankDetail");
              break;
            case "bankDetails":
              router.push("/agent/dashboard");
              break;
            default:
              router.push("/agent/dashboard");
          }

          const agentData = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/agent/${decodedToken.agentId}`,
            {
              headers: {
                token: token,
                "Content-Type": "application/json",
              },
            }
          );
          setAgentData(agentData.data.agent);
        } catch (error) {
          console.error("Error retrieving progress:", error);
        }
      };
      getProgress();
    }
  }, [decodedToken, router, token]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (decodedToken) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/agent-requests/${decodedToken.agentId}`,
            {
              headers: {
                token: token,
              },
            }
          );
          const data = response.data;
          setRequests(data.requests);
          setOwnerData(data.owner[0]);
        } catch (error) {
          console.error("Error fetching requests:", error);
        }
      }
    };

    if (activeTab === "incoming_request") {
      fetchRequests();
    }
  }, [activeTab, decodedToken, token]);

  useEffect(() => {
    const fetchVerifiedRequests = async () => {
      if (decodedToken) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/agent-verified-properties/${decodedToken.agentId}?sort=${sortOrder}`,
            {
              headers: {
                token: token,
              },
            }
          );
          const data = response.data;
          setVerifiedRequests(data);
        } catch (error) {
          console.error("Error fetching verified requests:", error);
        }
      }
    };

    if (activeTab === "Verified") {
      fetchVerifiedRequests();
    }
  }, [activeTab, sortOrder, decodedToken, token]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex flex-row items-center justify-around bg-white p-3">
        <div className="flex flex-col gap-0.5 items-center mt-0.5">
          <p className="text-lg">Agent id : {decodedToken?.agentId || "N/A"}</p>
          <p className="text-lg">Wallet : {agentData ? agentData.walletRs : "N/A"}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-between border-b border-gray-300 bg-blue-400">
        <button
          onClick={() => setActiveTab("guide")}
          className={`flex-1 text-center py-2 font-semibold ${activeTab === "guide"
            ? "text-blue-500 border-b-3 border-blue-500"
            : "text-white"
            }`}
        >
          Guide
        </button>
        <button
          onClick={() => setActiveTab("incoming_request")}
          className={`flex-1 text-center py-2 font-semibold ${activeTab === "incoming_request"
            ? "text-blue-500 border-b-3 border-blue-500"
            : "text-white"
            }`}
        >
          Request
        </button>
        <button
          onClick={() => setActiveTab("Verified")}
          className={`flex-1 text-center py-2 font-semibold ${activeTab === "Verified"
            ? "text-blue-500 border-b-2 border-blue-500"
            : "text-white"
            }`}
        >
          Verified
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex items-center justify-center">
        {activeTab === "guide" && (
          <AgentGuide />
        )}

        {activeTab === "incoming_request" && (
          <div className="mt-6 w-full max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Incoming Requests ({requests.length})
            </h2>

            {requests.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium capitalize">
                          {request.listingType}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Address: {request.adress || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Owner: {ownerData?.username}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${request.status === "pending"
                          ? "bg-blue-100 text-blue-800"
                          : request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-300 text-gray-800"
                          }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="flex justify-between pb-1.5">
                      <p className="text-sm text-gray-600 mt-2">
                        Contact: {request.listingShowNo || "N/A"}
                      </p>
                      <button
                        className="text-sm p-1 bg-blue-500 text-white mt-2 rounded"
                        onClick={() => {
                          router.push(
                            `/agent/agentverification?id=${request.id}&agentId=${decodedToken?.agentId}`
                          );
                        }}
                      >
                        Do Verification
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Verified" && (
          <div className="mt-6 w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                Verified Properties ({verifiedRequests.length})
              </h2>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className="p-2 border rounded-lg text-sm"
              >
                <option value="newest">Newest to Oldest</option>
                <option value="oldest">Oldest to Newest</option>
              </select>
            </div>

            {verifiedRequests.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No verified properties found</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedVerifiedRequests.map((request) => {
                    const createdAt = new Date(request.createdAt);
                    const now = new Date();
                    const timeDiff = now.getTime() - createdAt.getTime();
                    const daysSinceVerification = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                    const shouldShowNumber = daysSinceVerification >= 335;

                    const shareUrl = `${window.location.origin}/${request.listingType}/${request.listingId}`; // change to your domain

                    const handleShare = async () => {
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: "Check this property on Roomlocus!",
                            text: `Check out this ${request.listingType} listing`,
                            url: shareUrl,
                          });
                        } catch (error) {
                          console.error("Sharing failed", error);
                        }
                      } else {
                        await navigator.clipboard.writeText(shareUrl);
                        alert("Link copied to clipboard!");
                      }
                    };
                    return (
                      <div
                        key={request.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium capitalize">{request.listingType}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Address: {request.adress || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Verified on: {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Right-side icons */}
                          <div className="flex flex-col items-end space-y-2">
                            <button onClick={handleShare} className="text-gray-600 hover:text-gray-800">
                              <FaShareAlt className="text-base m-1" />
                            </button>

                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Verified
                            </span>
                          </div>
                        </div>

                        {shouldShowNumber ? (
                          <p className="text-sm text-gray-800 mt-2">
                            Contact: {request.listingShowNo}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic mt-2">
                            Contact will be visible closer to expiry
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
                  >
                    Prev
                  </button>
                  <span className="px-2 py-1">{currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}