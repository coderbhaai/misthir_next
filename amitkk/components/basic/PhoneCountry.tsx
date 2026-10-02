"use client";

import React, { useEffect, useRef, useState } from "react";
import SingleAsyncDropdown from "@amitkk/components/admin/SingleAsyncDropdown";
import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";

export type Country = {
  _id: string;
  name: string;
  code: string;
  calling_code: string;
  flag?: string;
  phone_length?: number;
};

interface Props {
  onChange: (data: {
    country: Country | null;
    phone: string;
    isValid: boolean;
  }) => void;
  disabled?: boolean;
}

export default function PhoneCountry({ onChange, disabled }: Props) {
  const [countryList, setCountryList] = useState<Country[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const country = countryList.find((c) => c._id === selectedCountryId) || null;
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await apiRequest("GET", "address/address?function=get_country_options");
        const clean: Country[] = (res?.data || []).map((c: any) => ({
          _id: String(c._id),
          name: c.name ?? "",
          code: c.code ?? "",
          calling_code: String(c.calling_code ?? ""),
          flag: c.flag ?? undefined,
          phone_length: c.phone_length ?? undefined,
        }));

        setCountryList(clean);
      } catch (err) {
        console.error("Failed to load country options", err);
      }
    };

    loadCountries();
  }, []);

  // 2. IP / URL Auto-Detection
  const hasDetected = useRef(false);

  useEffect(() => {
    if (!countryList.length || hasDetected.current) return;

    hasDetected.current = true;

    const detectCountry = async () => {
      try {
        const forced = new URLSearchParams(window.location.search).get("country");

        if (forced) {
          const found = countryList.find(
            (c) => c.code.toLowerCase() === forced.toLowerCase()
          );
          if (found) {
            setSelectedCountryId(found._id);
            return;
          }
        }

        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();

        const found = countryList.find(
          (c) => c.code.toLowerCase() === ipData.country_code?.toLowerCase()
        );

        if (found) {
          setSelectedCountryId(found._id);
        }
      } catch (err) {
        console.log("IP detection failed", err);
      }
    };

    detectCountry();
  }, [countryList]);

  // 3. Validation Logic
  const validatePhone = () => {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, "");

    if (!country || !country.phone_length) {
      return digits.length >= 7;
    }

    return digits.length === country.phone_length;
  };

  const isInvalid = Boolean(phone) && !validatePhone();

  // 4. Trigger Parent Change Handler
  useEffect(() => {
    onChange({ country, phone, isValid: validatePhone() });
  }, [country, phone]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full items-start">
      {/* Country Selection using SingleAsyncDropdown */}
      <div className="w-full sm:w-1/2">
        <SingleAsyncDropdown<Country>
          value={selectedCountryId}
          onChange={(id) => setSelectedCountryId(id)}
          disabled={disabled}
          label="Country"
          endpoint="address/address"
          listFunction="get_country_options"
          singleFunction="get_country_options"
          options={countryList}
          getOptionLabel={(o) => `${o?.name || ""} (${o?.calling_code || ""})`}
        />
      </div>

      {/* Phone Input Box */}
      <div className="w-full sm:w-1/2">
        <div className="relative w-full">
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            disabled={disabled}
            placeholder=""
            onChange={(e) => {
              const value = e.target.value;
              if (!/^\+?\d*$/.test(value)) return;
              setPhone(value);
            }}
            style={{
              display: "block",
              height: "56px",
              width: "100%",
              borderRadius: "12px",
              border: `1px solid ${isInvalid ? "#ef4444" : "#d1d5db"}`,
              backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
              color: disabled ? "#9ca3af" : "#111827",
              paddingLeft: "16px",
              paddingRight: "16px",
              fontSize: "14px",
              outline: "none",
              cursor: disabled ? "not-allowed" : "text",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />

          <label
            style={{
              position: "absolute",
              left: "12px",
              background: "#fff",
              padding: "0 6px",
              transition: "all 0.2s ease",
              pointerEvents: "none",
              color: isInvalid ? "#ef4444" : "#6b7280",
              fontSize: phone ? "12px" : "14px",
              top: phone ? "-8px" : "50%",
              transform: phone ? "none" : "translateY(-50%)",
              zIndex: 10,
            }}
          >
            Phone Number
          </label>
        </div>

        {isInvalid && (
          <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
            Invalid phone number
          </span>
        )}
      </div>
    </div>
  );
}