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
    getValues,
    formState: { isSubmitting, errors },
    setError,
    clearErrors,
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
  });
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const onSubmit = async (data: VerifyFormValues) => {
    clearErrors();
    setVerifyError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/verify-otp`,
        {
          mobile: data.mobile,
          otp: data.otp,
        }
      );
      router.push("/agent/signin");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setVerifyError(error.response.data?.message || "Invalid OTP or verification failed.");
      } else {
        setVerifyError("Error verifying OTP.");
      }
    }
  };

  const handleResendOTP = async () => {
    const mobile = getValues("mobile");
    if (!mobile || mobile.length !== 10) {
      setError("mobile", { message: "Enter valid mobile number before resending OTP." });
      return;
    }
    try {
      setResendLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/resend`,
        { mobile }
      );
      alert(response.data.message || "OTP sent successfully to registered Whatsapp No. Please check Whatsapp!");
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
        <div className="w-full mb-2 lg:mb-0">
          <SideDetail
            title="Welcome to Roomlocus"
            titleDetail="Agent Zone"
            word="Earning big."
          />
        </div>

        <div className="flex items-center justify-center px-4 w-full mt-6 max-w-lg mod:w-[24rem] lg:max-w-sm lg:mt-5 lg:m-32">
          <div className="bg-white px-8 pb-24 pt-14 border border-gray-600 shadow-lg mb-32 rounded-lg w-80">
            <h2 className="font-semibold text-center mb-6">
              Enter Your Whatsapp Number
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="text"
                placeholder="Whatsapp No"
                {...register("mobile")}
                className="w-full px-4 py-2 mb-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              />
              {errors.mobile && (
                <p className="text-red-600 text-sm mb-2">{errors.mobile.message}</p>
              )}
              <input
                type="text"
                placeholder="OTP"
                {...register("otp")}
                className="w-full px-4 py-2 mb-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              />
              {errors.otp && (
                <p className="text-red-600 text-sm mb-2">{errors.otp.message}</p>
              )}
              {verifyError && (
                <p className="text-red-600 text-sm mb-2">{verifyError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-400 text-white py-2 rounded font-semibold hover:bg-blue-500"
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </button>
            </form>
            <div className="mt-6 flex items-center flex-col text-sm">
              <p className="font-normal">
                Create an Account{" "}
                <Link
                  href="/agent/signup"
                  className="text-blue-600 font-semibold ml-1 cursor-pointer hover:underline"
                >
                  Sign Up
                </Link>
              </p>
              <p className="font-normal text-sm">
                Didn't receive OTP?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className={`text-blue-600 font-semibold ml-1 cursor-pointer hover:underline bg-transparent border-none p-0 ${resendLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={resendLoading}
                >
                  {resendLoading ? "Resending..." : "Resend OTP"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}