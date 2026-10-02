import { AddressProps, CountryProps, PopulatedCityProps } from "@amitkk/address/types";

export function getCountryNameFromCity(row: PopulatedCityProps): string {
  if (typeof row.state_id === 'object' && row.state_id.country_id) {
    return row.state_id.country_id.name || '-';
  }
  return '-';
}

export function isPopulatedCountryProps( country: any ): country is CountryProps {
  return typeof country === 'object' && country !== null && typeof country.name === 'string';
}

export function fullAddress(row?: AddressProps | null): string | null {
  if (!row) return null;
  
  const suffix = ', ';
  const notEmpty = (value: any, suffix: string) => (value ? value + suffix : '');

  const city = typeof row.city_id === 'object' && 'name' in row.city_id ? (row.city_id as any) : undefined;
  const state = city?.state_id as any | undefined;
  const country = state?.country_id as any | undefined;

  let fullAddress = '';
  fullAddress += notEmpty(row.company, suffix);
  const fullName = row.name;
  fullAddress += notEmpty(fullName, suffix);
  fullAddress += notEmpty(row.email, suffix);
  fullAddress += notEmpty(`Phone - ${row.phone}`, suffix);

  if (row.whatsapp) {
    fullAddress += notEmpty(`Whatsapp - ${row.whatsapp}`, suffix);
  }

  fullAddress += notEmpty(row.address1, suffix);
  fullAddress += notEmpty(row.address2, suffix);
  fullAddress += notEmpty(row.landmark, suffix);

  fullAddress += notEmpty((city as any)?.name, suffix);
  fullAddress += notEmpty((state as any)?.name, suffix);
  fullAddress += notEmpty((country as any)?.name, suffix);

  fullAddress += `PIN - ${row.pin}`;

  return fullAddress;
};

export function semiAddress(row?: AddressProps | null): string | null {
  if (!row) return null;
  
  const suffix = ', ';
  const notEmpty = (value: any, suffix: string) => (value ? value + suffix : '');

  const city = typeof row.city_id === 'object' && 'name' in row.city_id ? (row.city_id as any) : undefined;
  const state = city?.state_id as any | undefined;
  const country = state?.country_id as any | undefined;

  let fullAddress = '';
  const fullName = row.name;
  fullAddress += notEmpty(fullName, suffix);

  fullAddress += notEmpty(row.address1, suffix);
  fullAddress += notEmpty(row.address2, suffix);
  fullAddress += notEmpty(row.landmark, suffix);

  fullAddress += notEmpty((city as any)?.name, suffix);
  fullAddress += notEmpty((state as any)?.name, suffix);
  fullAddress += notEmpty((country as any)?.name, suffix);

  fullAddress += `PIN - ${row.pin}`;

  return fullAddress;
};

export function isCountryProps(value: unknown ): value is CountryProps {
  return (
    typeof value === "object" && value !== null && "calling_code" in value
  );
}

export function getMaskedAddress(row?: AddressProps | null): string | null {
  if (!row) return null;
  
  const suffix = ', ';
  const notEmpty = (value: any, suffix: string) => (value ? value + suffix : '');

  const maskName = (name?: string): string => {
    if (!name) return '';
    return name.split(' ').map(part => {
        if (!part) return '';
        return part[0].toUpperCase() + '*'.repeat(part.length - 1);
      }).join(' ');
  };

  const city = typeof row.city_id === 'object' && 'name' in row.city_id ? (row.city_id as any) : undefined;
  const state = city?.state_id as any | undefined;
  const country = state?.country_id as any | undefined;

  let fullAddress = '';  
  const maskedName = maskName(row.name);
  fullAddress += notEmpty(maskedName, suffix);  
  fullAddress += notEmpty(row.landmark, suffix);
  fullAddress += notEmpty((city as any)?.name, suffix);
  fullAddress += notEmpty((state as any)?.name, suffix);
  fullAddress += notEmpty((country as any)?.name, suffix);
  fullAddress += `PIN - ${row.pin}`;
  return fullAddress;
};