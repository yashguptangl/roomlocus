"use client";
import React, { useState, useEffect } from "react";
import ComboBox from "../../../components/searchBox";
import { citiesData } from "../../../data/cities";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FormData } from "../../../types/formData";
import Sample from "../../../assets/sample.jpg"
import Image from "next/image"; 


export default function FlatListingForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [showSample, setShowSample] = useState(false);



  const handleTownChange = (town: React.SetStateAction<string>) => {
    setSelectedTown(town);
  };

  const handleCityChange = (city: React.SetStateAction<string>) => {
    setSelectedCity(city);
    setSelectedTown(""); // Reset town/sector when city changes
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    console.log(token?.toString());
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const formData = {
        ...data,
        city: selectedCity,
        townSector: selectedTown,
        minprice: data.minprice ? Number(data.minprice) : undefined,
        maxprice: data.maxprice ? Number(data.maxprice) : undefined,
        security: data.security ? Number(data.security) : undefined,
        maintenance: data.maintenance ? Number(data.maintenance) : undefined,
        totalFlat: data.totalFlat ? Number(data.totalFlat) : undefined,
        totalFloor: data.totalFloor ? Number(data.totalFloor) : undefined,
        waterSupply: data.waterSupply ? Number(data.waterSupply) : undefined,
        powerBackup: data.powerBackup ? Number(data.powerBackup) : undefined,
        listingShowNo: data.listingShowNo ? Number(data.listingShowNo) : undefined,
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/owner/flat`,
        formData,
        {
          headers: {
            token: token || "",
          },
        }
      );
      console.log(response);
      if (response.status === 201) {
        localStorage.setItem("flatId", response.data.flat.id);
        router.push("/owner/flat/[images]");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to list flat. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
      <h2 className="text-xl sm:text-3xl font-semibold text-blue-500 mb-2 text-center">
        I&apos;m listing my Flat
      </h2>
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
    {/* Location and Details */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 mt-2">
          {/* City ComboBox */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            <label className="text-sm sm:text-xl">City</label>
            <ComboBox
              options={Object.keys(citiesData)} // City options from citiesData (keys)
              placeholder="City"
              onChange={handleCityChange}
            />
            {errors.city && <span className="text-red-500 text-sm">City is required</span>}
          </div>

          {/* Town & Sector ComboBox */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
            <label className="text-sm sm:text-xl">Town & Sector</label>
            <ComboBox
              options={selectedCity && citiesData[selectedCity] ? citiesData[selectedCity] : []} // Filtered town/sector options based on selected city
              placeholder="Town & Sector"
              onChange={handleTownChange}
            />
            {errors.townSector && <span className="text-red-500 text-sm">Town & Sector is required</span>}
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {[
            { label: "Area/Colony", name: "location", type: "text" },   // Area/Colony
            { label: "Landmark", name: "landmark", type: "text" },
            { label: "Min Price Per Month", name: "minprice", type: "number" },
            { label: "Max Price Per Month", name: "maxprice", type: "number" },
            { label: "Security", name: "security", type: "number" },
            { label: "Maintenance", name: "maintenance", type: "number" },
            { label: "Total Floor", name: "totalFloor", type: "number" },
            { label: "Total Flat", name: "totalFlat", type: "number" },
            { label: "Water Supply in Hours", name: "waterSupply", type: "number" },
            { label: "Power Backup in Hours", name: "powerBackup", type: "number" },
            { label: "Notice Period", name: "noticePeriod", type: "text" },
            { label: "Offer if any", name: "offer", type: "text" },
            { label: "Contact Number", name: "listingShowNo", type: "number" },
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
          <div className="flex items-center gap-4">
            <label htmlFor="careTaker" className="text-sm w-1/3 sm:text-xl">Contact Name</label>
            <input
              id="careTaker"
              {...register("careTaker", { required: "Contact Name is required" })}
              name="careTaker"
              className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base resize-none placeholder-gray-500"
              placeholder="Contact Name"
            />
            {errors.careTaker && <span className="text-red-500 text-sm">{String(errors.careTaker?.message)}</span>}
          </div>

          {/* BHK Select */}
          <div className="flex items-center gap-4">
            <label htmlFor="Bhk" className="text-sm w-1/3 sm:text-xl">BHK</label>
            <select
              id="Bhk"
              {...register("Bhk", { required: "BHK is required" })}
              name="Bhk"
              className="w-2/3 sm:w-[24rem] border border-gray-600 rounded p-1.5 text-sm sm:text-base text-gray-500 placeholder-gray-500"
            >
              <option value="" className="text-gray-500">Select BHK</option>
              {[1, 2, 3, 4, 5].map((bhk) => (
                <option key={bhk} value={bhk} className="text-black">
                  {bhk} BHK
                </option>
              ))}
            </select>
            {errors.Bhk && <span className="text-red-500 text-sm">{String(errors.Bhk?.message)}</span>}
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
          { title: "Pets Allowed", options: ["Yes", "No"], name: "petsAllowed" },
          {
            title: "Gender Preferences",
            options: ["Male", "Female", "Both M & F"],
            name: "genderPrefer",
          },
          {
            title: "Flat Type",
            options: ["Shared Room", "Private Room"],
            name: "flatType",
          },
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
            title: "Flat Inside Facility",
            name: "insideFacilities",
            options: ["Single Bed", "Double Bed", "Almirah / Wardrobe", "Sofa", "Fan", "AC", "TV", "Attached Bathroom", "Geyser", "WiFi", "Gas / Induction", "Fridge", "Utensils", "Washing Machine", "RO Water"],
            isMultiple: true,
          },
          {
            title: "Flat Outside Facility",
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
                    type={isMultiple ? "checkbox" : "radio"} // Adjust type for multiple selections
                    value={option}
                  />
                  {option}
                </div>
              ))}
            </div>
            {errors[name as keyof FormData] && <span className="text-red-500 text-sm">{String(errors[name as keyof FormData]?.message)}</span>}
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