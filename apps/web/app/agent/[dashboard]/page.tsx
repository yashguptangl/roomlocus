"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
    }[]
  >([]);
  const [verifiedRequests, setVerifiedRequests] = useState<
    {
      id: number;
      listingType: string;
      adress: string;
      mobile: string;
      status: string;
      createdAt: string;
    }[]
  >([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest"); // Sorting state

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
          console.error("Invalid token payload");
          router.push("/agent/signin");
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        router.push("/agent/signin");
      }
    } else {
      console.error("Token not found");
      router.push("/agent/signin");
    }
  }, [token, router]);

  useEffect(() => {
    if (decodedToken) {
      const getProgress = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/progress/${decodedToken.agentId}`, // Corrected BACKEND_URL
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
          console.log("Progress:", result);

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
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/agent/${decodedToken.agentId}`, // Corrected BACKEND_URL
            {
              headers: {
                token: token,
                "Content-Type": "application/json",
              },
            }
          );
          setAgentData(agentData.data.agent[0]);
          console.log("Agent Data:", agentData.data.agent[0]);
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
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/agent-requests/${decodedToken.agentId}`, // Corrected BACKEND_URL
            {
              headers: {
                token: token,
              },
            }
          );
          const data = response.data;
          console.log("Incoming Requests:", data.requests);
          console.log("Owner Data:", data.owner);
          setRequests(data.requests);
          setOwnerData(data.owner);
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
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/agent-verified-properties/${decodedToken.agentId}?sort=${sortOrder}`, // Corrected BACKEND_URL
            {
              headers: {
                token: token,
              },
            }
          );
          const data = response.data;
          console.log("Verified Requests:", data);
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
          className={`flex-1 text-center py-2 font-semibold ${
            activeTab === "guide"
              ? "text-blue-500 border-b-3 border-blue-500"
              : "text-white"
          }`}
        >
          Guide
        </button>
        <button
          onClick={() => setActiveTab("incoming_request")}
          className={`flex-1 text-center py-2 font-semibold ${
            activeTab === "incoming_request"
              ? "text-blue-500 border-b-3 border-blue-500"
              : "text-white"
          }`}
        >
          Request
        </button>
        <button
          onClick={() => setActiveTab("Verified")}
          className={`flex-1 text-center py-2 font-semibold ${
            activeTab === "Verified"
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
          <div className="mt-4 w-full sm:w-2/3 mx-auto flex justify-center items-center flex-col bg-gray-200">
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
                          Owner: {ownerData?.username || "Unknown"} ({ownerData?.mobile || "N/A"})
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          request.status === "pending"
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
              <h2 className="text-lg font-semibold text-gray-800">
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
              <div className="space-y-3">
                {verifiedRequests.map((request) => (
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
                          Mobile: {request.mobile || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          request.status === "DONE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-300 text-gray-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Verified On: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
