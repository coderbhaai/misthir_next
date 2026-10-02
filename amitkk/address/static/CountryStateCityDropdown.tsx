import React, { useEffect, useState } from "react";
import { FlexibleValue } from "@amitkk/basic/types";
import MultiCountryDropdown from "./MultiCountryDropdown";
import SingleCountryDropdown from "./SingleCountryDropdown";
import MultiCityDropdown from "./MultiCityDropdown";
import SingleCityDropdown from "./SingleCityDropdown";
import SingleStateDropdown from "./SingleStateDropdown";
import MultiStateDropdown from "./MutliStateDropdown";

type Props = {
  vertical ?: boolean;
  fullWidth ?: boolean;

  country:FlexibleValue<any>;
  nameCountry: string;
  countryMultiple?: boolean;
  requiredCountry?: boolean;

  state:FlexibleValue<any>;
  nameState: string;
  stateMultiple?: boolean;
  requiredState?: boolean;

  city:FlexibleValue<any>;
  nameCity: string;
  cityMultiple?: boolean;
  requiredCity?: boolean;

  onChange: (name: string, value: any) => void;
};

const CountryStateCityDropdown: React.FC<Props> = ({
  vertical = false,
  fullWidth = false,

  country,
  nameCountry,
  countryMultiple = false,
  requiredCountry,
  
  state,
  nameState,
  stateMultiple = false,
  requiredState,
  
  city,
  nameCity,
  cityMultiple = false,
  requiredCity,
  
  onChange,
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
    
  useEffect(() => {
    if (!country || (Array.isArray(country) && country.length === 0)) {
      onChange(nameState, stateMultiple ? [] : "");
      onChange(nameCity, cityMultiple ? [] : "");
    }
  }, [country]);

  useEffect(() => {
    if (!state || (Array.isArray(state) && state.length === 0)) {
      onChange(nameCity, cityMultiple ? [] : "");
    }
  }, [state]);

  // ✅ Handlers
  const handleCountryChange = (value: any) => {
    onChange(nameCountry, value);
    onChange(nameState, stateMultiple ? [] : "");
    onChange(nameCity, cityMultiple ? [] : "");
  };

  const handleStateChange = (value: any) => {
    onChange(nameState, value);
    onChange(nameCity, cityMultiple ? [] : "");
  };

  const handleCityChange = (value: any) => {
    onChange(nameCity, value);
  };

  const isCountryEmpty = !country || (Array.isArray(country) && country.length === 0);
  const isStateEmpty = !state || (Array.isArray(state) && state.length === 0);

  return (
    <div className={!vertical ? 'row' : ''}>
      <div className={!vertical ? 'col-span-12 md:col-span-4': ''}>
        {countryMultiple ? (
          <MultiCountryDropdown value={normalizedCountry} onChange={handleCountryChange} required={requiredCountry}/>
        ) : (
          <SingleCountryDropdown value={normalizedCountry} onChange={handleCountryChange} required={requiredCountry}/>
        )}
      </div>

      <div className={!vertical ? 'col-span-12 md:col-span-4': ''}>
        {stateMultiple ? (
          <MultiStateDropdown value={state} countryId={country} onChange={handleStateChange} required={requiredState} disabled={isCountryEmpty}/>
        ) : (
          <SingleStateDropdown value={state} countryId={country} onChange={handleStateChange} required={requiredState} disabled={isCountryEmpty}/>
        )}
      </div>

      <div className={!vertical ? 'col-span-12 md:col-span-4': ''}>
        {cityMultiple ? (
          <MultiCityDropdown value={city} countryId={country} stateId={state} onChange={handleCityChange} required={requiredCity} disabled={isCountryEmpty || isStateEmpty}/>
        ) : (
          <SingleCityDropdown value={city} countryId={country} stateId={state} onChange={handleCityChange} required={requiredCity} disabled={isCountryEmpty || isStateEmpty} fullWidth={fullWidth}/>
        )}
      </div>
    </div>
  );
};

export default CountryStateCityDropdown;