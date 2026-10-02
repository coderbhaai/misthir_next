export interface MediaProps {
  _id: string;
  media?: string;
  alt: string;
  path: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface MediaHubProps {
  _id: string;
  media_id: string | MediaProps;
}

export interface SingleMediaProps {
  _id: string;
  alt: string;
  path?: string;
  createdAt?: string | Date;
  updatedAt?: Date;
  media?: string | MediaProps;
  media_id?: string | MediaProps;
  user_id?: string | null;
}