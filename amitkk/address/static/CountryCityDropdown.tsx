// CountryCityDropdown.tsx

import React from "react";

import SingleCountryDropdown from "./SingleCountryDropdown";
import MultiCountryDropdown from "./MultiCountryDropdown";

import SingleCityDropdown from "./SingleCityDropdown";
import MultiCityDropdown from "./MultiCityDropdown";

interface SingleOptionProps {
  _id: string;
  name?: string;
}

type Props = {
  country_options?: SingleOptionProps[];
  country: string | string[];
  city: string | string[];

  nameCountry: string;
  nameCity: string;

  onChange: (
    name: string,
    value: any
  ) => void;

  countryMultiple?: boolean;
  cityMultiple?: boolean;

  requiredCountry?: boolean;
  requiredCity?: boolean;
};

const CountryCityDropdown: React.FC<Props> = ({
  country_options,
  country,
  city,
  nameCountry,
  nameCity,
  onChange,
  countryMultiple = false,
  cityMultiple = false,
  requiredCountry = false,
  requiredCity = false,
}) => {
  const normalizedCountry = React.useMemo(() => {
    if (countryMultiple) {
      if (Array.isArray(country)) {
        return country.filter(Boolean);
      }

      return country ? [country] : [];
    }

    if (Array.isArray(country)) {
      return country[0] || "";
    }

    return country || "";

  }, [country, countryMultiple]);

  const normalizedCity = React.useMemo(() => {
    if (cityMultiple) {
      if (Array.isArray(city)) {
        return city.filter(Boolean);
      }

      return city ? [city] : [];
    }

    if (Array.isArray(city)) {
      return city[0] || "";
    }

    return city || "";

  }, [city, cityMultiple]);

  const isCountryEmpty =
    !normalizedCountry ||
    (
      Array.isArray(normalizedCountry) &&
      normalizedCountry.length === 0
    );

  const handleCountryChange = (value: any) => {
    onChange(nameCountry, value);
    onChange(nameCity, cityMultiple ? [] : "");
  };

  const handleCityChange = (value: any) => {
    onChange(nameCity, value);
  };

  return (
    <div className="row">
      <div className="col-span-12 md:col-span-6">
        {countryMultiple ? (
          <MultiCountryDropdown value={normalizedCountry as string[]} onChange={handleCountryChange} required={requiredCountry}/>
        ) : (
          <SingleCountryDropdown options={country_options} value={normalizedCountry as string} onChange={handleCountryChange} required={requiredCountry}/>
        )}
      </div>
      <div className="col-span-12 md:col-span-6">
        {cityMultiple ? (
          <MultiCityDropdown countryId={normalizedCountry as string[]} value={normalizedCity as string[]} onChange={handleCityChange} required={requiredCity} disabled={isCountryEmpty} />
        ) : (
          <SingleCityDropdown countryId={normalizedCountry as string} value={normalizedCity as string} onChange={handleCityChange} required={requiredCity} disabled={isCountryEmpty} />
        )}
      </div>
    </div>
  );
};

export default CountryCityDropdown;