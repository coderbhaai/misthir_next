// amitkk > address > types > index.ts

import { UserProps } from "@amitkk/basic/types/user";

export interface CountryProps {
  _id: string;
  name: string;
  capital?: string;
  code?: string;
  calling_code?: string;
  flag?: string;
  status: boolean;
  site: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StateProps {
  _id: string;
  country_id: string | CountrySummaryProps;
  name: string;
  major: boolean;
  status: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CityProps {
  _id: string;
  country_id: string | CountrySummaryProps;
  state_id: string | StateSummaryProps;

  name: string;
  major: boolean;
  status: boolean;
  displayOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CountrySummaryProps {
  _id: string;
  name: string;
}

export interface StateSummaryProps {
  _id: string;
  name: string;
  country_id?: string | CountrySummaryProps;
}

export interface CitySummaryProps {
  _id: string;
  name: string;
  state_id?: string | StateSummaryProps;
}

export interface PopulatedStateProps
  extends Omit<StateProps, "country_id"> {
  country_id: CountrySummaryProps;
}

export interface PopulatedCityProps
  extends Omit<CityProps, "state_id" | "country_id"> {
  country_id: CountrySummaryProps;

  state_id: StateSummaryProps & {
    country_id?: CountrySummaryProps;
  };
}

export interface AddressProps {
  _id: string;
  country_id: string | CountryProps;
  state_id: string | StateProps;
  city_id: string | CityProps;
  city_new?: string;
  user_id?: string | UserProps;
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  address1: string;
  address2?: string;
  pin: string;
  landmark?: string;
  company?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FullAddressProps {
  company?: string;
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  address1: string;
  address2?: string;
  landmark?: string;
  pin: string;
  city_id: CitySummaryProps & {
    state_id?: StateSummaryProps & {
      country_id?: CountrySummaryProps;
    };
  };
}