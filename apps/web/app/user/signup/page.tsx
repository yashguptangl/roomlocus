"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SideDetail } from "../../../components/sidedetails";
import axios from "axios";
import { useRouter } from "next/navigation";

// Zod schema for validation
const signupSchema = z
  .object({
    username: z.string().min(4, "Username must be at least 4 characters"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      console.log("Data being sent to API:", data); // Logs the form data
      const response = await axios.post(`${process.env.BACKEND_URL}/v1/user/signup`, {

        username: data.username,
        mobile: data.mobile,
        email: data.email,
        password: data.password,
      });

      console.log("Signup successful:", response.data); // Logs the response from the server
      router.push("/user/verify");
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            alert(error.response.data?.message || "Error resending OTP.");
        } else {
            alert("An error occurred during signup.");
        }
    }
  };

  
  return (
    <div className="flex flex-col lg:flex-row justify-center lg:justify-evenly py-3">
      <div className="w-full mb-2 lg:mb-0">
        <SideDetail
          title="Welcome to Roomlocus"
          titleDetail="Get verified room"
          word="Easy Way"
        />
      </div>

      <div className="flex items-center justify-center px-4 w-full">
        <div className="bg-white p-8 border border-gray-600 rounded w-full max-w-lg md:w-[24rem] lg:max-w-sm mt-6 lg:mt-5 mb-24 lg:mb-32">
          <h2 className="text-3xl font-normal text-black-300 text-center mb-6">
            Signup
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="Name"
              {...register("username")}
              className="w-full px-4 py-2 mt-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
            <p className="text-red-600 text-sm">{errors.username?.message}</p>

            <input
              type="text"
              placeholder="Mobile Number"
              {...register("mobile")}
              className="w-full px-4 py-2 mt-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
            <p className="text-red-600 text-sm">{errors.mobile?.message}</p>

            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full px-4 py-2 mt-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
            <p className="text-red-600 text-sm">{errors.email?.message}</p>

            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full px-4 py-2 mt-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
            <p className="text-red-600 text-sm">{errors.password?.message}</p>

            <input
              type="password"
              placeholder="Confirm Password"
              {...register("confirmPassword")}
              className="w-full px-4 py-2 mt-4 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
            <p className="text-red-600 text-sm">
              {errors.confirmPassword?.message}
            </p>

            <button
              type="submit"
              className="w-full bg-blue-500 mt-4 text-white py-2 rounded font-semibold focus:outline-none hover:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>

            <div className="mt-4 text-center">
              <p className="font-normal">
                Forgot{" "}
                <span className="text-blue-600 font-semibold ml-3 cursor-pointer hover:underline">
                  Username/Password
                </span>
              </p>
              <p className="font-normal">
                Already a User?{" "}
                <Link
                  href="/user/signin"
                  className="text-blue-600 font-semibold ml-3 cursor-pointer hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}