"use client";
import { useState } from "react";
import { SideDetail } from "../../../components/sidedetails";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const verifySchema = z.object({
  mobile: z.string().regex(/^\d{10}$/, "Mob no must be 10 digits"),
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function Verify() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });
  const [resendLoading, setResendLoading] = useState(false);

  const onSubmit = async (data: VerifyFormValues) => {
    try {
      console.log("Data being sent to API:", data);
      const response = await axios.post(
        `${process.env.BACKEND_URL}/v1/owner/verify-otp`,

        {
          mobile: data.mobile,
          otp: data.otp,
        }
      );
      console.log("Verification successful:", response.data);
      router.push("/owner/signin");
    } catch (error) {
      console.error("Error verifying:", axios.isAxiosError(error) && error.response?.data);
    }
  };

  const handleResendOTP = async (data: VerifyFormValues) => {
    try {
      setResendLoading(true);
      const response = await axios.post(
        `${process.env.BACKEND_URL}/v1/owner/resend-otp`,
        {
          mobile: data.mobile,
        }
      );
      alert(response.data.message || "OTP sent successfully!");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data?.message || "Error resending OTP.");
      } else {
        alert("Error resending OTP.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-center lg:justify-evenly py-3">
        {/* SideDetail component will be smaller on mobile and positioned above on small screens */}
        <div className="w-full mb-2 lg:mb-0">
          <SideDetail
            title="Welcome to Roomlocus"
            titleDetail="Owner Zone"
            word="List Property"
          />
        </div>

        <div className="flex items-center justify-center px-4 w-full mt-6 max-w-lg mod:w-[24rem] lg:max-w-sm lg:mt-5 lg:m-32">
          <div className="bg-white px-8 pb-24 pt-14 border border-gray-600 shadow-lg mb-32 rounded-lg w-80">
            <h2 className="font-semibold text-center mb-6">
              Enter Your Mobile Number
            </h2>

            <form>
              <input
                type="text"
                placeholder="Mobile No"
                {...register("mobile")}
                className="w-full px-4 py-2 mb-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              />
              <input
                type="text"
                placeholder="OTP"
                {...register("otp")}
                className="w-full px-4 py-2 mb-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              />

              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="w-full bg-blue-400 text-white py-2 rounded font-semibold hover:bg-blue-500"
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </button>

              <div className="mt-6">
                <p className="font-normal">
                  Create an Account{" "}
                  <Link
                    href="/owner/signup"
                    className="text-blue-600 font-semibold ml-1 cursor-pointer hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
                <p className="font-normal">
                  Resend{" "}
                  <Link
                    href="#"
                    onClick={handleSubmit(handleResendOTP)}
                    className={`text-blue-600 font-semibold ml-1 cursor-pointer hover:underline ${resendLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    OTP
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}