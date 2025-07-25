"use client";
import { useState, useEffect, Suspense } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

interface FormData {
  security?: string;
  maintenance?: string;
  offer?: string;
  minPrice?: string;
  maxPrice?: string;
  listingShowNo?: string;
  careTaker?: string;
  bedCount?: number;
  noOfGuests?: number;
  manager?: string;
  otp?: string;
}

function EditFormContent() {
  const [token, setToken] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [originalShowNo, setOriginalShowNo] = useState<string | undefined>();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingData, setPendingData] = useState<FormData | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<FormData>();
  const searchParams = useSearchParams();

  const listingType = searchParams.get("listingType");
  const listingId = searchParams.get("listingId");

  // Fetch current listing details for last update and original contact number
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setToken(token);

    if (listingId && listingType && token) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/get-listing?listingId=${listingId}&listingType=${listingType}`, {
        headers: { token }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.listing) {
            setLastUpdate(data.listing.updatedByOwner || data.listing.updatedAt || null);
            setOriginalShowNo(data.listing.listingShowNo);
            // Pre-fill form fields
            Object.keys(data.listing).forEach((key) => {
              setValue(key as keyof FormData, data.listing[key]);
            });
          }
        });
    }
  }, [listingId, listingType, setValue]);

  // Send OTP via backend
  const sendOtp = async (mobile: string) => {
    setSendingOtp(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing-no-check/preverify/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("OTP sent to your WhatsApp number.");
      } else {
        alert(data.message || "Failed to send OTP");
        setShowOtpModal(false);
      }
    } catch (err) {
      alert("Failed to send OTP");
      setShowOtpModal(false);
    }
    setSendingOtp(false);
  };

  // Verify OTP via backend
  const verifyOtp = async (mobile: string, otp: string) => {
    setVerifyingOtp(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing-no-check/preverify/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        return true;
      } else {
        alert(data.message || "Invalid OTP");
        return false;
      }
    } catch (err) {
      alert("Failed to verify OTP");
      return false;
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Main submit handler
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // If contact number is changed, require OTP
    if (data.listingShowNo && data.listingShowNo !== originalShowNo) {
      setPendingData(data);
      setShowOtpModal(true);
      await sendOtp(data.listingShowNo);
      return;
    }
    await updateListing(data);
  };

  // Update listing API call
  const updateListing = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/edit-listing`, {
        method: "PUT",
        headers: {
          token: token || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingType,
          listingId,
          data,
        }),
      });

      if (response.status === 200) {
        const result = await response.json();
        alert(
          "Listing updated successfully." +
            (result.lastUpdated
              ? "\nLast updated: " +
                new Date(result.lastUpdated).toLocaleString()
              : "")
        );
        router.push("/owner/dashboard");
      } else if (response.status === 403) {
        alert("You can only update listing once in 30 days");
        router.push("/owner/dashboard");
      } else {
        const result = await response.json();
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  // OTP modal submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingData || !pendingData.listingShowNo) return;
    const ok = await verifyOtp(pendingData.listingShowNo, otp);
    if (ok) {
      setShowOtpModal(false);
      await updateListing({ ...pendingData, otp });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-xl sm:text-3xl font-semibold text-blue-500 mb-4 text-center">
        Edit {listingType?.toString()} Details
      </h2>
      {lastUpdate && (
        <div className="text-center text-gray-600 mb-2">
          Last updated: {new Date(lastUpdate).toLocaleString()}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Conditional Fields based on listingType */}
        {listingType === "flat" && (
          <div className="flex flex-col gap-4 mt-4">
            {[
              { label: "Security", name: "security", type: "number" },
              { label: "Maintenance", name: "maintenance", type: "number" },
              { label: "Offer if any", name: "offer", type: "text" },
              { label: "Min Price Per Month", name: "minPrice", type: "number" },
              { label: "Max Price Per Month", name: "maxPrice", type: "number" },
              { label: "Contact Number", name: "listingShowNo", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="flex items-center gap-4">
                <label className="text-sm w-1/3 sm:text-xl">{label}</label>
                <input
                  {...register(name as keyof FormData)}
                  type={type}
                  className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                />
              </div>
            ))}
            <div className="flex items-center gap-4">
              <label className="text-sm w-1/3 sm:text-xl">Care Taker</label>
              <input
                {...register("careTaker")}
                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                placeholder="Name if any"
              />
            </div>
          </div>
        )}

        {listingType === "pg" && (
          <div className="flex flex-col gap-4 mt-4">
            {[
              { label: "Security", name: "security", type: "number" },
              { label: "Maintenance", name: "maintenance", type: "number" },
              { label: "Min Price Per Month", name: "minPrice", type: "number" },
              { label: "Max Price Per Month", name: "maxPrice", type: "number" },
              { label: "Offer if any", name: "offer", type: "text" },
              { label: "Bed Count", name: "bedCount", type: "number" },
              { label: "Contact Number", name: "listingShowNo", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="flex items-center gap-4">
                <label className="text-sm w-1/3 sm:text-xl">{label}</label>
                <input
                  {...register(name as keyof FormData)}
                  type={type}
                  className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                />
              </div>
            ))}
            <div className="flex items-center gap-4">
              <label className="text-sm w-1/3 sm:text-xl">Care Taker</label>
              <input
                {...register("careTaker")}
                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                placeholder="Name if any"
              />
            </div>
          </div>
        )}

        {listingType === "room" && (
          <div className="flex flex-col gap-4 mt-4">
            {[
              { label: "Security", name: "security", type: "number" },
              { label: "Maintenance", name: "maintenance", type: "number" },
              { label: "Min Price Per Month", name: "minPrice", type: "number" },
              { label: "Max Price Per Month", name: "maxPrice", type: "number" },
              { label: "Offer if any", name: "offer", type: "text" },
              { label: "Contact Number", name: "listingShowNo", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="flex items-center gap-4">
                <label className="text-sm w-1/3 sm:text-xl">{label}</label>
                <input
                  {...register(name as keyof FormData)}
                  type={type}
                  className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                />
              </div>
            ))}
            <div className="flex items-center gap-4">
              <label className="text-sm w-1/3 sm:text-xl">Care Taker</label>
              <input
                {...register("careTaker")}
                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                placeholder="Name if any"
              />
            </div>
          </div>
        )}

        {listingType === "hourlyroom" && (
          <div className="flex flex-col gap-4 mt-4">
            {[
              { label: "Min Price Per Night", name: "minPrice", type: "number" },
              { label: "Max Price Per Night", name: "maxPrice", type: "number" },
              { label: "Number of Guests", name: "noOfGuests", type: "number" },
              { label: "Manager Name", name: "manager", type: "text" },
              { label: "Manager Contact", name: "listingShowNo", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name} className="flex items-center gap-4">
                <label className="text-sm w-1/3 sm:text-xl">{label}</label>
                <input
                  {...register(name as keyof FormData)}
                  type={type}
                  className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-400 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form
            onSubmit={handleOtpSubmit}
            className="bg-white rounded-lg shadow-lg p-6 w-80 flex flex-col items-center relative"
          >
            <h2 className="text-xl font-semibold mb-2 text-center text-blue-600">OTP Verification</h2>
            <p className="text-gray-700 text-sm mb-4 text-center">
              Enter the OTP sent to your WhatsApp number.
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-400 rounded p-2 mb-4"
              placeholder="Enter OTP"
              maxLength={6}
              required
            />
            <button
              type="submit"
              disabled={verifyingOtp}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              {verifyingOtp ? "Verifying..." : "Verify & Update"}
            </button>
            <button
              type="button"
              disabled={sendingOtp}
              className="mt-2 text-blue-500 underline"
              onClick={() => pendingData?.listingShowNo && sendOtp(pendingData.listingShowNo)}
            >
              {sendingOtp ? "Resending..." : "Resend OTP"}
            </button>
            <button
              type="button"
              className="absolute top-2 right-4 text-gray-600 text-2xl"
              onClick={() => setShowOtpModal(false)}
            >
              ×
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Edit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditFormContent />
    </Suspense>
  );
}