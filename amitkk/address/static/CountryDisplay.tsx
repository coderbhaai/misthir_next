import React from "react";

interface CountryProps {
  _id: string;
  name: string;
}

interface CountriesProps {
  countries?: CountryProps[];
  className?: string;
}

const CountryDisplay: React.FC<CountriesProps> = ({ countries, className = "" }) => {
  if (!countries || countries.length === 0) return null;

  return (
    <div className={`mt-2 flex items-center flex-wrap gap-x-2 text-sm text-gray-500 ${className}`}>
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18M3 12h18M3 19h18" /></svg>

      <span className="flex flex-wrap gap-x-1">
        {countries.map((country, index) => (
          <span key={country._id}>{country.name} {index !== countries.length - 1 && ( <span className="text-gray-400">, </span> )}</span>
        ))}
      </span>
    </div>
  );
};

export default CountryDisplay;
