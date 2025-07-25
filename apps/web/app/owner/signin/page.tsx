"use client";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SideDetail } from "../../../components/sidedetails";
import { FaMobileAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { useRouter } from "next/navigation";


// Define validation schema using Zod
const loginSchema = z.object({
    mobile: z.string().regex(/^\d{10}$/, "Mob no must be 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginSignUp() {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });
    const router = useRouter();

    // Handle form submission
    const onSubmit = async (data: LoginFormValues) => {
        localStorage.clear();
        console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/login`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                }
            );

            if (response.status === 403) {
                // Redirect to verify page for unverified accounts
                router.push("/owner/verify");
                return; // Stop further execution
            }
            

            const { token } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("role" , "owner");

            alert("Login successful!");
            // Redirect to dashboard
            router.push("/owner/dashboard");
        } catch (error) {
            console.error("Error logging in:", error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    alert("Account not verified. Redirecting to verification page.");
                    router.push("/owner/verify");
                } else if (error.response?.status === 401) {
                    alert("Account not found. Redirecting to signup.");
                    router.push("/owner/signup");
                } else {
                    alert(error.response?.data?.message || "An error occurred. Please try again.");
                }
            } else {
                console.error("Unexpected error:", error);
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row justify-center lg:justify-evenly py-3 mb-32">
                {/* SideDetail component will be smaller on mobile and positioned above on small screens */}
                <div className="w-full mb-2 lg:mb-0">
                    <SideDetail
                        title="Welcome to Roomlocus"
                        titleDetail="Owner Zone"
                        word="List Property"
                    />
                </div>


                <div className="flex items-center justify-center px-4 w-full  ">
                    <div className="bg-white p-8 border border-gray-600 shadow-lg rounded w-full max-w-lg mod:w-[24rem] lg:max-w-sm mt-6 lg:mt-5 mb-24 lg:mb-32 ">
                        <h1 className="text-3xl text-black-300 font-normal text-center mb-6">Login & Signup</h1>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label htmlFor="mobile" className="block font-normal text-gray-700">Whatsapp No:</label>
                                <div className="relative">
                                    <FaMobileAlt className="absolute left-2 top-4  text-gray-700" />
                                    <input
                                        type="text"
                                        id="mobile"
                                        {...register("mobile")}
                                        placeholder="Number"
                                        className="w-full pl-8 p-2 border border-gray-600 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block font-normal text-gray-700 mt-4">Password:</label>
                                <div className="relative">
                                    <RiLockPasswordFill className="absolute left-2 top-4 text-gray-700" />
                                    <input
                                        type="password"
                                        id="password"
                                        {...register("password")}
                                        placeholder="Password"
                                        className="w-full pl-8 p-2 border border-gray-600 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2 mt-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded focus:outline-none"
                            >
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <Link href="/owner/forgot"><span className='font-normal'>Forgot</span> &nbsp;<span className='hover:underline text-blue-600 font-semibold'>Password</span></Link>
                        </div>
                        <div className="text-center mt-2">
                            <span className="font-normal">Create an Account &nbsp; </span>
                            <Link href="/owner/signup" className="hover:underline font-semibold text-blue-600">Sign Up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}