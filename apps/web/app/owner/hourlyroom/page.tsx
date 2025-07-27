"use client";
import React, { useState, useEffect } from "react";
import ComboBox from "../../../components/searchBox";
import { citiesData } from "../../../data/cities";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FormData } from "../../../types/formData";
import Sample from "../../../assets/sample.jpg";
import Image from "next/image";

export default function RoomDayNightForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
  }, []);

  const handleTownChange = (town: string) => setSelectedTown(town);
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedTown("");
  };

  // Send OTP for listingShowNo
  const handleSendOtp = async () => {
    clearErrors("listingShowNo");
    setOtpError(null);
    setOtpVerified(false);
    const mobile = getValues("listingShowNo");
    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      setError("listingShowNo", { message: "Enter valid 10-digit contact number" });
      return;
    }
    setOtpLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing-no-check/preverify/send-otp`,
        { mobile }
      );
      setOtpSent(true);
      alert(response.data.message || "OTP sent successfully");
    } catch (error) {
      setOtpError("Failed to send OTP. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP for listingShowNo
  const handleVerifyOtp = async () => {
    clearErrors("listingOtp");
    setOtpError(null);
    const mobile = getValues("listingShowNo");
    const otp = getValues("listingOtp");
    if (!otp || otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      setError("listingOtp", { message: "Enter 4-digit OTP" });
      return;
    }
    setOtpLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/listing-no-check/preverify/verify-otp`,
        { mobile, otp }
      );
      setOtpVerified(true);
      alert(response.data.message || "Mobile verified successfully");
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        setOtpError(error.response.data?.message || "OTP verification failed");
      } else {
        setOtpError("OTP verification failed");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Prevent form submission if OTP not verified
  const onSubmit = async (data: FormData): Promise<void> => {
    if (!otpVerified) {
      setError("listingShowNo", { message: "Please verify contact number with OTP before submitting." });
      return;
    }
    try {
      const formData = {
        ...data,
        city: selectedCity,
        townSector: selectedTown,
        minprice: data.minprice ? parseInt(data.minprice.toString()) : undefined,
        maxprice: data.maxprice ? parseInt(data.maxprice.toString()) : undefined,
        bedcount: data.bedcount ? parseInt(data.bedcount.toString()) : undefined,
        noofGuests: data.noofGuests ? parseInt(data.noofGuests.toString()) : undefined,
        totalFloor: data.totalFloor ? parseInt(data.totalFloor.toString()) : undefined,
        totalRoom: data.totalRoom ? parseInt(data.totalRoom.toString()) : undefined,
        foodAvailable: data.foodAvailable === "Yes" ? true : false,
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/hourlyroom`,
        formData,
        {
          headers: {
            token: token || "",
          },
        }
      );
      if (response.status === 200) {
        localStorage.setItem("hourlyroomId", response.data.hourlyroom.id);
        router.push("/owner/hourlyroom/images");
      }
    } catch (error) {
      alert("Failed to list hourly Room. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-xl sm:text-3xl font-semibold text-blue-500 mb-2 text-center">
        I&apos;m listing my Hourly Room
      </h2>
      <h3 className="text-lg sm:text-2xl font-semibold">I&apos;m Owner</h3>
      <div className="flex justify-end mb-1 ">
        <button
          type="button"
          className="ssm:text-sm sm:text-base font-semibold text-blue-400 underline"
          onClick={() => setShowSample(true)}
        >
          Show listing Sample
        </button>
      </div>
      {showSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded shadow-lg p-4 relative max-w-xs sm:max-w-md">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
              onClick={() => setShowSample(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <Image src={Sample.src} alt="Sample Listing" className="max-w-full max-h-[70vh] rounded"
              height={500}
              width={500}
            />
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 mt-2">
          {/* City ComboBox */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            <label className="text-sm sm:text-xl">City</label>
            <ComboBox
              options={Object.keys(citiesData)}
              placeholder="City"
              onChange={handleCityChange}
            />
            {errors.city && <span className="text-red-500 text-sm">City is required</span>}
          </div>
          {/* Town & Sector ComboBox */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            <label className="text-sm sm:text-xl">Town & Sector</label>
            <ComboBox
              options={citiesData[selectedCity] || []}
              placeholder="Town & Sector"
              onChange={handleTownChange}
            />
            {errors.townSector && <span className="text-red-500 text-sm">Town & Sector is required</span>}
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-4">
          {[
            { label: "Area/Colony", name: "location", type: "text" },
            { label: "Landmark", name: "landmark", type: "text" },
            { label: "Min Price Per Night", name: "minprice", type: "number" },
            { label: "Max Price Per Night", name: "maxprice", type: "number" },
            { label: "Bedcount", name: "bedcount", type: "number" },
            { label: "No of Guest Allowed", name: "noofGuests", type: "number" },
            { label: "Total Floor", name: "totalFloor", type: "number" },
            { label: "Total Room", name: "totalRoom", type: "number" },
            { label: "Palace Name", name: "palaceName", type: "text" },
            { label: "Manager/Owner", name: "manager", type: "text" },
          ].map(({ label, name, type }) => (
            <div key={name} className="flex items-center gap-4">
              <label htmlFor={name} className="text-sm w-1/3 sm:text-xl">
                {label}
              </label>
              <input
                {...register(name as keyof FormData, { required: `${label} is required` })}
                id={name}
                type={type}
                name={name}
                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base placeholder-gray-500"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
              {errors[name as keyof FormData] && <span className="text-red-500 text-sm">{String(errors[name as keyof FormData]?.message)}</span>}
            </div>
          ))}
          <div className="flex items-center gap-2 flex-col justify-between ">
            <div className="flex items-center gap-4 w-full">
              <label htmlFor="listingShowNo" className="text-sm w-1/3 sm:text-xl">WhatsApp No</label>
              <input
                id="listingShowNo"
                {...register("listingShowNo", { required: "Whatsapp Number is required" })}
                name="listingShowNo"
                className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base placeholder-gray-500"
                placeholder="Enter Whatsapp number"
                maxLength={10}
                disabled={otpVerified}
                readOnly={otpVerified}
              />
            </div>

            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading || otpVerified}
                className="bg-blue-500 text-white px-2 py-1 text-xs rounded"
              >
                {otpLoading ? "Sending..." : otpVerified ? "Verified" : "Send OTP"}
              </button>
            </div>

          </div>
          {errors.listingShowNo && <span className="text-red-500 text-sm">{String(errors.listingShowNo?.message)}</span>}
          {otpSent && !otpVerified && (
            <div className="flex items-center justify-end gap-2 mt-2 flex-col">
              <div className="flex justify-end w-full">
                <input
                  type="text"
                  {...register("listingOtp", { required: "OTP is required" })}
                  name="listingOtp"
                  placeholder="Enter OTP"
                  maxLength={4}
                  className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base placeholder-gray-500"
                  disabled={otpVerified}
                  readOnly={otpVerified}
                />
              </div>
              <div className="flex justify-end w-full">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otpVerified}
                  className="bg-green-500 text-white px-1 py-0.5 text-sm rounded ml-2"
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>

            </div>
          )}
          {errors.listingOtp && <span className="text-red-500 text-sm">{String(errors.listingOtp?.message)}</span>}
          {otpError && <span className="text-red-500 text-sm">{otpError}</span>}
          {/* Luxury Type Select */}
          <div className="flex items-center gap-4">
            <label htmlFor="luxury" className="text-sm w-1/3 sm:text-xl">Luxury Type</label>
            <select
              id="luxury"
              {...register("luxury", { required: "Luxury is required" })}
              name="luxury"
              className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base text-gray-500 placeholder-gray-500"
            >
              <option value="" className="text-gray-500">Select Luxury Type</option>
              {["1 star", "2 star", "3 star", "4 star", "5 star", "6 star", "7 star"].map((luxury) => (
                <option key={luxury} value={luxury} className="text-black">
                  {luxury}
                </option>
              ))}
            </select>
            {errors.luxury && <span className="text-red-500 text-sm">{String(errors.luxury?.message)}</span>}
          </div>
          {/* Full Address Textarea */}
          <div className="flex items-center gap-4">
            <label className="text-sm w-1/3 sm:text-xl" htmlFor="adress">Full Address</label>
            <textarea
              id="adress"
              {...register("adress")}
              name="adress"
              className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-2 text-sm sm:text-base resize-none placeholder-gray-500"
              rows={4}
              placeholder="Enter full address"
            />
            {errors.adress && <span className="text-red-500 text-sm">{String(errors.adress?.message)}</span>}
          </div>
        </div>
        {/* Radio Buttons */}
        {[
          {
            title: "Furnishing Type *",
            options: ["Fully furnished", "Semi furnished", "Unfurnished"],
            name: "furnishingType",
          },
          {
            title: "Accomodation Type",
            options: ["Independent", "Apartment"],
            name: "accomoType",
          },
          {
            title: "Gender Preferences",
            options: ["Male", "Female", "Both M & F"],
            name: "genderPrefer",
          },
          {
            title: "Food Availability",
            options: ["Yes", "No"],
            name: "foodAvailable",
          },
          {
            title: "Room Type",
            options: ["Shared Room", "Private Room"],
            name: "roomType",
          },
          {
            title: "AC Type",
            options: ["AC", "Non AC"],
            name: "acType",
          }
        ].map(({ title, options, name }) => (
          <div key={name} className="mt-4">
            <p className="text-sm sm:text-xl">{title}</p>
            <div className="flex flex-col gap-2 mt-2 text-blue-400">
              {options.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm sm:text-base font-medium">
                  <input
                    {...register(name as keyof FormData, { required: `${title} is required` })}
                    type="radio"
                    name={name}
                    value={option}
                  />
                  {option}
                </label>
              ))}
            </div>
            {errors[name as keyof FormData] && <span className="text-red-500 text-sm">{String(errors[name as keyof FormData]?.message)}</span>}
          </div>
        ))}
        {/* Checkboxes */}
        {[
          {
            title: "Parking",
            options: ["Car", "Bike"],
            name: "parking",
            isMultiple: true,
          },
          {
            title: "Prefer Tenant Type",
            options: ["Family", "Bachelors", "Girls", "Boys", "Professionals"],
            name: "preferTenants",
            isMultiple: true,
          },
          {
            title: "Room Inside Facility",
            name: "insideFacilities",
            options: ["Single Bed", "Double Bed", "Almirah / Wardrobe", "Sofa", "Fan", "AC", "TV", "Attached Bathroom", "Geyser", "WiFi", "Gas / Induction", "Fridge", "Utensils", "Washing Machine", "RO Water"],
            isMultiple: true,
          },
          {
            title: "Room Outside Facility",
            name: "outsideFacilities",
            options: ["Bus Stop", "Metro Station", "Railway Station", "School", "College", "University", "Shopping Mall", "Market", "Hospital", "Bank ATM", "Park", "Gated Society", "Security Guard", "Gym", "CCTV Camera", "Tiffin/Mess Service", "Dhabas/Restaurants"],
            isMultiple: true,
          },
        ].map(({ title, options, name, isMultiple }) => (
          <div key={name} className="mt-4">
            <p className="text-sm sm:text-xl">{title}</p>
            <div className="flex flex-col gap-2 mt-2">
              {options.map((option) => (
                <div key={option} className="flex items-center gap-2 text-sm sm:text-base font-medium text-blue-400">
                  <input
                    {...register(name as keyof FormData)}
                    type={isMultiple ? "checkbox" : "radio"}
                    value={option}
                  />
                  {option}
                </div>
              ))}
            </div>
            {errors[name as keyof FormData] && (
              <span className="text-red-500 text-sm">{String(errors[name as keyof FormData]?.message)}</span>
            )}
          </div>
        ))}
        {/* Submit and Cancel buttons */}
        <div className="flex justify-center sm:justify-start gap-4 mt-6">
          <button
            disabled={isSubmitting}
            type="submit"
            className="bg-blue-400 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            {isSubmitting ? "Next..." : "Next"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/owner/dashboard")}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}