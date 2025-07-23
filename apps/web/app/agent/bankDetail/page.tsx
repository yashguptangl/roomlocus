"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

interface BankDetailsFormValues {
  bankName: string;
  accountHolderName: string;
  upi: string;
  confirmUpi: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  confirmIfscCode: string;
}

export default function BankDetails() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<BankDetailsFormValues>();
  const [token, setToken] = useState("");
  const [agentId, setAgentId] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedAgentId = localStorage.getItem("agentId");
    if (storedToken) setToken(storedToken);
    if (storedAgentId) setAgentId(storedAgentId);
  }, []);

  const onSubmit = async (data: BankDetailsFormValues) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/bank-details`, {
        method: "POST",
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId, data }),
      });
      if (response.status === 200) {
        router.push("/agent/dashboard");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-center text-blue-500">Bank Details</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          {/* Bank Name */}
          <div>
            <label className="block font-normal">Bank Name</label>
            <input
              {...register("bankName", { required: "Bank Name is required" })}
              placeholder="Enter your bank name"
              className="border p-2 w-full rounded border-gray-600 placeholder-gray-500"
            />
            {errors.bankName?.message && <span className="text-red-500">{String(errors.bankName.message)}</span>}
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block font-normal">Account Holder Name</label>
            <input
              {...register("accountHolderName", { required: "Account Holder Name is required" })}
              placeholder="Enter account holder name"
              className="border p-2 w-full rounded border-gray-600 placeholder-gray-500"
            />
            {errors.accountHolderName && <span className="text-red-500">{String(errors.accountHolderName.message)}</span>}
          </div>

          {/* UPI ID */}
          <div>
            <label className="block font-normal">UPI ID</label>
            <input
              {...register("upi", {
                required: "UPI ID is required",
                pattern: {
                  value: /^[\w.-]+@[\w.-]+$/,
                  message: "Invalid UPI ID format",
                },
              })}
              placeholder="Enter UPI ID"
              className="border p-2 w-full rounded border-gray-600 placeholder-gray-500"
            />
            {errors.upi && <span className="text-red-500">{String(errors.upi.message)}</span>}
          </div>
          <div>
            <label className="block font-normal">Confirm UPI ID</label>
            <input
              {...register("confirmUpi", {
                required: "Confirm UPI ID is required",
                validate: (value) => value === watch("upi") || "UPI IDs do not match",
              })}
              placeholder="Re-enter UPI ID"
              className="border p-2 w-full rounded border-gray-600 placeholder-gray-500"
            />
            {errors.confirmUpi && <span className="text-red-500">{String(errors.confirmUpi.message)}</span>}
          </div>

          {/* Account Number */}
          <div>
            <label className="block font-normal">Account Number</label>
            <input
              {...register("accountNumber", {
                required: "Account Number is required",
              })}
              type="number"
              placeholder="Enter account number"
              className="border p-2 w-full rounded border-gray-600 placeholder-gray-500"
            />
            {errors.accountNumber && <span className="text-red-500">{String(errors.accountNumber.message)}</span>}
          </div>
          <div>
            <label className="block font-normal">Confirm Account Number</label>
            <input
              {...register("confirmAccountNumber", {
                required: "Confirm Account Number is required",
                validate: (value) => value === watch("accountNumber") || "Account numbers do not match",
              })}
              type="number"
              placeholder="Re-enter account number"
              className="border p-2 w-full rounded border-gray-600 placeholder-gray-500"
            />
            {errors.confirmAccountNumber && <span className="text-red-500">{String(errors.confirmAccountNumber.message)}</span>}
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block font-normal">IFSC Code</label>
            <input
              {...register("ifscCode", {
                required: "IFSC Code is required",
                pattern: {
                  value: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                  message: "Invalid IFSC Code format",
                },
              })}
              placeholder="Enter IFSC Code"
              className="border p-2 w-full rounded  border-gray-600 placeholder-gray-500"
            />
            {errors.ifscCode && <span className="text-red-500">{String(errors.ifscCode.message)}</span>}
          </div>
          <div>
            <label className="block font-normal">Confirm IFSC Code</label>
            <input
              {...register("confirmIfscCode", {
                required: "Confirm IFSC Code is required",
                validate: (value) => value === watch("ifscCode") || "IFSC codes do not match",
              })}
              placeholder="Re-enter IFSC Code"
              className="border p-2 w-full rounded  border-gray-600 placeholder-gray-500"
            />
            {errors.confirmIfscCode && <span className="text-red-500">{String(errors.confirmIfscCode.message)}</span>}
          </div>

          {/* Submit Button */}
          <button
            disabled={isSubmitting}
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}