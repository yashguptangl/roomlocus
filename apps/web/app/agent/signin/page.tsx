"use client";
import { SideDetail } from "../../../components/sidedetails";
import { FaMobileAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  mobile: z.string().regex(/^\d{10}$/, "Mob no must be 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginSignup() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors , isSubmitting},
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/login`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 403) {
        // Redirect to verify page for unverified accounts
        router.push("/agent/verify");
        return; // Stop further execution
      }
  
      const { token } = response.data;
  
      // Store the JWT token in local storage
      localStorage.setItem("token", token);
      localStorage.setItem("role", "agent");
      alert("Login successful!");
  
      router.push("/agent/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
  
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        alert("Please Verify Your Mobile No.");
        router.push("/agent/verify");
      } else if ( axios.isAxiosError(error) && error.response?.status === 401) {
        alert("Account not found. Redirecting to signup.");
        router.push("/agent/signup");
      } else {
        alert( axios.isAxiosError(error) && error.response?.data?.message || "An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center lg:justify-evenly py-3 mb-12">
      <div className="w-full mb-2 lg:mb-0">
        <SideDetail title="Welcome to Roomlocus" titleDetail="Agent Zone" word="Earning big." />
      </div>

      <div className="flex items-center justify-center px-4 w-full">
        <div className="bg-white p-8 border border-gray-600 shadow-lg rounded w-full max-w-lg mod:w-[24rem] lg:max-w-sm mt-6 lg:mt-5 mb-24 lg:mb-32">
          <h1 className="text-3xl text-black-300 font-normal text-center mb-6">Login & Signup</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="mobile" className="block font-normal text-gray-700">Whatsapp No:</label>
              <div className="relative">
                <FaMobileAlt className="absolute left-2 top-4 text-gray-700" />
                <input
                  type="text"
                  id="mobile"
                  placeholder="Number"
                  {...register("mobile")}
                  className={`w-full pl-8 p-2 border border-gray-600 rounded mt-1 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block font-normal text-gray-700 mt-4">Password:</label>
              <div className="relative">
                <RiLockPasswordFill className="absolute left-2 top-4 text-gray-700" />
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  {...register("password")}
                  className={`w-full pl-8 p-2 border border-gray-600 rounded mt-1 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="w-full py-2 mt-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-400 focus:outline-none">
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-4">
              <span className="font-normal">Forgot</span> &nbsp;
              <Link href="/agent/forgot">
              <span className="hover:underline text-blue-600 font-semibold">Password</span>
            </Link>
          </div>
          <div className="text-center mt-2">
            <span className="font-normal">Create an Account &nbsp; </span>
            <Link href="/agent/signup" className="hover:underline font-semibold text-blue-600">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}