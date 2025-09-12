import { Types } from "mongoose";

export interface CountryProps{
    _id: string | Types.ObjectId;
    name: string;
    capital?: string;
    code?: string;
    calling_code?: string;
    flag?: string;
    status: boolean;
    displayOrder?: number;
}

export interface StateProps{
    _id: string | Types.ObjectId;
    country_id: string | Types.ObjectId;
    name: string;
    major: boolean;
    status: boolean;
    displayOrder?: number;
}

export interface CityProps{
    _id: string | Types.ObjectId;
    state_id: string | Types.ObjectId;
    name: string;
    major: boolean;
    status: boolean;
    displayOrder?: number;
}

export interface PopulatedStateProps extends Omit<StateProps, 'country_id'> {
  country_id?: CountryProps;
}

export interface PopulatedCityProps extends Omit<CityProps, 'state_id'> {
  state_id: StateProps & { country_id?: CountryProps };
}

export function isPopulatedCityProps(row: CityProps | PopulatedCityProps): row is PopulatedCityProps {
  return typeof row.state_id === 'object' && 'country_id' in row.state_id;
}

export interface AddressProps {
  _id?: string | Types.ObjectId;
  user_id?: string | Types.ObjectId;
  first_name: string;
  last_name?: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  city_id: string | Types.ObjectId;
  address1: string;
  address2?: string;
  pin: string;
  landmark?: string;
  company?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Country {
  _id: string;
  name: string;
}

export interface State {
  _id: string;
  name: string;
  country_id: Country;
}

export interface City {
  _id: string;
  name: string;
  state_id: State;
}

export interface FullAddressProps {
  company?: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  address1: string;
  address2?: string;
  landmark?: string;
  pin: string;
  city_id: City;
}


