import { AddressProps, CountryProps, PopulatedCityProps } from "@amitkk/address/types/address";

export function getCountryNameFromCity(row: PopulatedCityProps): string {
  if (typeof row.state_id === 'object' && row.state_id.country_id) {
    return row.state_id.country_id.name || '-';
  }
  return '-';
}

export function isPopulatedCountryProps(
  country: any
): country is CountryProps {
  return typeof country === 'object' && country !== null && typeof country.name === 'string';
}

export function fullAddress(row: AddressProps): string {
  const suffix = ', ';
  const notEmpty = (value: any, suffix: string) => (value ? value + suffix : '');

  const city = typeof row.city_id === 'object' && 'name' in row.city_id ? (row.city_id as any) : undefined;
  const state = city?.state_id as any | undefined;
  const country = state?.country_id as any | undefined;

  let fullAddress = '';
  fullAddress += notEmpty(row.company, suffix);
  const fullName = row.last_name ? `${row.first_name} ${row.last_name}` : row.first_name;
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
