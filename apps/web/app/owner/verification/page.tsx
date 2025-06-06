"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const VerificationPage = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [existingRequest, setExistingRequest] = useState<VerificationRequest | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    } else {
      router.push("/owner/signin");
    }
  }, [router]); // Added 'router' to the dependency array

 return (
  <Suspense fallback={<div>Loading...</div>}>
    {token ? (
      <Content token={token} existingRequest={existingRequest} setExistingRequest={setExistingRequest} />
    ) : null}
  </Suspense>
);
};

interface VerificationRequest {
  id: string;
  status: string;
  verificationType: "SELF" | "AGENT";
  agentId?: string;
}

function Content({
  token,
  existingRequest,
  setExistingRequest,
}: {
  token: string;
  existingRequest: VerificationRequest | null;
  setExistingRequest: React.Dispatch<React.SetStateAction<VerificationRequest | null>>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<"self" | "agent" | null>(null);
  const [agentId, setAgentId] = useState("");

  const listingId = searchParams.get("listingId");
  const listingType = searchParams.get("listingType");
  const listingShowNo = searchParams.get("listingShowNo");
  const city = searchParams.get("city");
  const townSector = searchParams.get("townSector");
  const location = searchParams.get("location");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/self/verified-requests?listingId=${listingId}&listingType=${listingType}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
               token: token,
            },
          }
        );
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const verificationRequest = data[0];
          setExistingRequest(verificationRequest);

          if (
            verificationRequest.status === "PENDING" &&
            verificationRequest.verificationType === "SELF"
          ) {
            if (!verificationRequest.imagesUploaded) {
              router.push(`/owner/selfverification?id=${listingId}&listingType=${listingType}&listingShowNo=${listingShowNo}&city=${city}&townSector=${townSector}&location=${location}`);
            } else {
              alert("Property is verified within 4 - 5 working days");
              router.push(`/owner/dashboard`);
            }
          }
          else if (verificationRequest.status === "PENDING" && verificationRequest.verificationType === "AGENT") {
            setSelectedOption("agent");
            setAgentId(verificationRequest.agentId || "");
          }
          else if (verificationRequest.status === "DONE") {
            alert("Property is verified");
            router.push(`/owner/dashboard`);
          }
        }

      } catch (error) {
        console.log("Error during verification request:", error);
        alert("An error occurred while fetching the verification request. Please try again.");
      }
    };
    fetchData();
  }, [router, searchParams, listingId, listingType, token, setExistingRequest]); // Added 'setExistingRequest' to the dependency array

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value as "self" | "agent");
  };
  const handleSubmit = async () => {
    if (!selectedOption) {
      alert("Please select a verification option");
      return;
    }

    if (existingRequest) {
      // Update existing verification request
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/self/owner-update-verification/${existingRequest.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token: token,
          },
          body: JSON.stringify({
            newAgentId: selectedOption === 'agent' ? agentId : null,
            verificationType: selectedOption === 'self' ? 'SELF' : 'AGENT'
          }),
        });

        if (response.ok) {
          const message = selectedOption === 'self'
            ? 'Switched to self-verification successfully'
            : 'Agent verification updated successfully';
          alert(message);
          if (selectedOption === 'self') {
            router.push(`/owner/selfverification?id=${listingId}&listingType=${listingType}&listingShowNo=${listingShowNo}&city=${city}&townSector=${townSector}&location=${location}`);
          } else {
            router.push('/owner/dashboard');
          }
        } else {
          const errorData = await response.json();
          console.log('Error updating verification request:', errorData);
          alert('Failed to update verification request. Please try again.');
        }
      } catch (error) {
        console.error('Error during verification update:', error);
        alert('An error occurred while updating the verification request. Please try again.');
      }
    } else {
      // Create new verification request
      if (selectedOption === 'self') {
        router.push(`/owner/selfverification?id=${listingId}&listingType=${listingType}&listingShowNo=${listingShowNo}&city=${city}&townSector=${townSector}&location=${location}`);
      } else if (selectedOption === 'agent' && agentId) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/verification-request`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              token: token,
            },
            body: JSON.stringify({
              listingId,
              listingType,
              agentId,
              city,
              townSector,
              location,
              listingShowNo,
            }),
          });

          if (response.ok) {
            alert('Verification request sent successfully.');
            router.push('/owner/dashboard');
          } else {
            const errorData = await response.json();
            console.log('Error creating verification request:', errorData);
            alert('Please enter a valid Agent ID and all words are in capital letters e.g : RL97XXXXXXXX ');
          }
        } catch (error) {
          console.error('Error during verification request:', error);
          alert('An error occurred while sending the verification request. Please try again.');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="bg-white p-6 sm:p-8 md:p-10 lg:p-12 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mt-8">
        <h1 className="text-2xl sm:text-3xl font-normal text-center text-gray-800 mb-4 sm:mb-6">
          {existingRequest ? "Update Verification" : "Verification Process"}
        </h1>

        {/* Radio Buttons for Verification Options */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <label className="flex items-center space-x-2 sm:space-x-3">
            <input
              type="radio"
              value="self"
              checked={selectedOption === "self"}
              onChange={handleOptionChange}
              className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
            />
            <span className="text-gray-700 text-sm sm:text-base">
              {existingRequest ? "Switch to Self Verification" : "Self Verification"}
            </span>
          </label>
          <label className="flex items-center space-x-2 sm:space-x-3">
            <input
              type="radio"
              value="agent"
              checked={selectedOption === "agent"}
              onChange={handleOptionChange}
              className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-blue-600"
            />
            <span className="text-gray-700 text-sm sm:text-base">
              {existingRequest ? "Change Agent Verification" : "Agent Verification"}
            </span>
          </label>
        </div>

        {/* Agent ID Input (Visible only if Agent Verification is selected) */}
        {selectedOption === "agent" && (
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-700 text-sm sm:text-base mb-1 sm:mb-2">
              {existingRequest ? "Enter New Agent ID:" : "Enter Agent ID:"}
            </label>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                autoFocus
                placeholder={existingRequest ? existingRequest.agentId : ""}
              />

            </div>
            {existingRequest && (
              <p className="text-xs text-gray-500 mt-1">
                Current Agent ID: {existingRequest.agentId}
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-2 sm:py-3 bg-blue-500 text-white text-sm sm:text-base rounded-lg hover:bg-blue-600 transition duration-200"
          disabled={selectedOption === "agent" && !agentId}
        >
          {existingRequest ? "Update Verification" : (selectedOption === "self" ? "Next" : "Done")}
        </button>

        {/* Benefits of Agent Verification */}
        {(!selectedOption || selectedOption === "agent") && (
          <div className="mt-6 sm:mt-8">
            <h2 className="text-base sm:text-xl font-normal text-gray-800 mb-3 sm:mb-4">Benefits of Agent Verification</h2>
            <ul className="list-disc pl-4 sm:pl-6 text-gray-600 text-sm sm:text-base space-y-1 sm:space-y-2">
              <li>Faster processing of requests.</li>
              <li>Access to exclusive features.</li>
              <li>Dedicated support for agents.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificationPage;