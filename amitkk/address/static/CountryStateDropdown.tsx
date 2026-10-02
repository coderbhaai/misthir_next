import React, { useEffect } from "react";
import StateDropdown from "./SingleStateDropdown";
import MultiCountryDropdown from "./MultiCountryDropdown";
import SingleCountryDropdown from "./SingleCountryDropdown";

type Props = {
  country: string | string[];
  nameCountry: string;
  countryMultiple?: boolean;
  requiredCountry?: boolean;

  state: string | string[];
  nameState: string;
  stateMultiple?: boolean;
  requiredState?: boolean;
  stateRefreshKey?: number;
  
  onChange: (name: string, value: any) => void;
};

const CountryStateDropdown: React.FC<Props> = ({
  country,
  nameCountry,
  countryMultiple = false,
  requiredCountry,

  state,
  nameState,
  stateMultiple = false,
  requiredState,

  stateRefreshKey,
  onChange,
}) => {

  useEffect(() => {
    if (!country || (Array.isArray(country) && country.length === 0)) {
      onChange(nameState, stateMultiple ? [] : "");
    }
  }, [country]);

  const handleCountryChange = (value: any) => {
    onChange(nameCountry, value);
    onChange(nameState, stateMultiple ? [] : "");
  };

  const handleStateChange = (value: any) => { onChange(nameState, value); };
  const isCountryEmpty = !country || (Array.isArray(country) && country.length === 0);

  return (
    <>
      {countryMultiple ? (
        <MultiCountryDropdown value={country as string[]} onChange={handleCountryChange} required={requiredCountry}/>
      ) : (
        <SingleCountryDropdown value={country as string} onChange={handleCountryChange} required={requiredCountry}/>
      )}

      {stateMultiple ? (
        <StateDropdown countryId={country as string[]} value={state as string[]} onChange={handleStateChange} multiple required={requiredState} disabled={isCountryEmpty}/>
      ) : (
        <StateDropdown countryId={country as string} value={state as string} onChange={handleStateChange} required={requiredState} disabled={isCountryEmpty}/>
      )}
    </>
  );
};

export default CountryStateDropdown;