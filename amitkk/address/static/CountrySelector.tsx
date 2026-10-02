import CountryFlag from "@amitkk/basic/static/CountryFlag";
import { CountryProps } from "../types";

interface CountrySelectorProps {
  countries: CountryProps[];
  selectedCountryId?: string;
  onChange: (countryId: string) => void;
}

export default function CountrySelector({ countries, selectedCountryId, onChange }: CountrySelectorProps) {
  return (
    <div className="flex justify-center py-3 md:py-5">
      <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-1">
        {countries.map((country) => {
          const isActive = country._id === selectedCountryId;

          return (
            <button key={country._id} onClick={() => onChange(country._id)}
              className={`flex items-center gap-2 rounded border whitespace-nowrap px-3 md:px-6 py-2 md:py-3
                ${ isActive ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100" }`}>
              <CountryFlag flag={country.flag} width={28} height={18} />
              <span className="text-sm md:text-base font-medium">{country.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
