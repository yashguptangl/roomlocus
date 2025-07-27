"use client";
import { useState, Suspense, useEffect } from "react";
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
}

function EditFormContent() {
  const [token, setToken] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const router = useRouter();
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormData>();
  const searchParams = useSearchParams();

  const listingType = searchParams.get("listingType");
  const listingId = searchParams.get("listingId");

  // Set token on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  // Watch listingShowNo field
  const listingShowNo = watch("listingShowNo");

  // Send OTP via backend
  const sendOtp = async () => {
    setSendingOtp(true);
    setOtpError(null);
    setOtp("");
    setOtpVerified(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing-no-check/preverify/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: listingShowNo }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
      } else {
        setOtpError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setOtpError("Failed to send OTP");
    }
    setSendingOtp(false);
  };

  // Verify OTP via backend
  const verifyOtp = async () => {
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing-no-check/preverify/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: listingShowNo, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpVerified(true);
        setOtpError(null);
      } else {
        setOtpVerified(false);
        setOtpError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setOtpVerified(false);
      setOtpError("Failed to verify OTP");
    }
    setVerifyingOtp(false);
  };

  function mapToDbFields(data: any) {
    const mapping: Record<string, string> = {
      minPrice: "MinPrice",
      maxPrice: "MaxPrice",
      offer: "Offer",
      security: "security",
      maintenance: "maintenance",
      listingShowNo: "listingShowNo",
      careTaker: "careTaker",
      bedCount: "bedCount",
      noOfGuests: "noOfGuests",
      manager: "manager",
      // add more if needed
    };
    const mapped: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        mapped[mapping[key] || key] = value;
      }
    });
    return mapped;
  }

  function cleanFormData(data: FormData) {
    const cleaned: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (
        ["security", "maintenance", "minPrice", "maxPrice", "bedCount", "noOfGuests"].includes(key)
      ) {
        cleaned[key] = value === "" || value === undefined ? undefined : Number(value);
      } else {
        cleaned[key] = value === "" ? undefined : value;
      }
    });
    return cleaned;
  }

  // Main submit handler
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (listingShowNo && otpSent && !otpVerified) {
      setOtpError("Please verify your contact number with OTP before submitting.");
      return;
    }
    const cleanedData = cleanFormData(data);
    const mappedData = mapToDbFields(cleanedData);
    await updateListing(mappedData);
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
        alert("Listing updated successfully.");
        router.push("/owner/dashboard");
      } else if (response.status === 403) {
        alert("You can only update listing once in 30 days");
        router.push("/owner/dashboard");
      } else {
        const result = await response.json();
        alert(result.message || "Update failed");
      }
    } catch (error) {
      alert("Server error");
    }
  };

  // --- Field blocks for each listing type ---
  const flatFields = (
    <>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Security</label>
        <input
          {...register("security")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Security"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Maintenance</label>
        <input
          {...register("maintenance")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Maintenance"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Offer</label>
        <input
          {...register("offer")}
          type="text"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Offer"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Min Price Per Month</label>
        <input
          {...register("minPrice")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Min Price"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Max Price Per Month</label>
        <input
          {...register("maxPrice")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Max Price"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm w-1/3 sm:text-xl">Contact Number</label>
          <input
            {...register("listingShowNo")}
            type="text"
            className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
            placeholder="Contact Number"
            disabled={otpVerified}
            autoComplete="off"
            readOnly={otpVerified}
          />
        </div>
        <div className="flex justify-end w-full">
          <button
            type="button"
            className="ml-2 px-1 py-0.5 bg-blue-500 text-white rounded text-xs"
            disabled={sendingOtp || !listingShowNo || otpVerified}
            onClick={sendOtp}
          >
            {sendingOtp ? "Sending..." : otpSent && !otpVerified ? "Resend OTP" : "Send OTP"}
          </button>
        </div>
      </div>
      {otpSent && !otpVerified && (
        <div className="flex items-center justify-evenly gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
              placeholder="Enter OTP"
              maxLength={6}
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            className="ml-2 px-1 py-0.5 text-xs bg-green-600 text-white rounded"
            disabled={verifyingOtp || !otp}
            onClick={verifyOtp}
          >
            {verifyingOtp ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}
      {otpVerified && (
        <div className="text-green-600 text-sm mt-1">Number verified ✔</div>
      )}
      {otpError && (
        <div className="text-red-600 text-sm mt-1">{otpError}</div>
      )}
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Name</label>
        <input
          {...register("careTaker")}
          type="text"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Name"
        />
      </div>
    </>
  );
  // --- PG fields ---
  const pgFields = (
    <>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Security</label>
        <input
          {...register("security")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Security"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Maintenance</label>
        <input
          {...register("maintenance")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Maintenance"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Min Price Per Month</label>
        <input
          {...register("minPrice")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Min Price"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Max Price Per Month</label>
        <input
          {...register("maxPrice")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Max Price"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Offer</label>
        <input
          {...register("offer")}
          type="text"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Offer"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Bed Count</label>
        <input
          {...register("bedCount")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Bed Count"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm w-1/3 sm:text-xl">Contact Number</label>
          <input
            {...register("listingShowNo")}
            type="text"
            className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
            placeholder="Contact Number"
            disabled={otpVerified}
            autoComplete="off"
            readOnly={otpVerified}
          />
        </div>
        <div className="flex justify-end w-full">
          <button
            type="button"
            className="ml-2 px-1 py-0.5 bg-blue-500 text-white rounded text-xs"
            disabled={sendingOtp || !listingShowNo || otpVerified}
            onClick={sendOtp}
          >
            {sendingOtp ? "Sending..." : otpSent && !otpVerified ? "Resend OTP" : "Send OTP"}
          </button>
        </div>
      </div>
      {otpSent && !otpVerified && (
        <div className="flex items-center justify-evenly gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
              placeholder="Enter OTP"
              maxLength={6}
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            className="ml-2 px-1 py-0.5 text-xs bg-green-600 text-white rounded"
            disabled={verifyingOtp || !otp}
            onClick={verifyOtp}
          >
            {verifyingOtp ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}
      {otpVerified && (
        <div className="text-green-600 text-sm mt-1">Number verified ✔</div>
      )}
      {otpError && (
        <div className="text-red-600 text-sm mt-1">{otpError}</div>
      )}
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Name</label>
        <input
          {...register("careTaker")}
          type="text"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Name"
        />
      </div>
    </>
  );

  // --- Room fields ---
  const roomFields = (
    <>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Security</label>
        <input
          {...register("security")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Security"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Maintenance</label>
        <input
          {...register("maintenance")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Maintenance"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Min Price Per Month</label>
        <input
          {...register("minPrice")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Min Price"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Max Price Per Month</label>
        <input
          {...register("maxPrice")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Max Price"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Offer</label>
        <input
          {...register("offer")}
          type="text"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Offer"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm w-1/3 sm:text-xl">Contact Number</label>
          <input
            {...register("listingShowNo")}
            type="text"
            className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
            placeholder="Contact Number"
            disabled={otpVerified}
            autoComplete="off"
            readOnly={otpVerified}
          />
        </div>
        <div className="flex justify-end w-full">
          <button
            type="button"
            className="ml-2 px-1 py-0.5 bg-blue-500 text-white rounded text-xs"
            disabled={sendingOtp || !listingShowNo || otpVerified}
            onClick={sendOtp}
          >
            {sendingOtp ? "Sending..." : otpSent && !otpVerified ? "Resend OTP" : "Send OTP"}
          </button>
        </div>
      </div>
      {otpSent && !otpVerified && (
        <div className="flex items-center justify-evenly gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
              placeholder="Enter OTP"
              maxLength={6}
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            className="ml-2 px-1 py-0.5 text-xs bg-green-600 text-white rounded"
            disabled={verifyingOtp || !otp}
            onClick={verifyOtp}
          >
            {verifyingOtp ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}
      {otpVerified && (
        <div className="text-green-600 text-sm mt-1">Number verified ✔</div>
      )}
      {otpError && (
        <div className="text-red-600 text-sm mt-1">{otpError}</div>
      )}
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Name</label>
        <input
          {...register("careTaker")}
          type="text"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Name"
        />
      </div>
    </>
  );

  // --- Hourly Room fields ---
  const hourlyFields = (
    <>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Min Price Per Night</label>
        <input
          {...register("minPrice")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Min Price"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Max Price Per Night</label>
        <input
          {...register("maxPrice")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Max Price"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Number of Guests</label>
        <input
          {...register("noOfGuests")}
          type="number"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Guests"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm w-1/3 sm:text-xl">Manager Name</label>
        <input
          {...register("manager")}
          type="text"
          className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
          placeholder="Manager Name"
        />
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm w-1/3 sm:text-xl">Manager Contact</label>
          <input
            {...register("listingShowNo")}
            type="text"
            className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
            placeholder="Manager Contact"
            disabled={otpVerified}
            autoComplete="off"
            readOnly={otpVerified}
          />
        </div>
        <div className="flex justify-end w-full">
          <button
            type="button"
            className="ml-2 px-1 py-0.5 bg-blue-500 text-white rounded text-xs"
            disabled={sendingOtp || !listingShowNo || otpVerified}
            onClick={sendOtp}
          >
            {sendingOtp ? "Sending..." : otpSent && !otpVerified ? "Resend OTP" : "Send OTP"}
          </button>
        </div>
      </div>
      {otpSent && !otpVerified && (
        <div className="flex items-center justify-evenly gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-2/3 sm:w-[18rem] border border-gray-600 rounded p-1.5 placeholder-gray-500"
              placeholder="Enter OTP"
              maxLength={6}
              autoComplete="off"
            />
          </div>
          <button
            type="button"
            className="ml-2 px-1 py-0.5 text-xs bg-green-600 text-white rounded"
            disabled={verifyingOtp || !otp}
            onClick={verifyOtp}
          >
            {verifyingOtp ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}
      {otpVerified && (
        <div className="text-green-600 text-sm mt-1">Number verified ✔</div>
      )}
      {otpError && (
        <div className="text-red-600 text-sm mt-1">{otpError}</div>
      )}
    </>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-xl sm:text-3xl font-semibold text-blue-500 mb-4 text-center">
        Edit {listingType ? listingType.charAt(0).toUpperCase() + listingType.slice(1).toLowerCase() : " "} Details
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {listingType === "flat" && <div className="flex flex-col gap-4 mt-4">{flatFields}</div>}
        {listingType === "pg" && <div className="flex flex-col gap-4 mt-4">{pgFields}</div>}
        {listingType === "room" && <div className="flex flex-col gap-4 mt-4">{roomFields}</div>}
        {listingType === "hourlyroom" && <div className="flex flex-col gap-4 mt-4">{hourlyFields}</div>}

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={isSubmitting || (!!listingShowNo && otpSent && !otpVerified)}
            className="bg-blue-400 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense>
      <EditFormContent />
    </Suspense>
  );
}
