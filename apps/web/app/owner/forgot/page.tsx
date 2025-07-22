"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { SideDetail } from "../../../components/sidedetails";

const verifySchema = z.object({
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters").optional(),
}).superRefine((data, ctx) => {
    if (data.password && data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Passwords don't match",
            path: ["confirmPassword"]
        });
    }
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function ForgotPassword() {
    const router = useRouter();
    const [resendLoading, setResendLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mobileNumber, setMobileNumber] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
    });

    // Request OTP
    const handleRequestOTP = async (data: Pick<VerifyFormValues, "mobile">) => {
        try {
            setIsSubmitting(true);
            clearErrors();
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/forgot-password`, {
                mobile: data.mobile,
            });
            setMobileNumber(data.mobile);
            setOtpSent(true);
            alert(response.data.message || "OTP has been sent to registered Whatsapp No. Please check Whatsapp!");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setError("mobile", { message: "Owner not found" });
                } else if (error.response?.status === 400) {
                    setError("mobile", { message: error.response?.data?.message || "Mobile number is required" });
                } else if (error.response?.status === 500) {
                    setError("mobile", { message: error.response?.data?.message || "Failed to send OTP" });
                } else {
                    setError("mobile", { message: error.response?.data?.message || "Error sending OTP" });
                }
            } else {
                setError("mobile", { message: "Error sending OTP" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset password
    const handleResetPassword = async (data: VerifyFormValues) => {
        try {
            setIsSubmitting(true);
            clearErrors();
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/reset-password`, {
                mobile: data.mobile,
                otp: data.otp,
                newPassword: data.password,
            });
            alert(response.data.message || "Password has been reset successfully.");
            router.push("/owner/signin");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setError("mobile", { message: "Owner not found" });
                } else if (error.response?.status === 400) {
                    setError("otp", { message: error.response?.data?.message || "Invalid OTP" });
                } else if (error.response?.status === 500) {
                    alert(error.response?.data?.message || "Failed to reset password. Please try again later.");
                } else {
                    alert(error.response?.data?.message || "Error resetting password");
                }
            } else {
                alert("Error resetting password");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        try {
            setResendLoading(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/resend-otp`, {
                mobile: mobileNumber,
            });
            alert(response.data.message || "OTP has been resent to registered Whatsapp No. Please check Whatsapp!");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setError("mobile", { message: "Owner not found" });
                } else if (error.response?.status === 400) {
                    setError("mobile", { message: error.response?.data?.message || "Mobile number is required" });
                } else if (error.response?.status === 500) {
                    alert(error.response?.data?.message || "Failed to resend OTP. Please try again later.");
                } else {
                    alert(error.response?.data?.message || "Error resending OTP");
                }
            } else {
                alert("Error resending OTP");
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row justify-center lg:justify-evenly py-3 mb-10">
            <div className="w-full mb-2 lg:mb-0">
                <SideDetail
                    title="Welcome to Roomlocus"
                    titleDetail="Owner Zone"
                    word="List Property"
                />
            </div>

            <div className="flex items-center justify-center px-4 w-full mt-6">
                <div className="bg-white px-8 pb-24 pt-14 border border-gray-600 shadow-lg mb-32 rounded-lg w-full max-w-lg mod:w-[24rem] lg:max-w-sm lg:mt-5 lg:m-32">
                    <h2 className="font-semibold text-2xl text-center mb-6">
                        {otpSent ? "Reset Your Password" : "Forgot Password"}
                    </h2>

                    <form onSubmit={handleSubmit(otpSent ? handleResetPassword : handleRequestOTP)}>
                        <div className="mb-4">
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                Whatsapp Number
                            </label>
                            <input
                                id="mobile"
                                type="text"
                                placeholder="Enter 10-digit Whatsapp number"
                                className="w-full px-4 py-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                                {...register("mobile")}
                                disabled={otpSent}
                            />
                            {errors.mobile && (
                                <p className="text-red-600 text-sm mt-1">{errors.mobile.message}</p>
                            )}
                        </div>

                        {otpSent && (
                            <>
                                <div className="mb-4">
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                        OTP
                                    </label>
                                    <input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full px-4 py-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                                        {...register("otp")}
                                    />
                                    {errors.otp && (
                                        <p className="text-red-600 text-sm mt-1">{errors.otp.message}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Enter new password (min 6 characters)"
                                        className="w-full px-4 py-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                                        {...register("password")}
                                    />
                                    {errors.password && (
                                        <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm new password"
                                        className="w-full px-4 py-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                                        {...register("confirmPassword")}
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-500 text-white mt-4 py-2 rounded font-semibold hover:bg-blue-400 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isSubmitting
                                ? otpSent
                                    ? "Resetting Password..."
                                    : "Sending OTP..."
                                : otpSent
                                    ? "Reset Password"
                                    : "Send OTP"}
                        </button>

                        {otpSent && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-600">
                                    Didn&apos;t receive OTP?{" "}
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={resendLoading}
                                        className="text-blue-500 font-semibold hover:underline focus:outline-none disabled:text-blue-400 disabled:cursor-not-allowed"
                                    >
                                        {resendLoading ? "Sending..." : "Resend OTP"}
                                    </button>
                                </p>
                            </div>
                        )}
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/owner/signin" className="text-blue-600 font-semibold hover:underline">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}