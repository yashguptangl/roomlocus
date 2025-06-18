"use client";
import { Suspense, useState } from "react";
import { SideDetail } from "../../../components/sidedetails";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import api from "../../../utils/api";
import Link from "next/link";

const verifySchema = z.object({
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    otp: z.string().min(6, "OTP must be at least 6 characters"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

// Wrapper with Suspense
export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Verify />
        </Suspense>
    );
}

function Verify() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [resendLoading, setResendLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
    });

    const onSubmit = async (data: VerifyFormValues) => {
        try {
            await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/verify-otp`, {
                mobile: data.mobile,
                otp: data.otp,
            });
            // --- Redirect logic start ---
            const redirect = searchParams.get("redirect");
            if (redirect) {
                router.push(`/user/signin?redirect=${encodeURIComponent(redirect)}`);
            } else {
                router.push("/user/signin");
            }
            // --- Redirect logic end ---
        } catch (error) {
            console.error("Error verifying:", axios.isAxiosError(error) && error.response?.data);
        }
    };

    const handleResendOTP = async (data: VerifyFormValues) => {
        try {
            setResendLoading(true);
            const response = await api.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/user/resend-otp`, {
                mobile: data.mobile,
            });
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
                <div className="w-full mb-2 lg:mb-0">
                    <SideDetail
                        title="Welcome to Roomlocus"
                        titleDetail="Get verified room"
                        word="Easy Way"
                    />
                </div>

                <div className="flex items-center justify-center px-4 w-full mt-6">
                    <div className="bg-white px-8 pb-24 pt-14 border border-gray-600 shadow-lg mb-32 rounded-lg w-full max-w-lg mod:w-[24rem] lg:max-w-sm lg:mt-5 lg:m-32">
                        <h2 className="font-semibold text-center mb-6">Enter Your Mobile Number</h2>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input
                                type="text"
                                placeholder="Mobile No"
                                className="w-full px-4 py-2 mt-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                                {...register("mobile")}
                            />
                            <p className="text-red-600 text-sm">{errors.mobile?.message}</p>
                            <input
                                type="text"
                                placeholder="OTP"
                                className="w-full px-4 py-2 mt-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                                {...register("otp")}
                            />
                            <p className="text-red-600 text-sm">{errors.otp?.message}</p>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-500 text-white mt-4 py-2 rounded font-semibold hover:bg-blue-400"
                            >
                                {isSubmitting ? "Verifying..." : "Verify"}
                            </button>

                            <div className="mt-6">
                                <p className="font-normal">
                                    Create an Account{" "}
                                    <Link
                                        href={
                                            searchParams.get("redirect")
                                                ? `/user/signup?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
                                                : "/user/signup"
                                        }
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
                                        className="text-blue-600 font-semibold ml-1 cursor-pointer hover:underline"
                                    >
                                        OTP
                                    </Link>
                                </p>
                                {resendLoading && <p className="text-gray-500 mt-2">Sending OTP...</p>}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}