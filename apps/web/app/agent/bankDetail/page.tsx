"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

interface BankDetailsFormValues {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
}

export default function BankDetails() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BankDetailsFormValues>();
  const [token, setToken] = useState("");
  const [agentId, setAgentId] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedAgentId = localStorage.getItem("agentId");
    if (storedToken) setToken(storedToken);
    if (storedAgentId) setAgentId(storedAgentId);
  }, []); // Ensure this runs only on the client side

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

            {/* Confirm Account Number */}
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
                pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: "Invalid IFSC Code format" },
              })}
              placeholder="Enter IFSC Code"
              className="border p-2 w-full rounded uppercase border-gray-600 placeholder-gray-500"
            />
            {errors.ifscCode && <span className="text-red-500">{String(errors.ifscCode.message)}</span>}
          </div>

          {/* Submit Button */}
          <button 
          onClick={handleSubmit(onSubmit)}
           
          type="submit" className="bg-blue-500 text-white p-2 rounded">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
