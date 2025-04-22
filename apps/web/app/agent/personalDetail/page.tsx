"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

interface PersonalDetailsFormValues {
  name: string;
  fatherName: string;
  address: string;
  city: string;
  policeStation: string;
  pinCode: string;
  dob: string;
  aadhar: string;
  pan: string;
  workAddress: string;
  workCity: string;
  qualification: string;
  employmentType: string;
}

export default function PersonalDetails() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDetailsFormValues>();
  const [isAbove18, setIsAbove18] = useState(false);
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []); // Ensure this runs only on the client side

  const onSubmit = async (data: PersonalDetailsFormValues) => {
    setSubmitting(true);
    try {
      const agentId = localStorage.getItem("agentId");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/agent/details`, {
        method: "POST",
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data, agentId }),
      });

      if (response.status === 200) {
        router.push("/agent/uploadAgentDoc");
      } else {
        console.log("Failed to submit personal details");
      }
    } catch (error) {
      console.log("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-center text-blue-500">
        Personal Details
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {[
          { label: "Name as per Aadhar", name: "name", type: "text" },
          { label: "Father's Name", name: "fatherName", type: "text" },
          {
            label: "Full Address as per Aadhar",
            name: "address",
            type: "textarea",
          },
          { label: "City", name: "city", type: "text" },
          { label: "Police Station", name: "policeStation", type: "text" },
          { label: "Pin Code", name: "pinCode", type: "text" },
          { label: "Date of Birth", name: "dob", type: "date" },
          { label: "Aadhar Number", name: "aadhar", type: "text" },
          { label: "PAN Number", name: "pan", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name} className="flex flex-col gap-1">
            <label htmlFor={name} className="text-sm font-normal">
              {label}
            </label>
            {type === "textarea" ? (
              <textarea
                {...register(name as keyof PersonalDetailsFormValues, { required: `${label} is required` })}
                id={name}
                className="border p-2 border-gray-600 rounded placeholder-gray-500"
                placeholder={label}
              />
            ) : (
              <input
                {...register(name as keyof PersonalDetailsFormValues, { required: `${label} is required` })}
                id={name}
                type={type}
                className="border p-2 border-gray-600 rounded placeholder-gray-500"
                placeholder={label}
              />
            )}
            {errors[name as keyof PersonalDetailsFormValues]?.message && (
              <span className="text-red-500 text-sm">
                {String(errors[name as keyof PersonalDetailsFormValues]?.message)}
              </span>
            )}
          </div>
        ))}
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-500">
          Working Details
        </h2>

        <label className="block">
          <span className="font-normal">Work Address</span>
          <input
            {...register("workAddress", {
              required: "Work Address is required",
            })}
            placeholder="Enter your work address"
            className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder-gray-500 border-gray-300"
          />
          {errors.workAddress && (
            <p className="text-red-500 text-sm">
              {String(errors.workAddress.message)}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-normal">Work City</span>
          <input
            {...register("workCity", { required: "Work City is required" })}
            placeholder="Enter your work city"
            className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-400 focus:outline-none placeholder-gray-500 border-gray-300"
          />
          {errors.workCity && (
            <p className="text-red-500 text-sm">
              {String(errors.workCity.message)}
            </p>
          )}
        </label>

        <label className="block">
          <span className="font-normal">Qualification</span>
          <select
            {...register("qualification", {
              required: "Qualification is required",
            })}
            className="w-full border p-3 rounded-lg focus:ring-1 focus:ring-blue-400 focus:outline-none border-gray-500"
          >
            <option value="">Select Qualification</option>
            <option value="10th Pass">10th Pass</option>
            <option value="12th Pass">12th Pass</option>
            <option value="Graduation">Graduation</option>
          </select>
          {errors.qualification && (
            <p className="text-red-500 text-sm">
              {String(errors.qualification.message)}
            </p>
          )}
        </label>

        <fieldset className="border p-2 rounded-lg border-gray-500">
          <legend className="font-normal">Employment Type</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register("employmentType", {
                  required: "Employment Type is required",
                })}
                value="Part Time"
              />
              <span>Part Time</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register("employmentType", {
                  required: "Employment Type is required",
                })}
                value="Full Time"
              />
              <span>Full Time</span>
            </label>
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            onChange={(e) => setIsAbove18(e.target.checked)}
          />
          Are you above 18 years old?
        </label>

        <button
          type="submit"
          disabled={!isAbove18 || submitting}
          className="bg-blue-500 text-white p-2 rounded text-center font-semibold disabled:bg-gray-400"
        >
          {submitting ? "Submitting..." : "Next"}
        </button>
      </form>
    </div>
  );
}