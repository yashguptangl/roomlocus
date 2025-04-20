"use client";
import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

interface ComboBoxProps {
  options: string[]; // List of options to be displayed in the dropdown
  placeholder: string; // Placeholder text for the input field
  onChange?: (value: string) => void; // Callback for when the selection changes
}

export default function ComboBox({ options, placeholder, onChange }: ComboBoxProps) {
  return (
    <Autocomplete
      disablePortal
      options={options}
      onChange={(event, newValue) => {
        if (onChange) onChange(newValue || ""); // Call onChange with selected value
      }}
      sx={{
        width: "100%",
        maxWidth: "24rem", // Matches sm:w-96
        "& .MuiOutlinedInput-root": {
          padding: "8px", // Matches p-2
          borderRadius: "8px", // Matches rounded-lg
          border: "1px solid #ccc", // Matches border
          "& fieldset": {
            border: "none", // Remove Material-UI's default border
          },
          "&:hover": {
            borderColor: "#888", // Optional hover effect
          },
          "&.Mui-focused": {
            borderColor: "#000", // Focus border color
          },
        },
        "& .MuiAutocomplete-inputRoot": {
          padding: "3px", // Adjust inner padding
        },
        "& .MuiInputBase-input": {
          fontSize: "16px", // Adjust font size
          outline: "none", // Matches bg-transparent outline-none
        },
      }}
      renderInput={(params) => (
        <TextField 
          {...params} 
          placeholder={placeholder} // Add placeholder here
        />
      )}
    />
  );
}
